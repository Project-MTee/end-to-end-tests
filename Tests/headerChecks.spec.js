const { test } = require('./baseTest');

//pages
const { TranslatePage } = require('../Pages/translatePage');
const { Header } = require('../Pages/header');

test.describe('header checks:', () => {

  test.beforeEach(async ({ page, baseURL }) => {
    process.env.URL = baseURL;
    translatePage = new TranslatePage(page);
    await translatePage.navigate();
    header = new Header(page);
    await header.changeUILanguage('EN');
  });

  test("has specified UI languages in menu", async ({ page, baseURL, uiLanguages }) => {
    header = new Header(page);
    await header.checkAvailableUILanguages(uiLanguages);
  });

  const uiLanguages = ['EN', 'ET', 'DE', 'RU'];
  for (const languageCode of uiLanguages) {

    test(`changes UI language ${languageCode}`, async ({ page, baseURL, uiLanguages }) => {
      header = new Header(page);
      await header.changeUILanguage(languageCode);
    });
  }

  test("opens About Project", async ({ page, baseURL }) => {
    header = new Header(page);
    await header.openAboutProject();
  });

  test("opens home clicking on logo", async ({ page, baseURL }) => {
    header = new Header(page);
    await header.openAboutProject();
    await page.goto(baseURL + 'terms');
    header = new Header(page);
    await header.clickLogo(baseURL);
  });

})