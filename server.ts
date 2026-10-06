/**
 * Full-Stack Express Server with Real-time Multi-Device RSVP Synchronization
 * Provides persistent database storage for sites and RSVPs, plus Server-Sent Events (SSE).
 */

import express, { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { PublicSite, GuestRsvp } from './src/types/invitation';
import { INITIAL_INVITATION_DATA } from './src/utils/templates';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = __dirname;
const dataDir = path.resolve(rootDir, 'data');
const dbFile = path.resolve(dataDir, 'sites_db.json');

// Initial seed data if database is empty
const INITIAL_RSVPS: GuestRsvp[] = [
  {
    id: 'rsvp_sample_1',
    name: 'Maria Santos',
    attending: true,
    guestCount: 1,
    message: 'So honored to be Godmother to baby Liam! May God shower his life with endless blessings.',
    submittedAt: 'Oct 4, 2026',
  },
  {
    id: 'rsvp_sample_2',
    name: 'Engr. Rafael Reyes',
    attending: true,
    guestCount: 1,
    message: 'Can’t wait to celebrate Liam’s first milestone and sacrament with the family!',
    submittedAt: 'Oct 5, 2026',
  },
];

const DEFAULT_SEED_SITES: PublicSite[] = [
  {
    id: 'site_liam_1',
    slug: 'liam-alexander',
    title: "Liam Alexander's Holy Baptism & 1st Birthday",
    isPublished: true,
    publishedAt: 'Oct 5, 2026',
    createdAt: 'Oct 1, 2026',
    viewCount: 142,
    allowGuestRsvp: true,
    data: INITIAL_INVITATION_DATA,
    rsvps: INITIAL_RSVPS,
  },
];

// Ensure database file exists
function initDatabase(): void {
  try {
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    if (!fs.existsSync(dbFile)) {
      fs.writeFileSync(dbFile, JSON.stringify(DEFAULT_SEED_SITES, null, 2), 'utf-8');
    } else {
      const content = fs.readFileSync(dbFile, 'utf-8');
      const parsed = JSON.parse(content);
      if (!Array.isArray(parsed) || parsed.length === 0) {
        fs.writeFileSync(dbFile, JSON.stringify(DEFAULT_SEED_SITES, null, 2), 'utf-8');
      }
    }
  } catch (err) {
    console.error('Failed to initialize database file:', err);
  }
}

initDatabase();

// In-memory / file-synced helper functions
function readSites(): PublicSite[] {
  try {
    if (fs.existsSync(dbFile)) {
      const raw = fs.readFileSync(dbFile, 'utf-8');
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.error('Error reading sites from db:', err);
  }
  return DEFAULT_SEED_SITES;
}

function writeSites(sites: PublicSite[]): void {
  try {
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    // Atomic safe write
    const tempFile = `${dbFile}.tmp.${Date.now()}`;
    fs.writeFileSync(tempFile, JSON.stringify(sites, null, 2), 'utf-8');
    fs.renameSync(tempFile, dbFile);
  } catch (err) {
    console.error('Error writing sites to db:', err);
  }
}

// Active Server-Sent Events (SSE) clients for real-time push across all connected devices
interface SSEClient {
  id: string;
  res: Response;
}
let sseClients: SSEClient[] = [];

function broadcastSSE(eventType: string, data: any) {
  const message = `event: ${eventType}\ndata: ${JSON.stringify(data)}\n\n`;
  for (let i = sseClients.length - 1; i >= 0; i--) {
    try {
      sseClients[i].res.write(message);
    } catch {
      sseClients.splice(i, 1);
    }
  }
}

// Periodically clean up and keep SSE connections open (ping every 15s)
setInterval(() => {
  for (let i = sseClients.length - 1; i >= 0; i--) {
    try {
      sseClients[i].res.write(': keepalive\n\n');
    } catch {
      sseClients.splice(i, 1);
    }
  }
}, 15000);

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;
  const isProduction = process.env.NODE_ENV === 'production';

  // Body parsing for JSON payloads (with 50mb limit for uploaded base64 photos)
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ extended: true, limit: '50mb' }));

  // CORS headers
  app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    if (req.method === 'OPTIONS') {
      res.status(200).end();
      return;
    }
    next();
  });

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: Date.now() });
  });

  // Server-Sent Events (SSE) Endpoint for real-time cross-device updates
  app.get('/api/events', (req: Request, res: Response) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache, no-transform');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no'); // Disable proxy buffering
    res.flushHeaders();

    const clientId = `client_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    sseClients.push({ id: clientId, res });

    // Send initial handshake
    res.write(`event: CONNECTED\ndata: ${JSON.stringify({ clientId, timestamp: Date.now() })}\n\n`);

    req.on('close', () => {
      sseClients = sseClients.filter((c) => c.id !== clientId);
    });
  });

  // ==========================================
  // SITES API
  // ==========================================

  // GET all sites
  app.get('/api/sites', (req: Request, res: Response) => {
    const sites = readSites();
    res.json(sites);
  });

  // GET site by ID or Slug
  app.get('/api/sites/:idOrSlug', (req: Request, res: Response) => {
    const { idOrSlug } = req.params;
    const sites = readSites();
    const matched = sites.find(
      (s) => s.id === idOrSlug || s.slug.toLowerCase() === idOrSlug.toLowerCase()
    );
    if (!matched) {
      res.status(404).json({ error: 'Site not found' });
      return;
    }
    res.json(matched);
  });

  // POST sync / update sites
  app.post('/api/sites', (req: Request, res: Response) => {
    try {
      const incoming = req.body;
      const sitesToSave: PublicSite[] = Array.isArray(incoming)
        ? incoming
        : Array.isArray(incoming.sites)
        ? incoming.sites
        : incoming.id
        ? [incoming]
        : [];

      if (sitesToSave.length === 0) {
        res.status(400).json({ error: 'Invalid sites payload' });
        return;
      }

      const current = readSites();
      // Merge by site ID
      const merged = [...sitesToSave];
      for (const cur of current) {
        if (!merged.some((m) => m.id === cur.id)) {
          merged.push(cur);
        }
      }

      writeSites(merged);
      broadcastSSE('SITES_UPDATED', { sites: merged, timestamp: Date.now() });
      res.json({ success: true, count: merged.length });
    } catch (err: any) {
      res.status(500).json({ error: err?.message || 'Failed to save sites' });
    }
  });

  // ==========================================
  // RSVPS API
  // ==========================================

  // GET RSVPs (optionally filtered by ?siteId=...)
  app.get('/api/rsvps', (req: Request, res: Response) => {
    const siteId = req.query.siteId as string | undefined;
    const sites = readSites();

    if (siteId) {
      const site = sites.find((s) => s.id === siteId || s.slug === siteId);
      res.json(site ? site.rsvps : []);
      return;
    }

    // Flatten all RSVPs with siteId
    const allRsvps: Array<{ siteId: string } & GuestRsvp> = [];
    sites.forEach((site) => {
      site.rsvps.forEach((rsvp) => {
        allRsvps.push({ siteId: site.id, ...rsvp });
      });
    });
    res.json(allRsvps);
  });

  // POST Submit or Update RSVP (Works from any device/browser!)
  app.post('/api/rsvps', (req: Request, res: Response) => {
    try {
      const payload = req.body;
      const targetSiteId = payload.siteId;
      const rsvp: GuestRsvp = {
        id: payload.id || `rsvp_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        name: (payload.name || '').trim(),
        attending: Boolean(payload.attending),
        guestCount: payload.attending ? Math.max(1, Number(payload.guestCount) || 1) : 0,
        message: (payload.message || '').trim(),
        emailOrPhone: payload.emailOrPhone?.trim() || undefined,
        submittedAt:
          payload.submittedAt ||
          new Date().toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          }),
      };

      if (!rsvp.name) {
        res.status(400).json({ error: 'Guest name is required' });
        return;
      }

      const sites = readSites();
      let matchedSite = sites.find(
        (s) => s.id === targetSiteId || s.slug.toLowerCase() === (targetSiteId || '').toLowerCase()
      );

      // If targetSiteId wasn't found or was omitted, default to the first site
      if (!matchedSite && sites.length > 0) {
        matchedSite = sites[0];
      }

      if (!matchedSite) {
        res.status(404).json({ error: 'Target celebration site not found' });
        return;
      }

      // Add or replace the RSVP in the site's rsvps array
      const existingIndex = matchedSite.rsvps.findIndex((r) => r.id === rsvp.id);
      if (existingIndex >= 0) {
        matchedSite.rsvps[existingIndex] = rsvp;
      } else {
        matchedSite.rsvps.unshift(rsvp);
      }

      // Write updated sites to disk
      writeSites(sites);

      // Broadcast real-time SSE event to all connected devices (host, admin, other guests)
      broadcastSSE('NEW_RSVP', {
        siteId: matchedSite.id,
        rsvp,
        timestamp: Date.now(),
      });

      console.log(`[RSVP Saved] ${rsvp.name} (${rsvp.attending ? 'Attending' : 'Declined'}) for site ${matchedSite.id}`);
      res.json({ success: true, siteId: matchedSite.id, rsvp });
    } catch (err: any) {
      console.error('Error in POST /api/rsvps:', err);
      res.status(500).json({ error: err?.message || 'Internal server error saving RSVP' });
    }
  });

  // DELETE single RSVP by ID: /api/rsvps/:rsvpId?siteId=...
  app.delete('/api/rsvps/:rsvpId', (req: Request, res: Response) => {
    try {
      const { rsvpId } = req.params;
      const siteId = req.query.siteId as string | undefined;
      const sites = readSites();

      let deletedAny = false;
      sites.forEach((site) => {
        if (!siteId || site.id === siteId) {
          const prevLen = site.rsvps.length;
          site.rsvps = site.rsvps.filter((r) => r.id !== rsvpId);
          if (site.rsvps.length !== prevLen) {
            deletedAny = true;
          }
        }
      });

      if (deletedAny) {
        writeSites(sites);
        broadcastSSE('DELETE_RSVP', { rsvpId, siteId, timestamp: Date.now() });
      }

      res.json({ success: true, rsvpId });
    } catch (err: any) {
      res.status(500).json({ error: err?.message || 'Failed to delete RSVP' });
    }
  });

  // DELETE clear all RSVPs for site: /api/rsvps?siteId=...
  app.delete('/api/rsvps', (req: Request, res: Response) => {
    try {
      const siteId = req.query.siteId as string;
      if (!siteId) {
        res.status(400).json({ error: 'siteId query param required to clear RSVPs' });
        return;
      }

      const sites = readSites();
      const site = sites.find((s) => s.id === siteId);
      if (site) {
        site.rsvps = [];
        writeSites(sites);
        broadcastSSE('CLEAR_RSVPS', { siteId, timestamp: Date.now() });
      }

      res.json({ success: true, siteId });
    } catch (err: any) {
      res.status(500).json({ error: err?.message || 'Failed to clear RSVPs' });
    }
  });

  // ==========================================
  // FRONTEND INTEGRATION (Vite dev or Static dist)
  // ==========================================
  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(rootDir, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Blessed Milestones] Full-stack Server listening on port ${PORT} (0.0.0.0)`);
  });
}

startServer().catch((err) => {
  console.error('Fatal server startup error:', err);
  process.exit(1);
});
