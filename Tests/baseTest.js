const base = require('@playwright/test');

exports.test = base.test.extend({
    baseURL:['', { option: true }],
    textAPI:  ['', {option: true}],
    fileAPI:  ['', {option: true}],
    speechAPI:  ['', {option: true}],
    grammarAPI:  ['', {option: true}],
    textTranslationTimeout: [20000, {option: true}],	 
    documentTranslationTimeout: [120000, {option: true}],
    grammarTimeout: [20000, {option: true}],
    webTranslationTimeout: [120000, {option: true}],
    speechToTextTimout: [10000, {option: true}],
	navigationTimeout:  [20000, {option: true}], 
    uiLanguages:[[''], {option:true}],
    supportedDocFormats:['.docx, .xlsx, .odt, .tmx, .pptx, .txt', {option:true}], //only for checking the err message, file translation grabs everything from TestData\Supported folder
    docMaxFileSize:['30MB',{option:true}],
    textTranslateMaxLength: [10000, {option:true}],	    
    mobileView:  [false, { option: true }],   
  });