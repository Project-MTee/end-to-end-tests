const { test, expect } = require('@playwright/test');


//pages
const { TranslatePage } = require('../Pages/translatePage');
const { Header } = require('../Pages/header');

test.describe.parallel('text translate domain detection @text:', () => {
  let translationParameters =
  {
    srcLang: 'Estonian',
    trgLang: 'English',
    srcLangCode: 'et',
    trgLangCode: 'en',
    domainToSet: 'general',
    domainToExpect: 'general',
    textTranslationTimeout: 0,
    srcText: '',
    mobileView: false
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

  let textData = require('../TestData/textTranslate.json');
  let textDataFilteredEN = textData.filter(e => ((e.srcLang === 'en')))
  let textDataFilteredET = textData.filter(e => ((e.srcLang === 'et')))
  let textDataFilteredRU = textData.filter(e => ((e.srcLang === 'ru')))
  let textDataFilteredDE = textData.filter(e => ((e.srcLang === 'de')))

  for (const example of textDataFilteredEN) {
    test(`detects and sets domain en-et - ${example["domain"]}`, async ({ page, baseURL }) => {
      let srcText = example["text"];
      translationParameters.srcLang = 'English';
      translationParameters.trgLang = 'Estonian';
      translationParameters.srcLangCode = 'en';
      translationParameters.trgLangCode = 'et';
      translationParameters.domainToExpect = example["domain"];
      translationParameters.domainToSet = null,
        translatePage = new TranslatePage(page);
      await translatePage.mtLanguageSelector.selectLanguageDirection(translationParameters.srcLang, translationParameters.trgLang);
      await translatePage.translationForm.enterSrcText(srcText);
      let translations = await translatePage.translationForm.translateText([srcText], translationParameters, 30000);
      Promise.all(translations.map(async (response) => {
        await translatePage.translationForm.checkTranslationResponse(response, translationParameters)
      }));
      await translatePage.mtLanguageSelector.checkActiveDomain(translationParameters.domainToExpect.charAt(0).toUpperCase());
    });
  }

  for (const example of textDataFilteredET) {
    test(`detects and sets domain et-en - ${example["domain"]} @smoke`, async ({ page, baseURL }) => {
      let srcText = example["text"];
      translationParameters.srcLang = 'Estonian';
      translationParameters.trgLang = 'English';
      translationParameters.srcLangCode = 'et';
      translationParameters.trgLangCode = 'en';
      translationParameters.domainToExpect = example["domain"];
      translationParameters.domainToSet = null,
        translatePage = new TranslatePage(page);
      await translatePage.mtLanguageSelector.selectLanguageDirection(translationParameters.srcLang, translationParameters.trgLang);
      await translatePage.translationForm.enterSrcText(srcText);
      let translations = await translatePage.translationForm.translateText([srcText], translationParameters, 30000);
      Promise.all(translations.map(async (response) => {
        await translatePage.translationForm.checkTranslationResponse(response, translationParameters)
      }));
      await translatePage.mtLanguageSelector.checkActiveDomain(translationParameters.domainToExpect.charAt(0).toUpperCase());
    });
  }

  for (const example of textDataFilteredET) {
    test(`detects and sets domain de-et - ${example["domain"]}`, async ({ page, baseURL }) => {
      let srcText = example["text"];
      translationParameters.srcLang = 'German';
      translationParameters.trgLang = 'Estonian';
      translationParameters.srcLangCode = 'de';
      translationParameters.trgLangCode = 'et';
      translationParameters.domainToExpect = example["domain"];
      translationParameters.domainToSet = null,
        translatePage = new TranslatePage(page);
      await translatePage.mtLanguageSelector.selectLanguageDirection(translationParameters.srcLang, translationParameters.trgLang);
      await translatePage.translationForm.enterSrcText(srcText);
      let translations = await translatePage.translationForm.translateText([srcText], translationParameters, 30000);
      Promise.all(translations.map(async (response) => {
        await translatePage.translationForm.checkTranslationResponse(response, translationParameters)
      }));
      await translatePage.mtLanguageSelector.checkActiveDomain(translationParameters.domainToExpect.charAt(0).toUpperCase());
    });
  }

  for (const example of textDataFilteredRU) {
    test(`detects and sets domain ru-et - ${example["domain"]}`, async ({ page, baseURL }) => {
      let srcText = example["text"];
      translationParameters.srcLang = 'Russian';
      translationParameters.trgLang = 'Estonian';
      translationParameters.srcLangCode = 'ru';
      translationParameters.trgLangCode = 'et';
      translationParameters.domainToExpect = example["domain"];
      translationParameters.domainToSet = null,
        translatePage = new TranslatePage(page);
      await translatePage.mtLanguageSelector.selectLanguageDirection(translationParameters.srcLang, translationParameters.trgLang);
      await translatePage.translationForm.enterSrcText(srcText);
      let translations = await translatePage.translationForm.translateText([srcText], translationParameters, 30000);
      Promise.all(translations.map(async (response) => {
        await translatePage.translationForm.checkTranslationResponse(response, translationParameters)
      }));
      await translatePage.mtLanguageSelector.checkActiveDomain(translationParameters.domainToExpect.charAt(0).toUpperCase());
    });
  }
})