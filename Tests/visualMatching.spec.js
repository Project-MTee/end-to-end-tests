const { test } = require('@playwright/test');
const { expect } = require('@playwright/test');

//pages
const { TranslatePage } = require('../Pages/translatePage');
const { WebTranslatePage } = require('../Pages/webTranslatePage');
const { Header } = require('../Pages/header');
const { Footer } = require('../Pages/footer');

test.describe('visual checks @UI:', () => {

  test.beforeEach(async ({ page, baseURL }) => {
    process.env.URL = baseURL;
    translatePage = new TranslatePage(page);
    await translatePage.navigate();
    header = new Header(page);
    await header.changeUILanguage('EN');
  });

  test("header matches visually", async ({ page, baseURL }, testInfo) => {
    let screenshotName = "header-";
    header = new Header(page);
    const screenshot = await header.headerElement.screenshot();
    await expect(screenshot).toMatchSnapshot(screenshotName + '.png');

  });

  test("footer matches visually", async ({ page, baseURL }) => {
    let screenshotName = "footer-";
    footer = new Footer(page);
    const screenshot = await footer.footerElement.screenshot();
    await expect(screenshot).toMatchSnapshot(screenshotName + '.png');

  });

  test("translate button matches visually", async ({ page, baseURL, mobileView },) => {
    let screenshotName = "translateButton-";
    translatePage = new TranslatePage(page);
    if (!mobileView) {
      const screenshot = await translatePage.translationForm.translateButton.screenshot();
      await expect(screenshot).toMatchSnapshot(screenshotName + '.png');
    }
    else {
      await expect(translatePage.translationForm.translateButton).toBeHidden({ timeout: 2000 });
    }
  });

  test("upload button matches visually", async ({ page, baseURL }) => {
    let screenshotName = "uploadButton-";
    translatePage = new TranslatePage(page);
    const screenshot = await translatePage.translationForm.uploadButton.screenshot();
    await expect(screenshot).toMatchSnapshot(screenshotName + '.png');
  });

  test("translation form body matches visually", async ({ page, baseURL }) => {
    let screenshotName = "translationFormBody-";
    translatePage = new TranslatePage(page);
    const screenshot = await translatePage.translationForm.formBody.screenshot();
    await expect(screenshot).toMatchSnapshot(screenshotName + '.png');
  });

  test("uploaded document container matches visually", async ({ page, baseURL }) => {
    let screenshotName = "uploadedDocumentContainer-";
    translatePage = new TranslatePage(page);
    await translatePage.translationForm.uploadDocument('./TestData/Supported/' + 'en_docx.docx');
    const screenshot = await translatePage.translationForm.formBody.screenshot();
    await expect(screenshot).toMatchSnapshot(screenshotName + '.png');
  });
})