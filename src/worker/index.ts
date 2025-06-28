import { vValidator } from '@hono/valibot-validator';
import { Hono } from 'hono';
import { logger } from 'hono/logger';
import { AttendanceInputSchema } from '../schema';
import type { Env } from './env';

const app = new Hono<{ Bindings: Env }>();

app.use('*', logger());

app.post('/api/attendance', vValidator('json', AttendanceInputSchema), (c) => {
  console.log('Received attendance data:', c.req);
  const data = c.req.valid('json');

  console.log('Received attendance data:', data);

  return c.json({
    success: true,
    message: 'Attendance data received successfully',
  });
});

app.notFound((c) => {
  if (c.req.path.startsWith('/api/')) {
    return c.json({ error: 'Not Found' }, 404);
  }
  // For non-API routes, let the client handle routing
  return c.redirect('/');
});

export default app;
