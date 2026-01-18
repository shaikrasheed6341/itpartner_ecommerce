import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import routes from './routes';

const app = new Hono();

app.use('*', logger());
app.use('*', cors({
  origin: '*', // Allow all origins for now, restrict in production
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
}));

app.get('/', (c) => {
  return c.json({ message: 'IT Partner Backend API is running!' });
});

app.get('/health', (c) => {
  return c.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Mount routes
app.route('/api/v1', routes);

const port = 5000;
console.log(`Server is running on port ${port}`);

// Only run the server if executed directly (e.g., via npm run dev/start) and not imported as a module (e.g., by Wrangler)
const isDevOrStart = process.env.npm_lifecycle_event === 'dev' || process.env.npm_lifecycle_event === 'start';

if (isDevOrStart) {
  serve({
    fetch: app.fetch,
    port
  });
}

export default app;