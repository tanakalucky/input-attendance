import {
  type Browser,
  type BrowserWorker,
  type Page,
  launch,
} from '@cloudflare/playwright';
import type { ValidatedAttendanceInput } from '../schema';

export const getBrowser = async (
  browserWorker: BrowserWorker,
): Promise<Browser> => {
  return await launch(browserWorker, {
    keep_alive: 600000, // 10分間のセッション維持
  });
};

export const getPage = async (browser: Browser): Promise<Page> => {
  try {
    console.log('Creating browser context...');
    const context = await browser.newContext({
      viewport: { width: 1920, height: 1080 },
      ignoreHTTPSErrors: true,
      javaScriptEnabled: true,
      bypassCSP: true,
    });

    console.log('Creating new page...');
    const page = await context.newPage();

    return page;
  } catch (error) {
    console.error('Failed to create page:', error);
    throw error;
  }
};

export const login = async (
  page: Page,
  loginId: string,
  loginPw: string,
): Promise<void> => {
  try {
    console.log('Waiting for login...');

    await page.goto('https://id.jobcan.jp/users/sign_in');
    await page.fill('#user_email', loginId);
    await page.fill('#user_password', loginPw);
    await page.click('#login_button');

    // ログイン完了を待機
    await page.waitForLoadState('networkidle');
  } catch (error) {
    console.log('Failed to login');
    throw error;
  }
};

export const moveToInputAttendancePage = async (page: Page): Promise<void> => {
  try {
    console.log('Moving to attendance input page...');

    // 勤怠入力ページに移動
    await page.goto('https://ssl.jobcan.jp/employee/attendance');
    await page.waitForLoadState('networkidle');
  } catch (error) {
    console.log('Failed to move to attendance page');
    throw error;
  }
};

export const selectYear = async (page: Page, year: number): Promise<void> => {
  try {
    console.log(`Selecting year: ${year}`);

    // 年選択のセレクトボックスを操作
    await page.selectOption('select[name="year"]', year.toString());
    await page.waitForTimeout(1000);
  } catch (error) {
    console.log('Failed to select year');
    throw error;
  }
};

export const selectMonth = async (page: Page, month: number): Promise<void> => {
  try {
    console.log(`Selecting month: ${month}`);

    // 月選択のセレクトボックスを操作
    await page.selectOption('select[name="month"]', month.toString());
    await page.waitForTimeout(1000);

    // ページのリロードを待機
    await page.waitForLoadState('networkidle');
  } catch (error) {
    console.log('Failed to select month');
    throw error;
  }
};

export const clearAttendance = async (page: Page): Promise<void> => {
  try {
    console.log('Clearing existing attendance data...');

    // 既存の勤怠データをクリア
    // 具体的なセレクタは実際のJobcanサイトに合わせて調整が必要
    const timeInputs = await page.$$('input[type="time"], input[name*="time"]');

    for (const input of timeInputs) {
      await input.fill('');
    }

    await page.waitForTimeout(500);
  } catch (error) {
    console.log('Failed to clear attendance data');
    throw error;
  }
};

export const inputAttendance = async (
  page: Page,
  attendances: ValidatedAttendanceInput['attendances']['attendances'],
): Promise<void> => {
  try {
    console.log('Inputting attendance data...');

    for (const attendance of attendances) {
      // 日付からday部分を抽出 (YYYY-MM-DD → DD)
      const day = new Date(attendance.date).getDate();

      // 各時間フィールドの入力
      if (attendance.start_time) {
        const startTimeSelector = `input[name="start_time_${day}"], input[data-day="${day}"][data-type="start"]`;
        await page.fill(startTimeSelector, attendance.start_time);
      }

      if (attendance.end_time) {
        const endTimeSelector = `input[name="end_time_${day}"], input[data-day="${day}"][data-type="end"]`;
        await page.fill(endTimeSelector, attendance.end_time);
      }

      if (attendance.break_time) {
        const breakTimeSelector = `input[name="break_time_${day}"], input[data-day="${day}"][data-type="break"]`;
        await page.fill(breakTimeSelector, attendance.break_time);
      }

      // 各行の入力後に少し待機
      await page.waitForTimeout(200);
    }

    console.log('Attendance data input completed');
  } catch (error) {
    console.log('Failed to input attendance data');
    throw error;
  }
};

export const saveAttendance = async (page: Page): Promise<void> => {
  try {
    console.log('Saving attendance data...');

    // 保存ボタンをクリック
    const saveButton = page
      .locator('input[type="submit"], button[type="submit"]')
      .first();
    await saveButton.click();

    // 保存完了を待機
    await page.waitForLoadState('networkidle');

    // 成功メッセージの確認 (オプション)
    try {
      await page.waitForSelector('.success, .alert-success', { timeout: 5000 });
      console.log('Attendance data saved successfully');
    } catch {
      // 成功メッセージが見つからない場合でも続行
      console.log('Save completed (no success message detected)');
    }
  } catch (error) {
    console.log('Failed to save attendance data');
    throw error;
  }
};
