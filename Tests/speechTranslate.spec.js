const { test } = require('@playwright/test');
const { expect } = require('@playwright/test');

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
    expect(transcription).toContain('Sa oled liiga naljakas?');
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

  test("displays record button only for ET lang @smoke", async ({ page, baseURL }) => {
    translatePage = new TranslatePage(page);
    await translatePage.mtLanguageSelector.selectLanguageDirection('Estonian', 'English');
    expect(translatePage.speechRecording.recordButton).toBeVisible({ timeout: 2000 });
    await translatePage.mtLanguageSelector.selectLanguageDirection('English', 'Estonian');
    expect(translatePage.speechRecording.recordButton).toBeHidden({ timeout: 2000 });
    await translatePage.mtLanguageSelector.selectLanguageDirection('Russian', 'Estonian');
    expect(translatePage.speechRecording.recordButton).toBeHidden({ timeout: 2000 });
    await translatePage.mtLanguageSelector.selectLanguageDirection('German', 'Estonian');
    expect(translatePage.speechRecording.recordButton).toBeHidden({ timeout: 2000 });
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