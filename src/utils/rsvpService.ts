/**
 * Real-time Multi-Device RSVP Synchronization Service
 * Handles cross-device Server-Sent Events (SSE), background REST persistence,
 * fast fallback polling, and local BroadcastChannel for instant same-browser updates.
 */

import { GuestRsvp, PublicSite } from '../types/invitation';

export interface RsvpEventPayload {
  type: 'NEW_RSVP' | 'DELETE_RSVP' | 'CLEAR_RSVPS' | 'SITES_UPDATED' | 'SYNC_ALL_RSVPS';
  siteId: string;
  rsvp?: GuestRsvp;
  rsvpId?: string;
  sites?: PublicSite[];
  allRsvps?: Array<{ siteId: string } & GuestRsvp>;
  timestamp: number;
}

const BROADCAST_CHANNEL_NAME = 'blessed_milestones_rsvp_channel';

// Singleton BroadcastChannel for same-browser instant sync
let channel: BroadcastChannel | null = null;
try {
  if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
    channel = new BroadcastChannel(BROADCAST_CHANNEL_NAME);
  }
} catch {
  // BroadcastChannel not available
}

/**
 * Broadcast an RSVP event to local tabs AND persist to server database
 */
export async function broadcastRsvpEvent(payload: RsvpEventPayload): Promise<void> {
  // 1. Post to local BroadcastChannel for zero-latency same-browser tabs
  if (channel) {
    try {
      channel.postMessage(payload);
    } catch {
      // Ignore
    }
  }

  // 2. Transmit to server database for multi-device synchronization
  try {
    if (payload.type === 'NEW_RSVP' && payload.rsvp) {
      await fetch('/api/rsvps', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          siteId: payload.siteId,
          ...payload.rsvp,
        }),
      });
    } else if (payload.type === 'DELETE_RSVP' && payload.rsvpId) {
      await fetch(`/api/rsvps/${payload.rsvpId}?siteId=${encodeURIComponent(payload.siteId)}`, {
        method: 'DELETE',
      });
    } else if (payload.type === 'CLEAR_RSVPS') {
      await fetch(`/api/rsvps?siteId=${encodeURIComponent(payload.siteId)}`, {
        method: 'DELETE',
      });
    }
  } catch (err) {
    console.warn('Network sync error in broadcastRsvpEvent:', err);
  }
}

/**
 * Subscribe to RSVP events from all sources:
 * 1) Server-Sent Events (SSE) from the backend server (across all devices!)
 * 2) Same-browser BroadcastChannel
 * 3) Active heartbeat polling every 3.5s to guarantee 100% reliability on mobile networks
 */
export function subscribeToRsvpEvents(
  onEvent: (payload: RsvpEventPayload) => void
): () => void {
  let isCleanedUp = false;
  let eventSource: EventSource | null = null;
  let pollTimer: any = null;

  // 1. BroadcastChannel listener (same machine tabs)
  const handleBcMessage = (event: MessageEvent<RsvpEventPayload>) => {
    if (event.data && event.data.type) {
      onEvent(event.data);
    }
  };
  channel?.addEventListener('message', handleBcMessage);

  // 2. Server-Sent Events (SSE) listener (all devices!)
  const connectSSE = () => {
    if (isCleanedUp || typeof window === 'undefined') return;

    try {
      eventSource = new EventSource('/api/events');

      eventSource.addEventListener('NEW_RSVP', (e: MessageEvent) => {
        try {
          const data = JSON.parse(e.data);
          onEvent({
            type: 'NEW_RSVP',
            siteId: data.siteId,
            rsvp: data.rsvp,
            timestamp: data.timestamp || Date.now(),
          });
        } catch {}
      });

      eventSource.addEventListener('DELETE_RSVP', (e: MessageEvent) => {
        try {
          const data = JSON.parse(e.data);
          onEvent({
            type: 'DELETE_RSVP',
            siteId: data.siteId,
            rsvpId: data.rsvpId,
            timestamp: data.timestamp || Date.now(),
          });
        } catch {}
      });

      eventSource.addEventListener('CLEAR_RSVPS', (e: MessageEvent) => {
        try {
          const data = JSON.parse(e.data);
          onEvent({
            type: 'CLEAR_RSVPS',
            siteId: data.siteId,
            timestamp: data.timestamp || Date.now(),
          });
        } catch {}
      });

      eventSource.addEventListener('SITES_UPDATED', (e: MessageEvent) => {
        try {
          const data = JSON.parse(e.data);
          onEvent({
            type: 'SITES_UPDATED',
            siteId: '',
            sites: data.sites,
            timestamp: data.timestamp || Date.now(),
          });
        } catch {}
      });

      eventSource.onerror = () => {
        // Automatically reconnect after delay if disconnected
        eventSource?.close();
        if (!isCleanedUp) {
          setTimeout(connectSSE, 4000);
        }
      };
    } catch {
      // EventSource not supported or blocked
    }
  };

  connectSSE();

  // 3. Robust background poll: Checks server for new RSVPs every 2.5 seconds
  // Ensures updates appear even if SSE connection drops or is throttled by mobile sleep
  let lastKnownRsvpIds = new Set<string>();
  let lastKnownRsvpsJson = '';

  const pollServer = async () => {
    if (isCleanedUp) return;
    try {
      const res = await fetch('/api/rsvps');
      if (res.ok) {
        const items = await res.json();
        if (Array.isArray(items)) {
          const currentJson = JSON.stringify(items);
          if (currentJson !== lastKnownRsvpsJson) {
            lastKnownRsvpsJson = currentJson;

            // Detect newly added items
            for (const item of items) {
              if (lastKnownRsvpIds.size > 0 && !lastKnownRsvpIds.has(item.id)) {
                const { siteId, ...rsvp } = item;
                onEvent({
                  type: 'NEW_RSVP',
                  siteId,
                  rsvp,
                  timestamp: Date.now(),
                });
              }
            }

            // Sync the full list
            lastKnownRsvpIds = new Set(items.map((i: any) => i.id));
            onEvent({
              type: 'SYNC_ALL_RSVPS',
              siteId: '',
              allRsvps: items,
              timestamp: Date.now(),
            });
          }
        }
      }
    } catch {
      // Ignore transient network errors
    }

    if (!isCleanedUp) {
      pollTimer = setTimeout(pollServer, 2500);
    }
  };

  pollTimer = setTimeout(pollServer, 1000);

  // Return cleanup function
  return () => {
    isCleanedUp = true;
    channel?.removeEventListener('message', handleBcMessage);
    if (eventSource) {
      eventSource.close();
      eventSource = null;
    }
    if (pollTimer) {
      clearTimeout(pollTimer);
    }
  };
}

/**
 * Fetch server-saved RSVPs to merge on initial load
 */
export async function fetchServerRsvps(): Promise<Array<{ siteId: string } & GuestRsvp>> {
  try {
    const res = await fetch('/api/rsvps');
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data)) {
        return data;
      }
    }
  } catch (err) {
    console.warn('Error fetching server RSVPs:', err);
  }
  return [];
}

/**
 * Fetch all sites from server database
 */
export async function fetchServerSites(): Promise<PublicSite[] | null> {
  try {
    const res = await fetch('/api/sites');
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        return data;
      }
    }
  } catch (err) {
    console.warn('Error fetching server sites:', err);
  }
  return null;
}

/**
 * Save / sync all sites to server database
 */
export async function saveServerSites(sites: PublicSite[]): Promise<boolean> {
  try {
    const res = await fetch('/api/sites', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(sites),
    });
    return res.ok;
  } catch (err) {
    console.warn('Error saving sites to server:', err);
    return false;
  }
}
