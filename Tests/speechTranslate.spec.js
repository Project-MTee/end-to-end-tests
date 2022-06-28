const { expect } = require('@playwright/test');
const { test } = require('./baseTest');

//pages
const { TranslatePage } = require('../Pages/translatePage');
const { Header } = require('../Pages/header');

test.describe('speech translate @speech:', () => {

  translationParameters =
  {
    srcLang: 'Estonian',
    trgLang: 'English',
    srcLangCode: 'et',
    trgLangCode: 'en',
    domainToSet: 'general',
    speechToTextTimout: 8000,
    textTranslationTimeout: 10000,
    mobileView: false
  }

  test.beforeEach(async ({ page, baseURL, mobileView, speechToTextTimout, textAPI, speechAPI, grammarAPI }) => {
    process.env.URL = baseURL;
    process.env.textAPI = textAPI;
    process.env.speechAPI = speechAPI;
    process.env.grammarAPI = grammarAPI;
    translationParameters.mobileView = mobileView;
    translationParameters.speechToTextTimout = speechToTextTimout;
    translatePage = new TranslatePage(page);
    await translatePage.navigate();
    header = new Header(page);
    await header.changeUILanguage('EN');
  });

  test("transcribes and translates speech @smoke", async ({ page, baseURL }) => {
    translatePage = new TranslatePage(page);
    await translatePage.mtLanguageSelector.selectLanguageDirection(translationParameters.srcLang, translationParameters.trgLang);
    await translatePage.mtLanguageSelector.selectDomain(translationParameters.domainToSet);
    await translatePage.speechRecording.startRecording();
    await page.waitForTimeout(4000); //audio test file is 2 secs long
    await translatePage.speechRecording.stopRecording();
    let response = await translatePage.speechRecording.waitForSpeechRecognition(translationParameters);
    let transcription = (await response.json()).transcription;
    await expect(transcription, 'Transcription should contain the expected text').toContain('Sa oled liiga naljakas?');
    let translationResponse = await translatePage.translationForm.waitForMTResponse(transcription, translationParameters.textTranslationTimeout);
    await translatePage.translationForm.checkSrcInputFieldText(transcription);
  });

  test("cancels recording returns UI to default", async ({ page, baseURL }) => {
    translatePage = new TranslatePage(page);
    await translatePage.mtLanguageSelector.selectLanguageDirection(translationParameters.srcLang, translationParameters.trgLang);
    await translatePage.mtLanguageSelector.selectDomain(translationParameters.domainToSet);
    await translatePage.speechRecording.startRecording();
    await translatePage.speechRecording.cancelRecording();
    await translatePage.speechRecording.checkRecorderInDefaultState();
    await translatePage.translationForm.checkTranslationFormInDefaultState();
  });

  test.only("displays record button only for ET lang @smoke", async ({ page, baseURL }) => {
    translatePage = new TranslatePage(page);
    await translatePage.mtLanguageSelector.selectLanguageDirection('Estonian', 'English');
    await expect(translatePage.speechRecording.recordButton, 'Record button should be visible for Estonian-English').toBeVisible({ timeout: 2000 });
    await translatePage.mtLanguageSelector.selectLanguageDirection('English', 'Estonian');
    await expect(translatePage.speechRecording.recordButton, 'Record button should be hidden for English-Estonian').toBeHidden({ timeout: 2000 });
    await translatePage.mtLanguageSelector.selectLanguageDirection('Russian', 'Estonian');
    await expect(translatePage.speechRecording.recordButton, 'Record button should be hidden for Russian-Estonian').toBeHidden({ timeout: 2000 });
    await translatePage.mtLanguageSelector.selectLanguageDirection('German', 'Estonian');
    await expect(translatePage.speechRecording.recordButton,'Record button should be hidden for German-Estonian').toBeHidden({ timeout: 2000 });
  });

  test("displays recording time", async ({ page, baseURL }) => {
    translatePage = new TranslatePage(page);
    await translatePage.mtLanguageSelector.selectLanguageDirection(translationParameters.srcLang, translationParameters.trgLang);
    await translatePage.speechRecording.startRecording();
    await page.waitForTimeout(2000);
    await translatePage.speechRecording.checkDisplayedTimer('00:02');
    await page.waitForTimeout(2000);
    await translatePage.speechRecording.checkDisplayedTimer('00:04');
    await page.waitForTimeout(2000);
    await translatePage.speechRecording.checkDisplayedTimer('00:06');
  });
})