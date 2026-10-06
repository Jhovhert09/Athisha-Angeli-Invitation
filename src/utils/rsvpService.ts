/**
 * Real-time RSVP Synchronization Service
 * Handles cross-tab BroadcastChannel communication, storage events, and server persistence.
 */

import { GuestRsvp } from '../types/invitation';

export interface RsvpEventPayload {
  type: 'NEW_RSVP' | 'DELETE_RSVP' | 'CLEAR_RSVPS';
  siteId: string;
  rsvp?: GuestRsvp;
  rsvpId?: string;
  timestamp: number;
}

const BROADCAST_CHANNEL_NAME = 'blessed_milestones_rsvp_channel';

// Singleton BroadcastChannel instance
let channel: BroadcastChannel | null = null;
try {
  if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
    channel = new BroadcastChannel(BROADCAST_CHANNEL_NAME);
  }
} catch {
  // BroadcastChannel not supported in this context
}

/**
 * Broadcast an RSVP event to all open tabs and windows
 */
export function broadcastRsvpEvent(payload: RsvpEventPayload) {
  if (channel) {
    try {
      channel.postMessage(payload);
    } catch {
      // Ignore broadcast errors
    }
  }

  // Also notify server API in background if running
  if (payload.type === 'NEW_RSVP' && payload.rsvp) {
    try {
      fetch('/api/rsvps', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          siteId: payload.siteId,
          ...payload.rsvp,
        }),
      }).catch(() => {
        // Server API optional fallback
      });
    } catch {
      // Ignore fetch errors
    }
  }
}

/**
 * Subscribe to RSVP events from other tabs or windows
 */
export function subscribeToRsvpEvents(
  onEvent: (payload: RsvpEventPayload) => void
): () => void {
  if (!channel) return () => {};

  const handleMessage = (event: MessageEvent<RsvpEventPayload>) => {
    if (event.data && event.data.type) {
      onEvent(event.data);
    }
  };

  channel.addEventListener('message', handleMessage);

  return () => {
    channel?.removeEventListener('message', handleMessage);
  };
}

/**
 * Fetch server-saved RSVPs (if any) to merge
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
  } catch {
    // Ignore server error
  }
  return [];
}
