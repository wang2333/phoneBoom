const puppeteer = require('puppeteer');
const fs = require('fs');
const iPhone = puppeteer.KnownDevices['iPhone 11 Pro'];

const TEL_NUMBER = '18259606013';
const TEL_NAME = '朱跃能';

async function handleSendCode(newPage) {
  const form = await newPage.$('.receive-popup-container', { timeout: 3000 });
  if (form) {
    const input = await form.$('.input');
    await input.type(TEL_NUMBER);
    const codeBtn = await form.$('.verify-code-button ');
    if (codeBtn) {
      await codeBtn.click();
      await newPage.waitForTimeout(4000);
      const close = await form.$('.icon-close');
      close && (await close.click());
      return;
    }
    const submit = await form.$('.submit ');
    submit && (await submit.click({ delay: 1000 }));
    const close = await form.$('.icon-close');
    close && (await close.click({ delay: 1000 }));
  }
}

async function handleAppointment(newPage) {
  const forms = await newPage.$$('.section-wrap-container');

  let form = null;
  for (const item of forms) {
    const isVisible = await item.isVisible();
    if (isVisible) {
      form = item;
      break;
    }
  }

  if (form) {
    await newPage.waitForTimeout(200);

    const radioEle = await form.$('.sjh-form-item-wrapper-radio .vi-label-text');
    radioEle && (await radioEle.click());

    const checkboxEle = await form.$('.sjh-form-item-wrapper-checkbox .vi-label-text');
    checkboxEle && (await checkboxEle.click());

    const nameEle = await form.$('.sjh-form-item-wrapper-name .sjh-form-input');
    nameEle && (await nameEle.type(TEL_NAME));

    const telEle = await form.$('.sjh-form-item-wrapper-phone .sjh-form-input');
    telEle && (await telEle.type(TEL_NUMBER));

    const inputEle = await form.$('.sjh-form-item-wrapper-input .sjh-form-input');
    inputEle && (await inputEle.type('提高班'));

    const numberEle = await form.$('.sjh-form-item-wrapper-number .sjh-form-input');
    numberEle && (await numberEle.type('140'));

    const cityEle = await form.$('.sjh-form-item-wrapper-city');
    if (cityEle) {
      const cityItemEle = await cityEle.$('.sjh-form-input');
      await cityItemEle.click();

      await newPage.waitForTimeout(1000);
      const cityItem = await newPage.$('.form-region-name');
      if (cityItem) {
        await cityItem.click();
        await newPage.waitForTimeout(1000);
      }
      const cityItem2 = await newPage.$('.form-region-name');
      if (cityItem2) {
        await cityItem2.click();
        await newPage.waitForTimeout(1000);
      }
    }

    const submitEle = await form.$('.sjh-form-list-submit');
    submitEle && (await submitEle.click());

    await newPage.waitForTimeout(1000);

    const qdEle = await newPage.$('.input-btn');
    qdEle && (await qdEle.click());
  }
}

async function processTab(page, url, type) {
  url += '?showpageinpc=1&timestamp=1700673934183';
  return new Promise(async (resolve, rejects) => {
    try {
      let tabTitle = null;
      const newPage = await page.browser().newPage();
      await newPage.emulate(iPhone);
      await newPage.goto(url);
      // await newPage.waitForNetworkIdle('networkidle0');

      const container = await newPage.$$('.activity-item-container');

      if (container.length > 0) {
        await container[container.length - 1].scrollIntoView();
      }

      let ele = null;
      if (type === 1) {
        ele = container[0];
      } else {
        ele = container[1];
      }
      if (!ele) {
        resolve();
        await newPage.close();
        return;
      }

      const btn = await ele.$('.name');
      await btn.click();
      await newPage.waitForTimeout(2000);

      if (type === 1) {
        await handleSendCode(newPage);
      } else {
        await handleAppointment(newPage);
      }

      await newPage.waitForTimeout(1500);
      tabTitle = await newPage.title();
      resolve(tabTitle);
      await newPage.close();
    } catch (error) {
      resolve(url);
    }
  });
}

async function iterateAPI(filePath) {
  // const browser = await puppeteer.launch({ headless: false, devtools: true });
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  const urls = fs.readFileSync(filePath, 'utf-8').split('\n').filter(Boolean);
  urls.sort(() => Math.random() - 0.5); // 随机打乱数组顺序

  let finished = 0;
  for (const url of urls) {
    const a = processTab(page, url.trim(), 1);
    const b = processTab(page, url.trim(), 2);
    await Promise.all([a, b]);
    finished++;
    console.log(`已完成: ${finished}/${urls.length}`);
  }

  await browser.close();
}

iterateAPI('result.txt');
