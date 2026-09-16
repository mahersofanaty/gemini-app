import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { ordersRouter } from './src/server/routes/orders.ts';
import { adminRouter } from './src/server/routes/admin.ts';
import { authoritiesRouter } from './src/server/routes/authorities.ts';

async function startServer() {
  const app = express();
  const PORT = 3000;

  // JSON request body parser
  app.use(express.json({ limit: '2mb' }));

  // API Routes FIRST
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', service: 'KFZ Abmelden Online Backend', timestamp: new Date().toISOString() });
  });

  app.use('/api/orders', ordersRouter);
  app.use('/api/authorities', authoritiesRouter);
  app.use('/api/admin', adminRouter);

  // Vite middleware for development vs static build for production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[KFZ Backend] Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
