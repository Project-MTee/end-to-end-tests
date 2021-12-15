const { test } = require('@playwright/test');
const fs = require('fs');
let { expect } = require('@playwright/test');
//pages
const { TranslatePage } = require('../Pages/translatePage');
const { Header } = require('../Pages/header');

test.describe('file translate all @file:', () => {

  let translationParameters = {
    srcLang: 'English',
    trgLang: 'Estonian',
    srcLangCode: 'en',
    trgLangCode: 'et',
    domainToSet: 'general',
    domainToExpect: 'general',
    filePath: '',
    waitForTranslation: 0,
    mobileView: false
  }

  test.beforeEach(async ({ page, baseURL, documentTranslationTimeout, mobileView, fileAPI }, testInfo) => {
    process.env.URL = baseURL;
    process.env.fileAPI = fileAPI;
    translationParameters.waitForTranslation = documentTranslationTimeout;
    translationParameters.mobileView = mobileView;
    translatePage = new TranslatePage(page);
    await translatePage.navigate();
    header = new Header(page);
    await header.changeUILanguage('EN');
  });


  let supportedFiles = [];
  fs.readdirSync('./TestData/Supported').forEach(file => {
    if (file.startsWith(translationParameters.srcLangCode)) {
      supportedFiles.push(file);
    }
  })

  for (const file of supportedFiles) {
    test(`translates supported file ${file} `, async ({ page, baseURL }) => {
      translationParameters.filePath = './TestData/Supported/' + file;
      translatePage = new TranslatePage(page);
      await translatePage.mtLanguageSelector.selectLanguageDirection(translationParameters.srcLang, translationParameters.trgLang);
      await translatePage.mtLanguageSelector.selectDomain(translationParameters.domainToSet);
      await translatePage.translationForm.uploadDocument(translationParameters.filePath);
      await translatePage.translationForm.startDocumentTranslation(translationParameters);
      await translatePage.translationForm.waitForDocumentTranslation(translationParameters);
      let downloadedFilePath = await translatePage.translationForm.downloadDocument();
    });
  }


  let fileNames = [];
  fs.readdirSync('./TestData/Filenames').forEach(file => { fileNames.push(file); })

  for (const file of fileNames) {
    test(`translates file with filename ${file}`, async ({ page, baseURL }) => {
      translationParameters.filePath = './TestData/Filenames/' + file;
      translationParameters.srcLang = 'Russian';
      translationParameters.trgLang = 'Estonian';
      translationParameters.srcLangCode = 'ru';
      translationParameters.trgLangCode = 'et';
      translatePage = new TranslatePage(page);
      await translatePage.mtLanguageSelector.selectLanguageDirection(translationParameters.srcLang, translationParameters.trgLang);
      await translatePage.mtLanguageSelector.selectDomain(translationParameters.domainToSet);
      await translatePage.translationForm.uploadDocument(translationParameters.filePath);
      await translatePage.translationForm.startDocumentTranslation(translationParameters);
      await translatePage.translationForm.waitForDocumentTranslation(translationParameters);
      let downloadedFilePath = await translatePage.translationForm.downloadDocument();
    });
  }

})