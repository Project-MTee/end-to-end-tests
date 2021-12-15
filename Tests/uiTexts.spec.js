const { test } = require('@playwright/test');
const { expect } = require('@playwright/test');

//pages
const { TranslatePage } = require('../Pages/translatePage');
const { Header } = require('../Pages/header');

test.describe('ui text checks @UI:', () => {

  test.beforeEach(async ({ page, baseURL }) => {
    process.env.URL = baseURL;
    translatePage = new TranslatePage(page);
    await translatePage.navigate();
    header = new Header(page);
    await header.changeUILanguage('EN');
  });

  let uiLanguages = [
    'EN',
    'ET',
    'DE',
    'RU'];

  let pageTitles = {
    '': 'WebsiteMtee',
    'web-translate': 'WebsiteMtee',
    'about': 'WebsiteMtee',
    'data-protection-conditions':'WebsiteMtee'   
  }

  for (const title in pageTitles) {
    test.only(`page (${title}) has set Title `, async ({ page, baseURL }) => {
      let pageTitle = pageTitles[title];
      await page.goto(baseURL + title);
      await expect(page).toHaveTitle(pageTitle);
    });
  }

  for (const languageCode of uiLanguages) {
    test(`placeholder and button text match expected ${languageCode}`, async ({ page, baseURL }) => {
      header = new Header(page);
      await header.openUILanguageMenuWithKeyboard();
      await header.chageUILanguageWithKeyboard(languageCode);
      expect(await page.textContent('.target-description')).toMatchSnapshot('trg_placeholder' + languageCode + '.txt');
      expect(await page.textContent('.description-text')).toMatchSnapshot('src_placeholder' + languageCode + '.txt');
      expect(await page.textContent('.upload-button')).toMatchSnapshot('upload_btn' + languageCode + '.txt');
      expect(await page.textContent('.translate-button')).toMatchSnapshot('translate_btn' + languageCode + '.txt');
      expect(await page.textContent('.translate-button')).toMatchSnapshot('translate_btn' + languageCode + '.txt');
    });
  }

  for (const languageCode of uiLanguages) {
    test(`data protection text matches expected ${languageCode}`, async ({ page, baseURL }) => {
      header = new Header(page);
      await page.goto('https://mt.cs.ut.ee/data-protection-conditions');
      header = new Header(page);
      await header.openUILanguageMenuWithKeyboard();
      await header.chageUILanguageWithKeyboard(languageCode);
      expect(await page.textContent('app-data-protection-conditions')).toMatchSnapshot('data-protection-conditions' + languageCode + '.txt');
    });
  }

  for (const languageCode of uiLanguages) {
    test(`about text matches expected ${languageCode}`, async ({ page, baseURL }) => {
      header = new Header(page);
      await page.goto(baseURL + 'about');
      header = new Header(page);
      await header.openUILanguageMenuWithKeyboard();
      await header.chageUILanguageWithKeyboard(languageCode);
      expect(await page.textContent('app-about')).toMatchSnapshot('app-about' + languageCode + '.txt');
    });
  }
})