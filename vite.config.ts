import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';
import {defineConfig, Plugin} from 'vite';

function rsvpPlugin(): Plugin {
  return {
    name: 'rsvp-api-middleware',
    configureServer(server) {
      server.middlewares.use('/api/rsvps', (req, res) => {
        const rootDir = import.meta.dirname || path.resolve('.');
        const dataDir = path.resolve(rootDir, 'data');
        const dataFile = path.resolve(dataDir, 'rsvps.json');

        if (!fs.existsSync(dataDir)) {
          try {
            fs.mkdirSync(dataDir, { recursive: true });
          } catch {}
        }
        if (!fs.existsSync(dataFile)) {
          try {
            fs.writeFileSync(dataFile, '[]');
          } catch {}
        }

        if (req.method === 'GET') {
          try {
            const data = fs.readFileSync(dataFile, 'utf-8');
            res.setHeader('Content-Type', 'application/json');
            res.end(data || '[]');
          } catch {
            res.setHeader('Content-Type', 'application/json');
            res.end('[]');
          }
        } else if (req.method === 'POST') {
          let body = '';
          req.on('data', (chunk) => {
            body += chunk;
          });
          req.on('end', () => {
            try {
              const item = JSON.parse(body);
              let existing: any[] = [];
              try {
                existing = JSON.parse(fs.readFileSync(dataFile, 'utf-8'));
              } catch {}
              if (!Array.isArray(existing)) existing = [];
              const updated = [item, ...existing.filter((x: any) => x.id !== item.id)];
              fs.writeFileSync(dataFile, JSON.stringify(updated, null, 2));
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ success: true, count: updated.length }));
            } catch (err: any) {
              res.statusCode = 400;
              res.end(JSON.stringify({ error: err?.message || 'Invalid payload' }));
            }
          });
        } else {
          res.statusCode = 404;
          res.end();
        }
      });
    },
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), rsvpPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(import.meta.dirname || '.', '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
