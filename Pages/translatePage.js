const { expect } = require('@playwright/test');

const {MTLanguageSelector}= require('../Pages/mtLanguageSelector');
const {TranslationForm}= require('../Pages/translationForm');
const {SpeechRecording}= require('../Pages/speechRecording');

exports.TranslatePage = class TranslatePage {

  constructor(page) {
    this.url=process.env.URL;   
    this.page = page;
    this.mtLanguageSelector=new MTLanguageSelector(page);
    this.translationForm= new TranslationForm(page);
    this.speechRecording= new SpeechRecording(page);
  }

  async navigate()
  {	
    await Promise.all([        
	  	this.page.waitForResponse(response => response.url().includes('assets/config.json') && response.status() === 200),
      this.page.waitForResponse(response => response.url().includes('api/translate/languageDirection') && response.status() === 200),
      this.page.waitForResponse(response => response.url().includes('css') && response.status() === 200),
	  	this.page.goto(this.url)       
	]);   
  await expect(this.page).toHaveURL(this.url);
 }
  
}