/**
 * Real-time Multi-Device RSVP Synchronization Service
 * Handles cross-device Server-Sent Events (SSE), background REST persistence,
 * fast mobile-friendly polling, tab focus syncing, and local BroadcastChannel.
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

// Singleton BroadcastChannel for same-browser instant sync across open tabs
let channel: BroadcastChannel | null = null;
try {
  if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
    channel = new BroadcastChannel(BROADCAST_CHANNEL_NAME);
  }
} catch {
  // BroadcastChannel not available in older environments
}

/**
 * Submit or update an RSVP on the server database.
 * Returns confirmation with the saved RSVP data.
 */
export async function submitRsvpToServer(
  siteId: string,
  rsvp: GuestRsvp
): Promise<{ success: boolean; rsvp?: GuestRsvp; siteId?: string; error?: string }> {
  try {
    const res = await fetch('/api/rsvps', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        siteId,
        ...rsvp,
      }),
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      return { success: false, error: errData.error || `Server responded with status ${res.status}` };
    }

    const data = await res.json();
    const confirmedRsvp: GuestRsvp = data.rsvp || rsvp;
    const confirmedSiteId: string = data.siteId || siteId;

    // Immediately notify local BroadcastChannel for instant same-browser update
    if (channel) {
      try {
        channel.postMessage({
          type: 'NEW_RSVP',
          siteId: confirmedSiteId,
          rsvp: confirmedRsvp,
          timestamp: Date.now(),
        });
      } catch {}
    }

    return { success: true, rsvp: confirmedRsvp, siteId: confirmedSiteId };
  } catch (err: any) {
    console.error('Network error submitting RSVP to server:', err);
    return { success: false, error: err?.message || 'Network connection failed' };
  }
}

/**
 * Delete a specific RSVP from the server database
 */
export async function deleteRsvpFromServer(rsvpId: string, siteId?: string): Promise<boolean> {
  try {
    const url = siteId
      ? `/api/rsvps/${encodeURIComponent(rsvpId)}?siteId=${encodeURIComponent(siteId)}`
      : `/api/rsvps/${encodeURIComponent(rsvpId)}`;
    const res = await fetch(url, { method: 'DELETE' });
    if (res.ok && channel) {
      try {
        channel.postMessage({
          type: 'DELETE_RSVP',
          siteId: siteId || '',
          rsvpId,
          timestamp: Date.now(),
        });
      } catch {}
    }
    return res.ok;
  } catch (err) {
    console.warn('Error deleting RSVP from server:', err);
    return false;
  }
}

/**
 * Clear all RSVPs for a specific site from server database
 */
export async function clearRsvpsFromServer(siteId: string): Promise<boolean> {
  try {
    const res = await fetch(`/api/rsvps?siteId=${encodeURIComponent(siteId)}`, {
      method: 'DELETE',
    });
    if (res.ok && channel) {
      try {
        channel.postMessage({
          type: 'CLEAR_RSVPS',
          siteId,
          timestamp: Date.now(),
        });
      } catch {}
    }
    return res.ok;
  } catch (err) {
    console.warn('Error clearing RSVPs on server:', err);
    return false;
  }
}

/**
 * Broadcast an RSVP event (delegates to server REST and BroadcastChannel)
 */
export async function broadcastRsvpEvent(payload: RsvpEventPayload): Promise<void> {
  if (channel) {
    try {
      channel.postMessage(payload);
    } catch {}
  }

  try {
    if (payload.type === 'NEW_RSVP' && payload.rsvp) {
      await submitRsvpToServer(payload.siteId, payload.rsvp);
    } else if (payload.type === 'DELETE_RSVP' && payload.rsvpId) {
      await deleteRsvpFromServer(payload.rsvpId, payload.siteId);
    } else if (payload.type === 'CLEAR_RSVPS' && payload.siteId) {
      await clearRsvpsFromServer(payload.siteId);
    }
  } catch (err) {
    console.warn('Error broadcasting RSVP event:', err);
  }
}

/**
 * Subscribe to RSVP events from all sources:
 * 1) Server-Sent Events (SSE) from the backend server (across all devices!)
 * 2) Same-browser BroadcastChannel (zero-latency tabs)
 * 3) Active background polling every 2.0s for mobile networks
 * 4) Event listeners for page visibilitychange, window focus, and online events
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
      if (eventSource) {
        eventSource.close();
      }
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
          setTimeout(connectSSE, 3000);
        }
      };
    } catch {
      // EventSource not supported
    }
  };

  connectSSE();

  // 3. Robust background poll: Checks server for new RSVPs every 2.0 seconds
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

            // Broadcast the full updated list
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
      pollTimer = setTimeout(pollServer, 2000);
    }
  };

  pollTimer = setTimeout(pollServer, 800);

  // 4. Mobile screen wake / tab focus handlers: poll immediately when user switches back to browser
  const handleVisibilityChange = () => {
    if (document.visibilityState === 'visible') {
      pollServer();
    }
  };

  const handleWindowFocus = () => {
    pollServer();
  };

  const handleOnline = () => {
    connectSSE();
    pollServer();
  };

  if (typeof window !== 'undefined') {
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleWindowFocus);
    window.addEventListener('online', handleOnline);
  }

  // Return cleanup function
  return () => {
    isCleanedUp = true;
    channel?.removeEventListener('message', handleBcMessage);
    if (typeof window !== 'undefined') {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleWindowFocus);
      window.removeEventListener('online', handleOnline);
    }
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
 * Save / sync sites to server database
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
