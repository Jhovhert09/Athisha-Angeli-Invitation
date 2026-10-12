/**
 * Full-Stack Express Server with Real-time Multi-Device RSVP Synchronization
 * Provides persistent database storage for sites and RSVPs, plus Server-Sent Events (SSE).
 */

import express from 'express';
import type { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
export interface GuestRsvp {
  id: string;
  name: string;
  attending: boolean;
  guestCount?: number;
  message?: string;
  emailOrPhone?: string;
  submittedAt?: string;
}

export interface PublicSite {
  id: string;
  slug: string;
  title: string;
  isPublished: boolean;
  publishedAt: string;
  createdAt: string;
  viewCount: number;
  allowGuestRsvp: boolean;
  data: any;
  rsvps: GuestRsvp[];
}

export const INITIAL_INVITATION_DATA = {
  babyName: 'Liam Alexander',
  babyNickname: 'Liam',
  gender: 'boy',
  babyPhotoUrl: '/src/assets/images/baby_baptism_portrait_1791254793568.jpg',
  coverKicker: 'YOU ARE INVITED',
  milestoneTitle: 'Holy Baptism & 1st Birthday',
  introHeading: 'With grateful hearts and immense joy,',
  introText: 'We invite you to celebrate a very special milestone in our little one’s life as he is welcomed into God’s family and turns one year old.',
  baptismDate: 'Sunday, December 13, 2026',
  baptismTime: '10:00 AM',
  baptismChurch: 'St. Joseph Parish Church',
  baptismAddress: 'MacArthur Highway, Urdaneta City, Pangasinan',
  baptismMapsUrl: 'https://maps.google.com/?q=St.+Joseph+Parish+Church+Urdaneta+City',
  baptismNotes: 'The Sacred Rite begins promptly. Please be seated in prayer by 9:45 AM.',
  birthdayDate: 'Sunday, December 13, 2026',
  birthdayTime: '12:00 PM',
  birthdayVenue: 'The Garden Events Place',
  birthdayAddress: 'Poblacion, Urdaneta City, Pangasinan',
  birthdayMapsUrl: 'https://maps.google.com/?q=The+Garden+Events+Place+Urdaneta+City',
  birthdayNotes: 'A feast of thanksgiving, sweet cake cutting, joyful laughter, and celebration!',
  countdownTarget: '2026-12-13T10:00:00',
  fatherName: 'Juan Santos',
  motherName: 'Elena Cruz-Santos',
  parentsMessage: 'Together with our families, we warmly invite you to share in this blessed and joyful celebration.',
  godparentsHeading: 'Godparents',
  godparentsSubheading: 'Those who will help guide our little one with faith, love, and kindness.',
  godparents: [
    { id: '1', name: 'Maria Santos', role: 'Godmother', relationship: 'Aunt' },
    { id: '2', name: 'Juan Dela Cruz', role: 'Godfather', relationship: 'Uncle' },
    { id: '3', name: 'Dr. Sofia Morales', role: 'Godmother', relationship: 'Family Friend' },
    { id: '4', name: 'Engr. Rafael Reyes', role: 'Godfather', relationship: 'Family Friend' },
    { id: '5', name: 'Beatrice Villanueva', role: 'Godmother', relationship: 'Godmother' },
    { id: '6', name: 'Gabriel Mendoza', role: 'Godfather', relationship: 'Godfather' },
  ],
  verseText: '“Let the little children come to me, and do not hinder them, for the kingdom of heaven belongs to such as these.”',
  verseCitation: 'Matthew 19:14',
  birthdayHeading: "Let's Celebrate!",
  birthdaySubheading: 'Our little blessing is turning ONE! 🎂',
  galleryTitle: 'One Year of Love',
  gallerySubtitle: 'Memories of a wonderful first year filled with milestones, smiles, and grace.',
  photos: [
    {
      id: 'photo-1',
      url: '/src/assets/images/baby_baptism_portrait_1791254793568.jpg',
      caption: 'Blessings & White Heirloom Christening Outfit',
      ageMonth: 'Month 11',
    },
    {
      id: 'photo-2',
      url: '/src/assets/images/baby_sleeping_angel_1791254831082.jpg',
      caption: 'Our peaceful little angel dreaming sweet dreams',
      ageMonth: 'Newborn',
    },
    {
      id: 'photo-3',
      url: '/src/assets/images/baby_teddy_memory_1791254818642.jpg',
      caption: 'Playful giggles with teddy bear companion',
      ageMonth: 'Month 8',
    },
    {
      id: 'photo-4',
      url: '/src/assets/images/baptism_cake_gold_1791254806162.jpg',
      caption: 'Golden leaf 1st celebration cake & white flowers',
      ageMonth: 'Year 1',
    },
  ],
  timelineItems: [
    {
      id: 'time-1',
      time: '10:00 AM',
      title: 'Holy Sacrament of Baptism',
      subtitle: 'St. Joseph Parish Church',
      icon: 'cross',
    },
    {
      id: 'time-2',
      time: '11:30 AM',
      title: 'Family & Godparent Portraits',
      subtitle: 'Church Courtyard & Altar steps',
      icon: 'camera',
    },
    {
      id: 'time-3',
      time: '12:00 PM',
      title: 'Welcome to Reception',
      subtitle: 'The Garden Events Place Grand Hall',
      icon: 'heart',
    },
    {
      id: 'time-4',
      time: '12:30 PM',
      title: 'Thanksgiving Luncheon & Program',
      subtitle: 'Buffet feast, toasts & milestones slideshow',
      icon: 'utensils',
    },
    {
      id: 'time-5',
      time: '1:30 PM',
      title: 'Cake Blowing & 1st Birthday Games',
      subtitle: 'Balloons, sweet treats & party favors',
      icon: 'cake',
    },
  ],
  rsvpDeadline: 'Please confirm your attendance by Sunday, November 30, 2026',
  rsvpNote: 'Your presence would make this special day even more meaningful to our family.',
  contactNumber: '+63 917 123 4567',
  closingHeading: 'Thank You',
  closingMessage: 'Thank you for being part of our little one’s journey and for celebrating this sacred and joyous milestone with us.',
  closingSignature: 'With love, Juan & Elena',
  templateId: 'heavenly-blessings',
  frameShape: 'arch',
  fontHeading: 'cormorant',
  fontScript: 'vibes',
  fontBody: 'montserrat',
  primaryColor: '#FFFDF8',
  secondaryColor: '#EBF1F6',
  accentColor: '#C9A96A',
  backgroundColor: '#FAF7F2',
  cardBgColor: '#FFFFFF',
  textColor: '#2E353C',
  subtextColor: '#667482',
  showFloatingPetals: true,
  showSparkles: true,
  musicEnabled: true,
  musicTheme: 'lullaby-harp',
};

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = __dirname;
const dataDir = path.resolve(rootDir, 'data');
const dbFile = path.resolve(dataDir, 'sites_db.json');
const rsvpsFile = path.resolve(dataDir, 'rsvps.json');

// Initial seed data if database is completely empty
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

// Sanitize and validate site data to ensure no missing properties or undefined arrays
function normalizeSite(raw: any): PublicSite {
  const baseData = {
    ...INITIAL_INVITATION_DATA,
    ...(raw?.data || {}),
    godparents: (Array.isArray(raw?.data?.godparents) && raw.data.godparents.length > 0)
      ? raw.data.godparents
      : INITIAL_INVITATION_DATA.godparents,
    photos: (Array.isArray(raw?.data?.photos) && raw.data.photos.length > 0)
      ? raw.data.photos
      : INITIAL_INVITATION_DATA.photos,
    timelineItems: (Array.isArray(raw?.data?.timelineItems) && raw.data.timelineItems.length > 0)
      ? raw.data.timelineItems
      : INITIAL_INVITATION_DATA.timelineItems,
  };

  return {
    id: raw?.id || 'site_liam_1',
    slug: raw?.slug || 'liam-alexander',
    title: raw?.title || `${baseData.babyName}'s Holy Baptism & 1st Birthday`,
    isPublished: raw?.isPublished ?? true,
    publishedAt: raw?.publishedAt || 'Oct 5, 2026',
    createdAt: raw?.createdAt || 'Oct 1, 2026',
    viewCount: typeof raw?.viewCount === 'number' ? raw.viewCount : 142,
    allowGuestRsvp: raw?.allowGuestRsvp ?? true,
    data: baseData,
    rsvps: Array.isArray(raw?.rsvps) ? raw.rsvps : [],
  };
}

// Ensure database files exist
function initDatabase(): void {
  try {
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    if (!fs.existsSync(dbFile)) {
      fs.writeFileSync(dbFile, JSON.stringify(DEFAULT_SEED_SITES, null, 2), 'utf-8');
    } else {
      const content = fs.readFileSync(dbFile, 'utf-8');
      try {
        const parsed = JSON.parse(content);
        if (!Array.isArray(parsed) || parsed.length === 0) {
          fs.writeFileSync(dbFile, JSON.stringify(DEFAULT_SEED_SITES, null, 2), 'utf-8');
        } else {
          // Normalize existing sites and ensure data is never empty
          const normalized = parsed.map(normalizeSite);
          fs.writeFileSync(dbFile, JSON.stringify(normalized, null, 2), 'utf-8');
        }
      } catch {
        fs.writeFileSync(dbFile, JSON.stringify(DEFAULT_SEED_SITES, null, 2), 'utf-8');
      }
    }

    if (!fs.existsSync(rsvpsFile)) {
      const flatRsvps = INITIAL_RSVPS.map((r) => ({ siteId: 'site_liam_1', ...r }));
      fs.writeFileSync(rsvpsFile, JSON.stringify(flatRsvps, null, 2), 'utf-8');
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
        return parsed.map(normalizeSite);
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
    const tempFile = `${dbFile}.tmp.${Date.now()}`;
    fs.writeFileSync(tempFile, JSON.stringify(sites, null, 2), 'utf-8');
    fs.renameSync(tempFile, dbFile);

    // Also sync flat rsvps.json ledger
    const allRsvps: Array<{ siteId: string } & GuestRsvp> = [];
    sites.forEach((site) => {
      (site.rsvps || []).forEach((r) => {
        allRsvps.push({ siteId: site.id, ...r });
      });
    });
    const tempRsvpsFile = `${rsvpsFile}.tmp.${Date.now()}`;
    fs.writeFileSync(tempRsvpsFile, JSON.stringify(allRsvps, null, 2), 'utf-8');
    fs.renameSync(tempRsvpsFile, rsvpsFile);
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

// Keep SSE connections alive through mobile sleep / Cloud Run proxies (ping every 10s)
setInterval(() => {
  for (let i = sseClients.length - 1; i >= 0; i--) {
    try {
      sseClients[i].res.write(': keepalive\n\n');
    } catch {
      sseClients.splice(i, 1);
    }
  }
}, 10000);

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;
  const isProduction = process.env.NODE_ENV === 'production';

  // Body parsing for JSON payloads (with 50mb limit for uploaded base64 photos)
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ extended: true, limit: '50mb' }));

  // CORS headers & no-cache headers for API
  app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    if (req.path.startsWith('/api/')) {
      res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
    }
    if (req.method === 'OPTIONS') {
      res.status(200).end();
      return;
    }
    next();
  });

  // Health check
  app.get('/api/health', (req, res) => {
    const sites = readSites();
    const totalRsvps = sites.reduce((sum, s) => sum + (s.rsvps?.length || 0), 0);
    res.json({
      status: 'ok',
      sitesCount: sites.length,
      rsvpsCount: totalRsvps,
      connectedClients: sseClients.length,
      timestamp: Date.now(),
    });
  });

  // Server-Sent Events (SSE) Endpoint for real-time cross-device updates
  app.get('/api/events', (req: Request, res: Response) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache, no-transform');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no'); // Disable nginx / Cloud Run proxy buffering
    res.flushHeaders?.();

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
  // CRITICAL: Protects and preserves all existing RSVPs in the database!
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
      const currentMap = new Map(current.map((c) => [c.id, c]));

      const merged: PublicSite[] = sitesToSave.map((incomingSite) => {
        const existing = currentMap.get(incomingSite.id);
        if (!existing) return normalizeSite(incomingSite);

        // CRITICAL: Preserve all existing RSVPs from the database!
        // Combine existing RSVPs with any new incoming RSVPs, deduplicated by rsvp.id
        const rsvpMap = new Map<string, GuestRsvp>();
        (existing.rsvps || []).forEach((r) => rsvpMap.set(r.id, r));
        (incomingSite.rsvps || []).forEach((r) => {
          if (!rsvpMap.has(r.id)) {
            rsvpMap.set(r.id, r);
          }
        });

        // Merge site data safely, never wiping existing valid data with an empty object
        const mergedData = {
          ...INITIAL_INVITATION_DATA,
          ...(existing.data || {}),
          ...(incomingSite.data || {}),
        };
        if (!incomingSite.data?.godparents?.length && existing.data?.godparents?.length) {
          mergedData.godparents = existing.data.godparents;
        }
        if (!incomingSite.data?.photos?.length && existing.data?.photos?.length) {
          mergedData.photos = existing.data.photos;
        }
        if (!incomingSite.data?.timelineItems?.length && existing.data?.timelineItems?.length) {
          mergedData.timelineItems = existing.data.timelineItems;
        }

        return normalizeSite({
          ...existing,
          ...incomingSite,
          data: mergedData,
          // Authoritative RSVP list from the server database
          rsvps: Array.from(rsvpMap.values()),
        });
      });

      // Also preserve any other sites currently in the database that were not in incoming payload
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
      res.json(site ? (site.rsvps || []) : []);
      return;
    }

    // Flatten all RSVPs with siteId
    const allRsvps: Array<{ siteId: string } & GuestRsvp> = [];
    sites.forEach((site) => {
      (site.rsvps || []).forEach((rsvp) => {
        allRsvps.push({ siteId: site.id, ...rsvp });
      });
    });
    res.json(allRsvps);
  });

  // POST Submit or Update RSVP (Works from any device/browser!)
  app.post('/api/rsvps', (req: Request, res: Response) => {
    try {
      const payload = req.body;
      const targetSiteId = (payload.siteId || '').toString().trim();
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
        (s) =>
          (targetSiteId && s.id === targetSiteId) ||
          (targetSiteId && s.slug.toLowerCase() === targetSiteId.toLowerCase())
      );

      // If targetSiteId wasn't found or was omitted, default to the first site
      if (!matchedSite && sites.length > 0) {
        matchedSite = sites[0];
      }

      if (!matchedSite) {
        res.status(404).json({ error: 'Target celebration site not found' });
        return;
      }

      if (!Array.isArray(matchedSite.rsvps)) {
        matchedSite.rsvps = [];
      }

      // Add or replace the RSVP in the site's rsvps array
      const existingIndex = matchedSite.rsvps.findIndex((r) => r.id === rsvp.id);
      if (existingIndex >= 0) {
        matchedSite.rsvps[existingIndex] = rsvp;
      } else {
        matchedSite.rsvps.unshift(rsvp);
      }

      // Write updated sites and rsvps to disk immediately
      writeSites(sites);

      // Broadcast real-time SSE event to all connected devices (host, admin, other guests)
      broadcastSSE('NEW_RSVP', {
        siteId: matchedSite.id,
        rsvp,
        timestamp: Date.now(),
      });

      console.log(
        `[RSVP Recorded] ${rsvp.name} (${rsvp.attending ? 'Attending' : 'Declined'}) on site "${matchedSite.title}" (ID: ${matchedSite.id})`
      );
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
          const prevLen = (site.rsvps || []).length;
          site.rsvps = (site.rsvps || []).filter((r) => r.id !== rsvpId);
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
