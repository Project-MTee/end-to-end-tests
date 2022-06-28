const { expect } = require('@playwright/test');
const { test } = require('./baseTest');
const fs = require('fs');


//pages
const { TranslatePage } = require('../Pages/translatePage');
const { WebTranslatePage } = require('../Pages/webTranslatePage');
const { Header } = require('../Pages/header');

test.describe('web translate @web:', () => {

  let translationParameters =
  {
    srcLang: 'English',
    trgLang: 'Estonian',
    srcLangCode: 'en',
    trgLangCode: 'et',
    domainToSet: 'general',
    domainToExpect: 'general',
    autoStartTranslation: false,
    webTranslationTimeout: 0,
    url: ''
  }

  test.beforeEach(async ({ page, baseURL, webTranslationTimeout, textAPI }) => {
    process.env.URL = baseURL;
    process.env.textAPI = textAPI;
    translationParameters.webTranslationTimeout = webTranslationTimeout;
    translatePage = new TranslatePage(page);
    await translatePage.navigate();
    header = new Header(page);
    await header.changeUILanguage('EN');
  });

  let websites = [
    'https://www.valitsus.ee/',
    'http://www.valitsus.ee/',
    'valitsus.ee/',
    'www.valitsus.ee/'
  ];

  for (const website of websites) {
    test(`opens webtranslate clicking on link - ${website}`, async ({ page, baseURL }) => {
      translationParameters.url = website;
      translatePage = new TranslatePage(page);
      await translatePage.mtLanguageSelector.selectLanguageDirection(translationParameters.srcLang, translationParameters.trgLang);
      await translatePage.mtLanguageSelector.selectDomain(translationParameters.domainToSet);
      await translatePage.translationForm.enterUrlClickToOpenWebtranslate(translationParameters.url);
    });
  }

  test("loads the webtranslate form", async ({ page, baseURL }) => {
    translationParameters.url = 'https://estonia.ee/';
    translatePage = new TranslatePage(page);
    await translatePage.mtLanguageSelector.selectLanguageDirection(translationParameters.srcLang, translationParameters.trgLang);
    await translatePage.mtLanguageSelector.selectDomain(translationParameters.domainToSet);
    let page2 = await translatePage.translationForm.enterUrlClickToOpenWebtranslate(translationParameters.url);
    webTranslatePage = new WebTranslatePage(page2);
    await webTranslatePage.checkTranslationBarInDefaultState();
    await webTranslatePage.checkFormInReadyState(translationParameters.url);
  });

  test("remembers languages and domain set in text translate form", async ({ page, baseURL }) => {
    translationParameters.url = 'https://estonia.ee/';
    translatePage = new TranslatePage(page);
    await translatePage.mtLanguageSelector.selectLanguageDirection(translationParameters.srcLang, translationParameters.trgLang);
    await translatePage.mtLanguageSelector.selectDomain(translationParameters.domainToSet);
    let page2 = await translatePage.translationForm.enterUrlClickToOpenWebtranslate(translationParameters.url);
    webTranslatePage = new WebTranslatePage(page2);
    await webTranslatePage.checkTranslationBarInDefaultState();
    await webTranslatePage.mtLanguageSelector.checkActiveLanguages(translationParameters.srcLang, translationParameters.trgLang);
    await webTranslatePage.mtLanguageSelector.checkActiveDomain(translationParameters.domainToSet);
  });

  test('translates website https://estonia.ee/overview/ @smoke', async ({ page, baseURL }) => {
    translatePage = new TranslatePage(page);
    translationParameters.url = 'https://estonia.ee/'
    await translatePage.mtLanguageSelector.selectLanguageDirection(translationParameters.srcLang, translationParameters.trgLang);
    await translatePage.mtLanguageSelector.selectDomain(translationParameters.domainToSet);
    let page2 = await translatePage.translationForm.enterUrlClickToOpenWebtranslate(translationParameters.url);
    webTranslatePage = new WebTranslatePage(page2);
    await webTranslatePage.checkTranslationBarInDefaultState();
    await webTranslatePage.checkFormInReadyState(translationParameters.url);
    let webpageTextOriginal = await webTranslatePage.getWebpageText();
    let translationResponses = await webTranslatePage.translateWebsite(translationParameters);
    await webTranslatePage.checkHasAllTranslations(translationResponses);
  });

  test("restores page to untranslated", async ({ page, baseURL }) => {
    translationParameters.url = 'https://estonia.ee/';
    translatePage = new TranslatePage(page);
    await translatePage.mtLanguageSelector.selectLanguageDirection(translationParameters.srcLang, translationParameters.trgLang);
    await translatePage.mtLanguageSelector.selectDomain(translationParameters.domainToSet);
    let page2 = await translatePage.translationForm.enterUrlClickToOpenWebtranslate(translationParameters.url);
    webTranslatePage = new WebTranslatePage(page2);
    await webTranslatePage.checkTranslationBarInDefaultState();
    await webTranslatePage.checkFormInReadyState(translationParameters.url);
    let webpageTextOriginal = await webTranslatePage.getWebpageText();
    let translations = await webTranslatePage.translateWebsite(translationParameters);
    let webpageTextTranslated = await webTranslatePage.getWebpageText();
    await webTranslatePage.restoreButton.click();
    let webpageTextRestored = await webTranslatePage.getWebpageText();
    await webTranslatePage.checkRestoredText(webpageTextOriginal, webpageTextRestored);
  });

  test("displays error for bad address", async ({ page, baseURL }) => {
    translationParameters.url = 'https://www.sdjosijdfsdfssdfsdfsdttttffd.com';
    translatePage = new TranslatePage(page);
    await translatePage.mtLanguageSelector.selectLanguageDirection(translationParameters.srcLang, translationParameters.trgLang);
    await translatePage.mtLanguageSelector.selectDomain(translationParameters.domainToSet);
    let page2 = await translatePage.translationForm.enterUrlClickToOpenWebtranslate(translationParameters.url);
    webTranslatePage = new WebTranslatePage(page2);
    await webTranslatePage.checkTranslationBarInDefaultState();
    await expect(webTranslatePage.embeddedPageBody).toContainText('Proxy exceptions: Bad address');
  });

  test("detects and sets domain @smoke", async ({ page, baseURL }) => {
    translationParameters.url = 'https://estonia.ee/';
    translationParameters.domainToSet = null,
    translationParameters.domainToExpect = 'general',
    translatePage = new TranslatePage(page);
    await translatePage.mtLanguageSelector.selectLanguageDirection(translationParameters.srcLang, translationParameters.trgLang);
    let page2 = await translatePage.translationForm.enterUrlClickToOpenWebtranslate(translationParameters.url);
    webTranslatePage = new WebTranslatePage(page2);
    await webTranslatePage.checkTranslationBarInDefaultState();
    await webTranslatePage.checkFormInReadyState(translationParameters.url);
    await webTranslatePage.translateWebsite(translationParameters, false);
    await translatePage.mtLanguageSelector.checkActiveDomain(translationParameters.domainToExpect.charAt(0).toUpperCase());
  });
})