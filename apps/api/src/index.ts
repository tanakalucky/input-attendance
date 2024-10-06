import type { Handler } from 'aws-lambda';
import { Builder, By, until, WebDriver } from 'selenium-webdriver';
import * as chrome from 'selenium-webdriver/chrome';
import { SSMClient, GetParameterCommand } from '@aws-sdk/client-ssm';

type Attendance = {
  day: string;
  start: string;
  end: string;
  rest: string;
};

const client = new SSMClient({ region: 'ap-northeast-1' });

export const handler: Handler<{ year: number; month: number; attendanceJson?: string }> = async (event) => {
  const { year, month, attendanceJson } = event;
  const attendances: Attendance[] | undefined = attendanceJson ? JSON.parse(attendanceJson) : undefined;

  const options = new chrome.Options();
  options.addArguments('--headless=new');
  options.addArguments('--no-sandbox');
  options.addArguments('--disable-dev-shm-usage');
  options.addArguments('--disable-gpu');
  options.addArguments('--disable-dev-tools');
  options.addArguments('--no-zygote');
  options.addArguments('--single-process');
  options.addArguments('--remote-debugging-pipe');
  options.addArguments('--window-size=1920,1080');

  options.setBinaryPath('/opt/chrome/chrome-headless-shell-linux64/chrome-headless-shell');

  const serviceBuilder = new chrome.ServiceBuilder('/opt/chrome-driver/chromedriver-linux64/chromedriver');

  const driver = await new Builder()
    .forBrowser('chrome')
    .setChromeOptions(options)
    .setChromeService(serviceBuilder)
    .build();

  try {
    await login(driver);

    await moveToAttendancePage(driver);

    await selectYearAndMonth(driver, { year, month });

    await clearAttendance(driver);

    await inputAttendance(driver, { year, month, attendances });

    await saveAttendance(driver);

    const title = await driver.getTitle();

    return {
      statusCode: 200,
      body: JSON.stringify(`Page title is: ${title}`),
    };
  } catch (error) {
    console.error('An error occurred:', error);

    return {
      statusCode: 500,
      body: JSON.stringify('An error occurred'),
    };
  } finally {
    console.log('Quitting the driver...');
    await driver.quit();
    console.log('Driver quit successfully.');
  }
};

const login = async (driver: WebDriver) => {
  try {
    console.log('Waiting for login...');

    await driver.get('https://id.jobcan.jp/users/sign_in');

    const loginUserId = (
      await client.send(
        new GetParameterCommand({
          Name: '/input-attendance/user-email',
          WithDecryption: false,
        }),
      )
    ).Parameter?.Value;
    if (!loginUserId) {
      throw new Error('Fetch login id failed');
    }

    const loginUserIdElement = await driver.findElement(By.xpath("//*[@id='user_email']"));
    await loginUserIdElement.sendKeys(loginUserId);

    const loginUserPw = (
      await client.send(
        new GetParameterCommand({
          Name: '/input-attendance/user-pass',
          WithDecryption: false,
        }),
      )
    ).Parameter?.Value;
    if (!loginUserPw) {
      throw new Error('Fetch login password failed');
    }

    const loginPwElement = await driver.findElement(By.xpath("//*[@id='user_password']"));
    await loginPwElement.sendKeys(loginUserPw);

    const loginBtn = await driver.findElement(By.xpath("//*[@id='login_button']"));
    await loginBtn.click();
  } catch (error) {
    console.error('Login failed: ', error);
    throw error;
  }
};

const moveToAttendancePage = async (driver: WebDriver) => {
  try {
    console.log('Waiting for move to attendance page...');

    const attendanceUrl = await driver
      .findElement(By.xpath('/html/body/div[1]/header/nav/div/div[2]/ul/li[3]/a'))
      .getAttribute('href');

    await driver.get(attendanceUrl);

    const fixAttendanceBtn = await driver.findElement(By.xpath('/html/body/div/div/nav/div[2]/div/div[1]/a'));
    await fixAttendanceBtn.click();

    const fixMonthAttendanceBtn = await driver.findElement(
      By.xpath('/html/body/div/div/nav/div[2]/div/div[1]/div/a[2]'),
    );
    await fixMonthAttendanceBtn.click();
  } catch (error) {
    console.error('Move to attendance page failed: ', error);
    throw error;
  }
};

const selectYearAndMonth = async (driver: WebDriver, value: { year: number; month: number }) => {
  try {
    console.log('Waiting for select year and month...');

    const yearSelectLocator = By.xpath('/html/body/div/div/div[2]/main/div/div/div/h5/div/form/div/div[2]/select[1]');
    await driver.wait(until.elementLocated(yearSelectLocator), 2000);
    const yearSelectElement = await driver.findElement(yearSelectLocator);
    await yearSelectElement.findElement(By.css(`option[value="${value.year}"]`)).click();

    const monthSelectLocator = By.xpath('/html/body/div/div/div[2]/main/div/div/div/h5/div/form/div/div[2]/select[2]');
    await driver.wait(until.elementLocated(monthSelectLocator), 2000);
    const monthSelectElement = await driver.findElement(monthSelectLocator);
    await monthSelectElement.findElement(By.css(`option[value="${value.month}"]`)).click();
  } catch (error) {
    console.error('Select year and month failed: ', error);
    throw error;
  }
};

const clearAttendance = async (driver: WebDriver) => {
  try {
    console.log('Waiting for clear attendance...');

    const timeInputs = await driver.findElements(By.className('form-type-time'));

    const promises: Promise<void>[] = [];
    for (const input of timeInputs) {
      promises.push(input.clear());
    }

    await Promise.all(promises);
  } catch (error) {
    console.error('clear attendance failed: ', error);
    throw error;
  }
};

const inputAttendance = async (
  driver: WebDriver,
  value: { year: number; month: number; attendances?: Attendance[] },
): Promise<void> => {
  try {
    console.log('Waiting for input attendance...');

    const { year, month, attendances } = value;

    const timeInputs = await driver.findElements(By.className('form-type-time'));

    const days = getLastDay(year, month);

    if (attendances !== undefined) {
      for (const attendance of attendances) {
        const { day, start, end, rest } = attendance;

        const index = (Number(day) - 1) * 3;

        timeInputs[index].sendKeys(start);
        timeInputs[index + 1].sendKeys(end);
        timeInputs[index + 2].sendKeys(rest);
      }

      return;
    }

    for (let day = 1; day <= days; day++) {
      const dayOfWeek = new Date(value.year, value.month - 1, day).getDay();
      if (dayOfWeek === 0 || dayOfWeek === 6) continue;

      const index = (day - 1) * 3;

      timeInputs[index].sendKeys('09:00');
      timeInputs[index + 1].sendKeys('17:30');
      timeInputs[index + 2].sendKeys('00:45');
    }
  } catch (error) {
    console.error('Input attendance failed: ', error);
    throw error;
  }
};

const getLastDay = (year: number, month: number) => {
  return new Date(year, month, 0).getDate();
};

const saveAttendance = async (driver: WebDriver) => {
  try {
    console.log('Waiting for save attendance...');

    const saveBtn = await driver.findElement(
      By.xpath('/html/body/div/div/div[2]/main/div/div/div/div[2]/form/div[1]/div[2]/div[1]'),
    );
    await driver.executeScript('arguments[0].click();', saveBtn);

    const alert = await driver.switchTo().alert();
    await alert.accept();
  } catch (error) {
    console.error('Save attendance failed: ', error);
    throw error;
  }
};
