const { test } = require('@playwright/test');
const fs = require('fs');
let { expect } = require('@playwright/test');

//pages
const { TranslatePage } = require('../Pages/translatePage');
const { Header } = require('../Pages/header');

test.describe.parallel('file translate @file:', () => {
  let fileFormats = [];
  let translationParameters = {
    srcLang: 'English',
    trgLang: 'Estonian',
    srcLangCode: 'en',
    trgLangCode: 'et',
    domainToSet: 'general',
    domainToExpect: 'general',
    filePath: '',
    documentTranslationTimeout: 0,
    mobileView: false
  }

  test.beforeEach(async ({ page, baseURL, documentTranslationTimeout, mobileView, fileAPI }, testInfo) => {
    process.env.URL = baseURL;
    process.env.fileAPI = fileAPI;
    translationParameters.documentTranslationTimeout = documentTranslationTimeout;
    translationParameters.mobileView = mobileView;
    translatePage = new TranslatePage(page);
    await translatePage.navigate();
    header = new Header(page);
    await header.changeUILanguage('EN');
  });

  test("displays error for unsupported file @smoke", async ({ page, baseURL, supportedDocFormats }) => {
    translatePage = new TranslatePage(page);
    await translatePage.translationForm.uploadDocument('./TestData/Unsupported/en_pdf.pdf', true);
    await translatePage.translationForm.checkDisplayedError('format is not recognized. Translation is supported for these document formats: ' + supportedDocFormats);
    await translatePage.translationForm.checkTranslationFormInDefaultState();
  });

  test("displays error for file too large ", async ({ page, baseURL, docMaxFileSize }) => {
    translatePage = new TranslatePage(page);
    await translatePage.translationForm.uploadDocument('./TestData/Unsupported/large_file.docx', true);
    await translatePage.translationForm.checkDisplayedError('too big. Maximum size ' + docMaxFileSize);
    await translatePage.translationForm.checkTranslationFormInDefaultState();
  });

  test("displays error for empty file ", async ({ page, baseURL }) => {
    translatePage = new TranslatePage(page);
    await translatePage.translationForm.uploadDocument('./TestData/Unsupported/empty.txt', true);
    await translatePage.translationForm.checkDisplayedError('empty');
    await translatePage.translationForm.checkTranslationFormInDefaultState();
  });

  test("clears translation form when clicking X @smoke", async ({ page, baseURL }) => {
    translationParameters.filePath = './TestData/Supported/' + translationParameters.srcLangCode + '_docx.docx';
    translatePage = new TranslatePage(page);
    await translatePage.mtLanguageSelector.selectLanguageDirection(translationParameters.srcLang, translationParameters.trgLang);
    await translatePage.mtLanguageSelector.selectDomain('General');
    await translatePage.translationForm.uploadDocument(translationParameters.filePath);
    await translatePage.translationForm.clearTranslateFields();
    await translatePage.translationForm.uploadDocument(translationParameters.filePath);
    await translatePage.translationForm.startDocumentTranslation(translationParameters);
    await translatePage.translationForm.waitForDocumentTranslation(translationParameters);
    await translatePage.translationForm.clearTranslateFields();
  });

  test("cancels file translation", async ({ page, baseURL }) => {
    translationParameters.filePath = './TestData/Supported/' + translationParameters.srcLangCode + '_docx.docx';
    translatePage = new TranslatePage(page);
    await translatePage.mtLanguageSelector.selectLanguageDirection(translationParameters.srcLang, translationParameters.trgLang);
    await translatePage.mtLanguageSelector.selectDomain('General');
    await translatePage.translationForm.uploadDocument(translationParameters.filePath);
    await translatePage.translationForm.startDocumentTranslation(translationParameters);
    await translatePage.translationForm.cancelDocumentTranslation();
  });

  test("displays error for corrupted file", async ({ page, baseURL }) => {
    translationParameters.filePath = './TestData/Unsupported/' + 'en_docx_corrupted.docx';
    translatePage = new TranslatePage(page);
    await translatePage.mtLanguageSelector.selectLanguageDirection(translationParameters.srcLang, translationParameters.trgLang);
    await translatePage.mtLanguageSelector.selectDomain('General');
    await translatePage.translationForm.uploadDocument(translationParameters.filePath, false);
    //translate and wait for translation error 
    await translatePage.translationForm.startDocumentTranslation(translationParameters);
    await expect(async () => {
      await translatePage.translationForm.waitForDocumentTranslation(translationParameters);
    }).rejects.toThrowError("page.waitForResponse: Document translation error. Response status:200");
    await translatePage.translationForm.checkDisplayedError('Failed');
  });

  test("translates supported file @smoke", async ({ page, baseURL }) => {
    translationParameters.filePath = './TestData/Supported/' + translationParameters.srcLangCode + '_docx.docx';
    translatePage = new TranslatePage(page);
    await translatePage.mtLanguageSelector.selectLanguageDirection(translationParameters.srcLang, translationParameters.trgLang);
    await translatePage.mtLanguageSelector.selectDomain('General');
    await translatePage.translationForm.uploadDocument(translationParameters.filePath);
    await translatePage.translationForm.startDocumentTranslation(translationParameters);
    await translatePage.translationForm.waitForDocumentTranslation(translationParameters);
    let downloadedFilePath = await translatePage.translationForm.downloadDocument();
  });

  test("detects and sets domain @smoke", async ({ page, baseURL }) => {
    translationParameters.filePath = './TestData/Supported/' + translationParameters.srcLangCode + '_docx.docx';
    translationParameters.domainToSet = null,
    translationParameters.domainToExpect = 'general';
    translatePage = new TranslatePage(page);
    await translatePage.mtLanguageSelector.selectLanguageDirection(translationParameters.srcLang, translationParameters.trgLang);
    await translatePage.translationForm.uploadDocument(translationParameters.filePath);
    await translatePage.translationForm.startDocumentTranslation(translationParameters);
    await translatePage.translationForm.waitForDocumentTranslation(translationParameters);
    await translatePage.mtLanguageSelector.checkActiveDomain(translationParameters.domainToExpect);
  });
})