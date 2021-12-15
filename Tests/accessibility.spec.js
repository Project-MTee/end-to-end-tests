const { test, chromium } = require('@playwright/test');
const { expect } = require('@playwright/test');

//pages
const { TranslatePage } = require('../Pages/translatePage');
const { WebTranslatePage } = require('../Pages/webTranslatePage');
const { Header } = require('../Pages/header');
const { MTLanguageSelector } = require('../Pages/mtLanguageSelector');

test.describe('accessibility checks @UI:', () => {

  let translationParameters =
  {
    srcLang: 'English',
    trgLang: 'Estonian',
    srcLangCode: 'en',
    trgLangCode: 'et',
    domainToSet: 'general',
    domainToExpect: 'general',
    filePath: '',
    textTranslationTimeout:0
  }

  test.beforeEach(async ({ page, baseURL, textAPI, fileAPI, speechAPI, grammarAPI, textTranslationTimeout }) => {
    process.env.URL = baseURL;
    process.env.textAPI = textAPI;
    process.env.fileAPI = fileAPI;
    process.env.speechAPI = speechAPI;
    process.env.grammarAPI = grammarAPI;
    translatePage = new TranslatePage(page);
    translationParameters.textTranslationTimeout=textTranslationTimeout;
    await translatePage.navigate();
    header = new Header(page);
    await header.changeUILanguage('EN');
  });

  let uiLanguages = ['EN', 'ET', 'DE', 'RU'];

  for (const languageCode of uiLanguages) {
    test(`changes UI lang @keyboard @${languageCode}`, async ({ page, baseURL }) => {
      header = new Header(page);
      await header.openUILanguageMenuWithKeyboard();
      await header.chageUILanguageWithKeyboard(languageCode);
    });
  }

  for (const languageCode of uiLanguages) {
    test(`updates html lang when changing UI language @${languageCode}`, async ({ page, baseURL }) => {
      header = new Header(page);
      await header.openUILanguageMenuWithKeyboard();
      await header.chageUILanguageWithKeyboard(languageCode);
      const locator = page.locator('html');
      await expect(locator).toHaveAttribute('lang', languageCode.toLowerCase(), { timeout: 1500 });
    });
  }

  test("opens About Project @keyboard", async ({ page, baseURL }) => {
    header = new Header(page);
    await header.openAboutProjectWithKeyboard();
  });

  const languageDirections = [
    'English:Estonian',
    'German:Estonian',
    'Russian:Estonian',
    'Estonian:English',
    'Estonian:Russian',
    'Estonian:German'
  ];
  for (const direction of languageDirections) {

    test(`sets mt language direction @keyboard ${direction}`, async ({ page, baseURL }) => {
      let langs = direction.split(':');
      let srcLang = langs[0]; let trgLang = langs[1];
      translatePage = new TranslatePage(page);
      await translatePage.mtLanguageSelector.selectLanguageDirectionWithKeyboard(srcLang, trgLang);
    });
  }

  

  test("translates text @keyboard", async ({ page, baseURL }) => {
    let srcText = 'translate me';
    translatePage = new TranslatePage(page);
    await translatePage.mtLanguageSelector.selectLanguageDirectionWithKeyboard(translationParameters.srcLang, translationParameters.trgLang);
    await translatePage.mtLanguageSelector.selectDomainWithKeyboard(translationParameters.domainToSet);
    await translatePage.translationForm.srcTextInput.type(srcText);
    let translations = await translatePage.translationForm.translateTextWithKeyboard([srcText], translationParameters)
    Promise.all(translations.map(async (response) => {
      await translatePage.translationForm.checkTranslationResponse(response, translationParameters);
    }));
    await translatePage.translationForm.checkDisplayedTranslation([(await translations[0].json()).translations[0].translation]);

  });

  test("clears translation fields @keyboard", async ({ page, baseURL }) => {
    let srcText = 'translate me';
    translatePage = new TranslatePage(page);
    await translatePage.mtLanguageSelector.selectLanguageDirectionWithKeyboard(translationParameters.srcLang, translationParameters.trgLang);
    await translatePage.mtLanguageSelector.selectDomainWithKeyboard(translationParameters.domainToSet);
    await translatePage.translationForm.srcTextInput.type(srcText);
    let translations = await translatePage.translationForm.translateTextWithKeyboard([srcText], translationParameters);
    await translatePage.translationForm.clearTranslateFieldsWithKeyboard();
    await expect(translatePage.translationForm.srcTextInput).toBeFocused(); //check focus returns back to previous element
  });


  test("copies and closes copy message @keyboard", async ({ page, baseURL }) => {
    let srcText = 'translate me';
    translatePage = new TranslatePage(page);
    await translatePage.mtLanguageSelector.selectLanguageDirectionWithKeyboard(translationParameters.srcLang, translationParameters.trgLang);
    await translatePage.mtLanguageSelector.selectDomainWithKeyboard(translationParameters.domainToSet);
    await translatePage.translationForm.srcTextInput.type(srcText);
    let translations = await translatePage.translationForm.translateTextWithKeyboard([srcText], translationParameters);
    await translatePage.translationForm.copyTranslationWithKeyboard();
    await translatePage.translationForm.closeDisplayedMessageWithKeyboard();
    await expect(translatePage.translationForm.copyButton).toBeFocused(); //check focus returns back to previous element
  });

  test("translates file @keyboard", async ({ page, baseURL }) => {
    translationParameters.filePath = './TestData/Supported/' + translationParameters.srcLangCode + '_docx.docx';
    translatePage = new TranslatePage(page);
    await translatePage.mtLanguageSelector.selectLanguageDirectionWithKeyboard(translationParameters.srcLang, translationParameters.trgLang);
    await translatePage.mtLanguageSelector.selectDomainWithKeyboard(translationParameters.domainToSet);
    await translatePage.translationForm.uploadDocumentWithKeyboard(translationParameters.filePath);
    await translatePage.translationForm.startDocumentTranslationWithKeyboard();
    await translatePage.translationForm.waitForDocumentTranslation(translationParameters);
    let downloadedFilePath = await translatePage.translationForm.downloadDocumentWithKeyboard();
  });

  test("cancels file translation @keyboard", async ({ page, baseURL }) => {
    translationParameters.filePath = './TestData/Supported/' + translationParameters.srcLangCode + '_docx.docx';
    translatePage = new TranslatePage(page);
    await translatePage.mtLanguageSelector.selectLanguageDirectionWithKeyboard(translationParameters.srcLang, translationParameters.trgLang);
    await translatePage.mtLanguageSelector.selectDomainWithKeyboard(translationParameters.domainToSet);
    await translatePage.translationForm.uploadDocumentWithKeyboard(translationParameters.filePath);
    await translatePage.translationForm.startDocumentTranslationWithKeyboard();
    await translatePage.translationForm.cancelDocumentTranslationWithKeyboard();
  });

  test("start and cancel speech recording @keyboard", async ({ page, baseURL }) => {
    translationParameters.srcLang = 'Estonian';
    translationParameters.trgLang = 'English';
    translationParameters.srcLangCode = 'et';
    translationParameters.trgLangCode = 'en';
    translatePage = new TranslatePage(page);
    await translatePage.mtLanguageSelector.selectLanguageDirection(translationParameters.srcLang, translationParameters.trgLang);
    await translatePage.mtLanguageSelector.selectDomain(translationParameters.domainToSet);
    await translatePage.speechRecording.startRecordingWithKeyboard();
    await translatePage.speechRecording.cancelRecordingWithKeyboard();
    await translatePage.speechRecording.checkRecorderInDefaultState();

  });

  for (const languageCode of uiLanguages) {
    test(`elements have accessible names or aria-labels @${languageCode}`, async ({ page, baseURL }) => {
      //change translation direction, so that speech recording is available
      translationParameters.srcLang = 'Estonian';
      translationParameters.trgLang = 'English';
      translatePage = new TranslatePage(page);
      await translatePage.mtLanguageSelector.selectLanguageDirectionWithKeyboard(translationParameters.srcLang, translationParameters.trgLang);

      header = new Header(page);
      let logoAltText = await header.logoImage.getAttribute('alt'); //logo
      expect(logoAltText).toMatchSnapshot('logoAltText' + languageCode + '.txt');
      //ui language menu
      let uiLangMenuButtonAriaLabel = await header.uiMenuButton.getAttribute('aria-label');
      expect(uiLangMenuButtonAriaLabel).toMatchSnapshot('uiLangMenuButtonAriaLabel' + languageCode + '.txt');

      //swap languages button
      mtLanguageSelector = new MTLanguageSelector(page);
      let swapLanguagesButtonAriaLabel = await mtLanguageSelector.swapLanguagesButton.getAttribute('aria-label');
      expect(swapLanguagesButtonAriaLabel).toMatchSnapshot('swapLanguagesButtonAriaLabel' + languageCode + '.txt');
      //domain menu
      let domainMenuTriggerAriaLabel = await mtLanguageSelector.domainMenuTrigger.getAttribute('aria-label');
      expect(domainMenuTriggerAriaLabel).toMatchSnapshot('domainMenuTriggerAriaLabel' + languageCode + '.txt');
      //src language menu
      let activeSrcLanguageAriaLabel = await mtLanguageSelector.activeSrcLanguage.getAttribute('aria-label');
      expect(activeSrcLanguageAriaLabel).toMatchSnapshot('activeSrcLanguageAriaLabel' + languageCode + '.txt');

      //src textarea
      translatePage = new TranslatePage(page);
      let srcTextInputAriaLabel = await translatePage.translationForm.srcTextInput.getAttribute('aria-label');
      expect(srcTextInputAriaLabel).toMatchSnapshot('srcTextInputAriaLabel' + languageCode + '.txt');

      //speech recording
      let startRecordingAriaLabel = await translatePage.speechRecording.recordButton.first().getAttribute('aria-label');
      expect(srcTextInputAriaLabel).toMatchSnapshot('startRecordingAriaLabel' + languageCode + '.txt');
      await translatePage.speechRecording.startRecording();
      let stopRecordingAriaLabel = await translatePage.speechRecording.stopButton.getAttribute('aria-label');
      expect(stopRecordingAriaLabel).toMatchSnapshot('stopRecordingAriaLabel' + languageCode + '.txt');
      await translatePage.speechRecording.cancelRecording();

      //clear button if text entered
      await translatePage.translationForm.enterSrcText('test');
      let closeButtonAriaLabel = await translatePage.translationForm.closeButton.getAttribute('aria-label');
      expect(closeButtonAriaLabel).toMatchSnapshot('clearTextButtonAriaLabel' + languageCode + '.txt');

      //clear button if file uploaded
      await translatePage.translationForm.clearTranslateFields();
      await translatePage.translationForm.uploadDocument('./TestData/Supported/' + 'en_docx.docx');
      let closeDocButtonAriaLabel = await translatePage.translationForm.closeButton.getAttribute('aria-label');
      expect(closeDocButtonAriaLabel).toMatchSnapshot('clearDocumentButtonAriaLabel' + languageCode + '.txt');
    });
  }

})