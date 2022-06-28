const { expect } = require('@playwright/test');
const { test } = require('./baseTest');

//pages
const { TranslatePage } = require('../Pages/translatePage');
const { Header } = require('../Pages/header');

test.describe('text translate @text:', () => {
  let translationParameters =
  {
    srcLang: 'Estonian',
    trgLang: 'English',
    srcLangCode: 'et',
    trgLangCode: 'en',
    domainToSet: 'general',
    domainToExpect: 'general',
    mobileView: false,
    textTranslationTimeout: 0,
    srcText: ''
  }

  test.beforeEach(async ({ page, baseURL, mobileView, textTranslationTimeout, textAPI }) => {
    process.env.URL = baseURL;
    process.env.textAPI = textAPI;
    translationParameters.textTranslationTimeout = textTranslationTimeout;
    translationParameters.mobileView = mobileView;
    translatePage = new TranslatePage(page);
    await translatePage.navigate();
    header = new Header(page);
    await header.changeUILanguage('EN');
  });

  test("translates a sentence @smoke", async ({ page, baseURL }) => {
    translationParameters.srcText = 'Tõlgi mind!';
    await translatePage.mtLanguageSelector.selectLanguageDirection(translationParameters.srcLang, translationParameters.trgLang);
    await translatePage.mtLanguageSelector.selectDomain(translationParameters.domainToSet);
    await translatePage.translationForm.enterSrcText(translationParameters.srcText);
    let translations = await translatePage.translationForm.translateText([translationParameters.srcText], translationParameters);
    Promise.all(translations.map(async (response) => {
      await translatePage.translationForm.checkTranslationResponse(response, translationParameters);
    }));
    await translatePage.translationForm.checkDisplayedTranslation([(await translations[0].json()).translations[0].translation]);
    await translatePage.translationForm.checkParagraphStyle();
  });

  test("translates paragraphs", async ({ page, baseURL }) => {
    translationParameters.srcText = 'tõlgi mind\nteine lause';
    translatePage = new TranslatePage(page);
    await translatePage.mtLanguageSelector.selectLanguageDirection(translationParameters.srcLang, translationParameters.trgLang);
    await translatePage.mtLanguageSelector.selectDomain(translationParameters.domainToSet);
    await translatePage.translationForm.enterSrcText(translationParameters.srcText);
    let translations = await translatePage.translationForm.translateText(translationParameters.srcText.split("\n"), translationParameters);
    Promise.all(translations.map(async (response) => {
      await translatePage.translationForm.checkTranslationResponse(response, translationParameters);
    }));
    await translatePage.translationForm.checkDisplayedTranslation([
      (await translations[0].json()).translations[0].translation,
      (await translations[1].json()).translations[0].translation
    ]);
  });

  test("translates text with multiple newlines", async ({ page, baseURL }) => {
    let srcText = 'tõlgi mind\n\n\nteine lause';
    let srcTextArray = ['tõlgi mind', 'teine lause'];
    translatePage = new TranslatePage(page);
    await translatePage.mtLanguageSelector.selectLanguageDirection(translationParameters.srcLang, translationParameters.trgLang);
    await translatePage.mtLanguageSelector.selectDomain(translationParameters.domainToSet);
    await translatePage.translationForm.enterSrcText(srcText);
    let translations = await translatePage.translationForm.translateText(srcTextArray, translationParameters);
    Promise.all(translations.map(async (response) => {
      await translatePage.translationForm.checkTranslationResponse(response, translationParameters);
    }));
    await translatePage.translationForm.checkDisplayedTranslation([
      (await translations[0].json()).translations[0].translation,
      '',
      '',
      (await translations[1].json()).translations[0].translation
    ]);
  });

  test("translates numbered lists", async ({ page, baseURL }) => {
    let srcText = '1.tõlgi mind\n2.tõlgi mind\n3.tõlgi mind';
    translatePage = new TranslatePage(page);
    await translatePage.mtLanguageSelector.selectLanguageDirection(translationParameters.srcLang, translationParameters.trgLang);
    await translatePage.mtLanguageSelector.selectDomain(translationParameters.domainToSet);
    await translatePage.translationForm.enterSrcText(srcText);
    let translations = await translatePage.translationForm.translateText(srcText.split("\n"), translationParameters);
    Promise.all(translations.map(async (response) => {
      await translatePage.translationForm.checkTranslationResponse(response, translationParameters);
    }));
    await translatePage.translationForm.checkDisplayedTranslation([
      (await translations[0].json()).translations[0].translation,
      (await translations[1].json()).translations[0].translation,
      (await translations[2].json()).translations[0].translation
    ]);
  });

  test("translates text with tabs", async ({ page, baseURL }) => {
    let srcText = 'tab1	tab2';

    translatePage = new TranslatePage(page);
    await translatePage.mtLanguageSelector.selectLanguageDirection(translationParameters.srcLang, translationParameters.trgLang);
    await translatePage.mtLanguageSelector.selectDomain(translationParameters.domainToSet);
    await translatePage.translationForm.enterSrcText(srcText);
    let translations = await translatePage.translationForm.translateText([srcText], translationParameters);
    Promise.all(translations.map(async (response) => {
      await translatePage.translationForm.checkTranslationResponse(response, translationParameters);
    }));
    await translatePage.translationForm.checkDisplayedTranslation([(await translations[0].json()).translations[0].translation]);
  });

  test("translates text appended to existing", async ({ page, baseURL }) => {
    let srcText = ['tõlgi mind', 'rohkem teksti'];
    translatePage = new TranslatePage(page);
    await translatePage.mtLanguageSelector.selectLanguageDirection(translationParameters.srcLang, translationParameters.trgLang);
    await translatePage.mtLanguageSelector.selectDomain(translationParameters.domainToSet);
    await translatePage.translationForm.enterSrcText(srcText[0]);
    let translations = await translatePage.translationForm.translateText([srcText[0]], translationParameters);
    Promise.all(translations.map(async (response) => {
      await translatePage.translationForm.checkTranslationResponse(response, translationParameters);
    }));
    await translatePage.translationForm.checkDisplayedTranslation([(await translations[0].json()).translations[0].translation]);
    await translatePage.translationForm.srcTextInput.press('Enter'); //press enter and type the next line
    await translatePage.translationForm.enterSrcText(srcText[1]);
    let translations2 = await translatePage.translationForm.translateText([srcText[1]], translationParameters);
    Promise.all(translations.map(async (response) => {
      await translatePage.translationForm.checkTranslationResponse(response, translationParameters);
    }));
    await translatePage.translationForm.checkDisplayedTranslation([
      (await translations[0].json()).translations[0].translation,
      (await translations2[0].json()).translations[0].translation]);
  });

  test("copies text translation @smoke", async ({ page, baseURL }) => {
    let srcText = 'tõlgi mind\nteine lause';
    await translatePage.mtLanguageSelector.selectLanguageDirection(translationParameters.srcLang, translationParameters.trgLang);
    await translatePage.mtLanguageSelector.selectDomain(translationParameters.domainToSet);
    await translatePage.translationForm.enterSrcText(srcText);
    let translations = await translatePage.translationForm.translateText(srcText.split("\n"), translationParameters);
    Promise.all(translations.map(async (response) => {
      await translatePage.translationForm.checkTranslationResponse(response, translationParameters);
    }));
    await translatePage.translationForm.checkDisplayedTranslation([
      (await translations[0].json()).translations[0].translation,
      (await translations[1].json()).translations[0].translation]);
    let displayedTranslations = await translatePage.translationForm.copyTranslation(); //click Copy btn, get trg field displayed values to compare to
    await translatePage.translationForm.checkCopiedText(displayedTranslations.map(s => s.trim(' ')).join('\n')); //elements in translation trg field have extra whitespaces around, trim them, then join paragraphs
  });

  test("restricts text input length @smoke", async ({ page, baseURL, textTranslateMaxLength }) => {
    translatePage = new TranslatePage(page);
    await expect(translatePage.translationForm.srcTextInput).toHaveAttribute('maxlength', '10000');
  });
})