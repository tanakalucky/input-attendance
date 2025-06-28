import { vValidator } from '@hono/valibot-validator';
import { Hono } from 'hono';
import { logger } from 'hono/logger';
import {
  clearAttendance,
  getBrowser,
  getPage,
  inputAttendance,
  login,
  moveToInputAttendancePage,
  saveAttendance,
  selectMonth,
  selectYear,
} from '../playwright';
import { AttendanceInputSchema } from '../schema';
import type { Env } from './env';

const app = new Hono<{ Bindings: Env }>();

app.use('*', logger());

app.post(
  '/api/attendance',
  vValidator('json', AttendanceInputSchema),
  async (c) => {
    const data = c.req.valid('json');
    console.log('Processing attendance automation for:', data.loginId);

    // biome-ignore lint/suspicious/noImplicitAnyLet: <explanation>
    let browser;
    // biome-ignore lint/suspicious/noImplicitAnyLet: <explanation>
    let page;

    try {
      // Launch browser
      browser = await getBrowser(c.env.MYBROWSER);
      page = await getPage(browser);

      // Login process
      await login(page, data.loginId, data.loginPw);

      // Navigate to attendance input page
      await moveToInputAttendancePage(page);

      // Select year and month
      await selectYear(page, data.attendances.year);
      await selectMonth(page, data.attendances.month);

      // Clear existing attendance data
      await clearAttendance(page);

      // Input attendance data
      await inputAttendance(page, data.attendances.attendances);

      // Save attendance data
      await saveAttendance(page);

      console.log('Attendance automation completed successfully');

      return c.json({
        success: true,
        message: 'Attendance submitted successfully',
      });
    } catch (error) {
      console.error('Attendance automation failed:', error);

      return c.json(
        {
          success: false,
          message: `Automation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        },
        500,
      );
    } finally {
      // Close browser
      if (browser) {
        try {
          await browser.close();
        } catch (closeError) {
          console.error('Failed to close browser:', closeError);
        }
      }
    }
  },
);

app.notFound((c) => {
  if (c.req.path.startsWith('/api/')) {
    return c.json({ error: 'Not Found' }, 404);
  }
  // For non-API routes, let the client handle routing
  return c.redirect('/');
});

export default app;
