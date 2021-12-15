const { expect } = require('@playwright/test');
const exp = require('constants');
const fs = require('fs');
const cheerio = require('cheerio');

const { MTLanguageSelector } = require('../Pages/mtLanguageSelector');
const { TranslatePage } = require('../Pages/translatePage');
const { TranslationForm } = require('../Pages/translationForm');

exports.WebTranslatePage = class WebTranslatePage {

  constructor(page) {
    this.page = page;
    this.mtLanguageSelector = new MTLanguageSelector(page);
    //buttons
    this.backButton = page.locator('.back-btn button');
    this.loadButton = page.locator('.load-btn button');
    this.cancelButton = page.locator('button.cancel-button');
    this.restoreButton = page.locator('button.restore-button');
    this.translateButton = page.locator('button.translate-button');
    //input  
    this.addressInput = page.locator('.address-input input');

    //progress
    this.progressBar = page.locator('#website-frame-container mat-progress-bar');
    this.progressBarFill = page.locator('#website-frame-container mat-progress-bar .mat-progress-bar-fill');
    //embedded page
    this.embeddedPageIframe = page.frameLocator('#website-frame').frameLocator('#letsmt-translate-page-iframe');
    this.embeddedPageBody = page.frameLocator('#website-frame').frameLocator('#letsmt-translate-page-iframe').locator('body');
    this.embeddedPageAltAttributes = page.frameLocator('#website-frame').frameLocator('#letsmt-translate-page-iframe').locator('body').locator('[alt]');
    this.embeddedPagePlaceholders = page.frameLocator('#website-frame').frameLocator('#letsmt-translate-page-iframe').locator('body').locator('[placeholder]');
    this.embeddedPageTitleAttributes = page.frameLocator('#website-frame').frameLocator('#letsmt-translate-page-iframe').locator('body').locator('[title]');
    this.embeddedSubmitButtons = page.frameLocator('#website-frame').frameLocator('#letsmt-translate-page-iframe').locator('body').locator('input[type=submit]');
    this.embeddedPageNoTranslate = page.frameLocator('#website-frame').frameLocator('#letsmt-translate-page-iframe').locator('body').locator('.notranslate');
    this.embeddedPageTranslateNoLocator = page.frameLocator('#website-frame').frameLocator('#letsmt-translate-page-iframe').locator('body').locator('[translate="no"]');
  }

  async checkFormInReadyState(url) {
    await expect(this.addressInput).not.toBeEmpty({ timeout: 10000 });
    await expect(this.progressBar).toBeHidden({ timeout: 20000 });
    await expect(this.translateButton).toBeVisible({ timeout: 10000 });
    await expect(this.translateButton).toBeEnabled({ timeout: 10000 });
    await expect(this.embeddedPageBody).toBeVisible({ timeout: 20000 });
    try {
      let innerTextArray = await this.embeddedPageBody.innerText();
      expect(innerTextArray.length).toBeGreaterThan(100);
    }
    catch (e) {
      throw new Error(`Website might have not loaded correctly. Expected the inner text lenght of the body to be greater than 100 chars. \nEx: ` + e);
    }
  }

  async getWebpageText() {
    let bodyTextArray = await this.embeddedPageBody.allInnerTexts();
    return bodyTextArray;
  }

  async getAltTexts() {
    let altTexts = [];
    let elemCount = await this.embeddedPageAltAttributes.count();
    for (let i = 0; i < elemCount; i++) {
      altTexts.push(await this.embeddedPageAltAttributes.nth(i).getAttribute('alt'));
    }
    return altTexts;
  }

  async getSubmitValueTexts() {
    let valueTexts = [];
    let elemCount = await this.embeddedSubmitButtons.count();
    for (let i = 0; i < elemCount; i++) {
      valueTexts.push(await this.embeddedSubmitButtons.nth(i).getAttribute('value'));
    }
    return valueTexts;
  }

  async getPlaceHolderTexts() {
    let placeholderTexts = [];
    let elemCount = await this.embeddedPagePlaceholders.count();
    for (let i = 0; i < elemCount; i++) {
      placeholderTexts.push(await this.embeddedPagePlaceholders.nth(i).getAttribute('placeholder'));
    }
    return placeholderTexts;
  }

  async getTitleTexts() {
    let titleTexts = [];
    let elemCount = await this.embeddedPageTitleAttributes.count();
    for (let i = 0; i < elemCount; i++) {
      titleTexts.push(await this.embeddedPageTitleAttributes.nth(i).getAttribute('title'));
    }
    return titleTexts;
  }

  async checkHasAllTranslations(translationResponses) {
    let translationsInPage = [];
    //get all titles, alt texts and placeholder values
    let alts = await this.getAltTexts();
    let titles = await this.getTitleTexts();
    let placeholders = await this.getPlaceHolderTexts();
    let submitValues = await this.getSubmitValueTexts();
    translationsInPage = translationsInPage.concat(alts);
    translationsInPage = translationsInPage.concat(titles);
    translationsInPage = translationsInPage.concat(submitValues);
    translationsInPage = translationsInPage.concat(placeholders);

    //get all page elements with translation class
    let translatedElements = await this.page.frameLocator('#website-frame').frameLocator('#letsmt-translate-page-iframe').locator('body').locator('.letsmt-translation');
    let cnt = await translatedElements.count();
    for (let i = 0; i < cnt; i++) {
      let segment = await translatedElements.nth(i).innerHTML();
      let convertedSegment = await this.convertTagsToMatchReceivedFromAPI(segment);
      translationsInPage.push(convertedSegment);
    }
    //check if response text matches text on page
    translationResponses.forEach(response => {
      response.translations.forEach(element => {
        let translationStr = element.translation.replace('&amp;', '&').replace('&', '&amp;') //replace & to match innerhtml if not &amp already
        expect(translationsInPage).toContain(translationStr)
      })
    })
  }

  async convertTagsToMatchReceivedFromAPI(segment) {
    //remove attributes and change tags to data-letsmt-tag values for comparison with received translations (<a data-letsmt-tag='a1'> to <a1>)
    let $ = cheerio.load(segment, null, false);
    $('[data-letsmt-tag]').each(
      function () {
        let tag = $(this).attr("data-letsmt-tag");
        this.tagName = tag
        this.attribs = {}
      }
    )
    return $.html();
  }

  async checkTranslationBarInDefaultState() {
    await expect(this.loadButton).toBeVisible({ timeout: 2000 });
    await expect(this.backButton).toBeVisible({ timeout: 2000 });
    await expect(this.addressInput).toBeVisible({ timeout: 2000 });
  }

  async translateWebsite(translationParameters, checkTagsInTranslation = true) {
    let translationResponses = [];
    await this.page.on('response', async response => {
      if (response.url().includes(process.env.textAPI)) {
        if (response.status() != 200) {
          throw new Error('Translation error. Response status:' + response.status() + ' | ' + JSON.stringify(response));
        }
        else {
          translatePage = new TranslatePage(this.page);
          await translatePage.translationForm.checkTranslationResponse(response, translationParameters);
          if (checkTagsInTranslation) { await this.checkResponseAndRequestTagsMatch(response); }
          translationResponses.push(await response.json());
        }
      }
    })
    
    await this.translateButton.click({ timeout: 5000 });
    await expect(this.cancelButton).toBeVisible({ timeout: 4000 });
    await expect(this.progressBar).toBeVisible({ timeout: 3000 });
    try {
      await expect(this.restoreButton).toBeVisible({ timeout: translationParameters.webTranslationTimeout });
    }
    catch (e) {
      throw new Error(`Translation took too much time or the Restore button didnt become visible in ${translationParameters.webTranslationTimeout} sec. \nEx: ` + e);
    }
    await expect(this.progressBar).toBeHidden({ timeout: 2000 });
    return translationResponses;
  }

  async checkResponseAndRequestTagsMatch(response) {
    let responseData = await response.json();
    let requestData = JSON.parse(await response.request().postData());
    let tagsResponse = []
    let tagsRequest = []
    for (let i = 0; i < responseData.translations.length; i++) {
      const reg = /<.+?>/g;
      tagsResponse = responseData.translations[i].translation.match(reg);
      tagsRequest = requestData.text[i].match(reg);

      if (responseData.translations[i].translation.includes('<unk>') || responseData.translations[i].translation.includes('&amp;lt;unk&amp;gt;')) {
        throw new Error(`Translation contains <unk> tags.\n\n Response was: ${JSON.stringify(responseData)}\n\n Request was: ${JSON.stringify(requestData)}.`);
      }
      if (tagsResponse != null && tagsRequest != null) {
        try {
          expect(tagsResponse.sort()).toEqual(tagsRequest.sort());
        }
        catch (e) {
          throw new Error(`Tags in translation request and response differ.\n\n Response was: ${JSON.stringify(responseData)}\n\n Request was: ${JSON.stringify(requestData)}.\nEx: ` + e);
        }
      }
    }
  }

  async checkRestoredText(before, after) {
    for (let i = 0; i < before.length; i++) {
      //remove spaces before comparing, because webpage Restore normalizes whitespaces
      before[i] = before[i].replace(/\s\s+/g, ' ');
      after[i] = after[i].replace(/\s\s+/g, ' ');
      expect(before[i]).toEqual(after[i]);
    }
  }

  //check if elements marked with class="notranslate" or translate="no"
  // have webtranslate class added to them atfer translation
  async checkNotTranslatingExcludedContent() {
    let countNoTranslate = await this.embeddedPageNoTranslate.count();
    let countTranslateNo = await this.embeddedPageTranslateNoLocator.count();
    if (countNoTranslate > 0) {
      for (let i = 0; i < countNoTranslate; i++) {
        expect(this.embeddedPageNoTranslate.nth(i)).not.toHaveClass('letsmt-translation');
      }
    }
    if (countTranslateNo > 0) {
      for (let i = 0; i < countTranslateNo; i++) {
        expect(this.embeddedPageTranslateNoLocator.nth(i)).not.toHaveClass('letsmt-translation');
      }
    }
  }
}