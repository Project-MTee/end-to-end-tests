let { expect } = require('@playwright/test');
const { time } = require('console');



exports.TranslationForm = class TranslationForm {

  constructor(page) {    
    this.page = page; 
    //buttons
    this.translateButton = page.locator('tld-translate-switcher button.translate-button');
    this.translateFileMobButton = page.locator('tld-translate-file button.translate-button');
    this.copyButton = page.locator('button.tld-copy-translation');
    this.closeButton = page.locator(':is(tld-translate-source tld-close-button button,tld-translate-file tld-close-button button)');
    this.downloadButton = page.locator('button.download-button');
    this.cancelButton = page.locator('button.cancel-button');
    this.uploadButton = page.locator('button.upload-button');
    this.recordButton= page.locator('tld-record button');
    this.recordButtonIcon= page.locator('tld-record button mat-icon');
    //inputs, outputs
    this.formBody= page.locator('tld-translate-body');
    this.srcInputWrapper=page.locator('.tld-translate-source-wrapper');
    this.srcTextInput = page.locator('.tld-translate-source-wrapper textarea');
    this.trgHighlightParagraph = page.locator('.tld-translate-target-wrapper .tld-highlight-tree'); //highlight-paragraph
    this.fileUpload = page.locator('.native-file-input');
    this.message = page.locator('.info-message-box');
    this.warningMessage = page.locator('.info-message-box.warning');
    this.errorMessage = page.locator('.info-message-box.error');
    this.errorEmailLink = page.locator('.info-message-box.error a');
    this.successMessage = page.locator('.info-message-box.success');
    this.closeMessageButton = page.locator('.info-message-box tld-close-button button');
    this.docPreview = page.locator('#docPreviewContent');
    this.trgWebsiteUrlLink = page.locator('.target-url-container a');
    //placeholders
    this.srcPlaceholder = page.locator('tld-translate-source .description-text');
    this.trgPlaceholder = page.locator('.target-description');
    //grammar
    this.invalidPhrase = page.locator('.tld-invalid-phrase');
    this.suggestionPanel=page.locator('.grammar-check-menu');
    this.buttonSuggestion=page.locator('.grammar-check-menu button');
  }

  async enterSrcText(text)
  {     
  //click into the src field for textarea to appear >> fill the src field
      await this.srcInputWrapper.click({timeout:4000, force:true});   
      await this.srcTextInput.type(text);     
  }
  
  async enterUrlClickToOpenWebtranslate(url)
  {
      await this.checkTranslationFormInDefaultState();
  //click into the src field for textarea to appear >> fill the src field
      await this.srcInputWrapper.click({timeout:4000, force:true});   
      await this.srcTextInput.fill(url,{timeout:2000});
  //click on the url in translation target field >> wait for new tab to open >> check the url of the new page		  
    let [newPage] = await Promise.all([
          this.page.waitForEvent('popup'),
          this.trgWebsiteUrlLink.click({timeout:2000})	
        ])
      await newPage.waitForLoadState();	
      let urlToExpect=encodeURIComponent(url).replace("%3A", ":"); //colon isn't urlencoded 
      await expect(newPage, 'Webtranslate should open in new page with url thatwas entered into text translation form').toHaveURL('web-translate\?url='+urlToExpect); 
    return newPage;
  }

async translateText(srcTextArray, translationParameters)
{	
  if(!translationParameters.mobileView) await this.translateButton.click({timeout:3000});

  // wait for translations, check response status, check request data
  let translations = await Promise.all(srcTextArray.map(async (txt) => {
        let response = await this.waitForMTResponse(txt, translationParameters.textTranslationTimeout);
        await this.checkTranslationRequest(await response.request(), txt, translationParameters);      
        return response;
  }));  
  return translations;
}

//wait for translations
//as there can be many translation requests wait for requests containing the specific src text
async waitForMTResponse(text, translationTime) {
  return await this.page.waitForResponse(async (response) => {
    if(response.url().includes(process.env.textAPI))
    {  
      if(response.status()!=200) 
      {         
        throw new Error('Text translation error. Response status:'+ response.status()+' | '+JSON.stringify(responseData));
      }    
        let request= await response.request();
        let postData= JSON.parse(await request.postData());      
        return postData.text.includes(text);
    }
}, {
  timeout: translationTime
});
}

//check the response has the expected structure and domain value
async checkTranslationResponse(response, translationParameters)
{     
      let expectedDomain = translationParameters.domainToExpect;     
      let responseData = await response.json();      
      //expect response containing domain and translations array  
      expect(responseData, 'Translation api response should contain the expected domain and translations').toEqual(expect.objectContaining({
      domain: expect.stringMatching(expectedDomain),
      translations:
      expect.arrayContaining([
            expect.objectContaining({translation:expect.any(String)})
      ])})
    );          
}

//check the request has the expected structure and values
async checkTranslationRequest(request, expectedSrcText, translationParameters)
{   
  let data = JSON.parse(await request.postData()); 
  expect(data, 'Translationapi request made by browser should have the expected domain, language direction and text').toEqual(expect.objectContaining({
      domain:  translationParameters.domainToSet,
      srcLang: expect.stringMatching(translationParameters.srcLangCode),
      trgLang: expect.stringMatching(translationParameters.trgLangCode),
      text:
        expect.arrayContaining([
        expect.stringMatching(expectedSrcText)
    ])})
  );  
}

//check the displayed translation
async checkDisplayedTranslation(expectedTranslations)
{   
    expect(this.trgHighlightParagraph,'UI should display all the received translation responses. Count should match.').toHaveCount(expectedTranslations.length, {timeout: 3000}); //expect UI to have correct number of paragraphs
    //check displayed translation paragraph by paragraph. Trim 
    let displayedTranslations=[];
    for(let i=0; i<expectedTranslations.length;i++)
    { 
      if(expectedTranslations[i]!='')
      { 
        await expect(this.trgHighlightParagraph.nth(i), 'Displayed paragraph should not be empty. Should contain the received translation: '+expectedTranslations[i]).not.toBeEmpty();    
      }  
        let innerText= (await this.trgHighlightParagraph.nth(i).innerText()); 
        displayedTranslations.push(innerText.trim());       
    }     
  expect(displayedTranslations, 'Displayed translations should match the translations received from API.').toEqual(expect.arrayContaining(expectedTranslations));
}

//check the displayed translations have the expected css alignment
async checkParagraphStyle()
{
    for(let i=0; i<this.trgHighlightParagraph.length;i++)
    {      
    await expect(this.trgHighlightParagraph.nth(i), 'Displayed translation should have the expected css style.').toHaveCSS('text-align', 'start'); //check the computed style of paragraph
    } 
}

//click the copy button, wait for the copy message to be displayed and check its displayed correctly
//grab and return the trg field text to compare it to the copied one
async copyTranslation()
{   
  await this.copyButton.click({timeout:4000});
  await expect(this.successMessage, 'Copy translation message should be displayed.').toBeVisible({timeout:3000});   
  await this.checkDisplayedMessage('Translation copied');
  return this.trgHighlightParagraph.allInnerTexts(); 
}

//compare the copied text to the expected text (from the trg field)
async checkCopiedText(expectedText)
{  
    //clear the src field and paste the copied text into it, compare text
    await this.clearTranslateFields();
    await this.srcInputWrapper.click({timeout:4000, force:true});  
    await this.page.keyboard.press('Control+v');    
    let txt=await this.srcTextInput.inputValue({timeout:4000}); 
    expect(txt, 'Copied text should match the expected. (Copied text is pasted into the translation source field for validation. If the values dont match check the pasted value.)').toEqual(expectedText);
}

//click the translate field X button, check if the expected placeholders are visible and the buttons are hidden
async clearTranslateFields()
{
    await this.closeButton.click({timeout:4000});
    await this.checkTranslationFormInDefaultState();
}

async checkTranslationFormInDefaultState()
{
 await expect(this.srcPlaceholder,'Translation form in default state should have the source field placeholder visible.').toBeVisible({timeout:2000});
 await expect(this.trgPlaceholder,'Translation form in default state should have the target field placeholder visible.').toBeVisible({timeout:2000});
 await expect(this.copyButton,'Translation form in default state should have the copy button hidden.').toBeHidden({timeout:2000});
 await expect(this.uploadButton,'Translation form in default state should have the upload button visible.').toBeVisible({timeout:2000});
 await expect(this.closeButton,'Translation form in default state should have the close button hidden.').toBeHidden({timeout:2000});
 await expect(this.translateButton,'Translation form in default state should have the translate button enabled.').toBeEnabled({timeout:2000});
}

// check if the displayed error has the expected text and appearance
async checkDisplayedError(errorText)
{      
    expect(this.errorMessage, 'Error message should be visible.').toBeVisible({timeout:3000});
    await expect(this.errorMessage,'Displayed error text doesnt match expected').toContainText(errorText);
    //check the computed style of the error	(light red background, red border)
    await expect(this.errorMessage, 'Displayed error message should have the expected background color.').toHaveCSS('background-color', 'rgb(253, 243, 243)');
    await expect(this.errorMessage,'Displayed error message should have the expected top border color.').toHaveCSS('border-top-color', 'rgb(229, 36, 46)');
    await expect(this.errorMessage,'Displayed error message should have the expected top border width.').toHaveCSS('border-top-width', '2px');
    await expect(this.errorMessage, 'Displayed error message should have the expected text color.').toHaveCSS('color', 'rgb(148, 0, 7)');  
    await expect(this.errorMessage,'Displayed error message should have the expected line height.').toHaveCSS('line-height', '20px'); 
}

  async checkErrorEmailAddress(email)
  {
    await expect(this.errorMessage, 'Email in error message should contain the expected address').toHaveAttribute('href', 'mailto:'+email);
  }

// check if the displayed warning has the expected text and appearance
  async checkDisplayedWarning(warningText)
  {	
    await expect(this.warningMessage,'Warning message should be visible.').toBeVisible();  
    await expect(this.warningMessage).toContainText(warningText); 
    //check the computed style of the warning (light orange background, orange border)
    await expect(this.warningMessage,'Displayed warning message should have the expected background color.' ).toHaveCSS('background-color', 'rgb(255, 245, 204)');
    await expect(this.warningMessage,'Displayed warning message should have the expected top border color.' ).toHaveCSS('border-top-color', 'rgb(255, 140, 0)');
    await expect(this.warningMessage, 'Displayed warning message should have the expected top border width.').toHaveCSS('border-top-width', '2px');  
    await expect(this.warningMessage, 'Displayed warning message should have the expected top border width.').toHaveCSS('color', 'rgb(90, 102, 114)');  
    await expect(this.warningMessage,'Displayed warning message should have the expected line height.' ).toHaveCSS('line-height', '20px');  
  }
// check if the displayed success message has the expected text and appearance
  async checkDisplayedMessage(successText)
  {	
    expect(this.successMessage,'Success message should be visible.').toBeVisible;
    await expect(this.successMessage).toContainText(successText); 
    //check the computed style of the warning (light green background, green border)
    await expect(this.successMessage,'Displayed success message should have the expected background color.').toHaveCSS('background-color', 'rgb(242, 255, 251)');
    await expect(this.successMessage,'Displayed success message should have the expected top border color.' ).toHaveCSS('border-top-color', 'rgb(37, 158, 118)');
    await expect(this.successMessage, 'Displayed success message should have the expected top border width.').toHaveCSS('border-top-width', '2px');  
    await expect(this.successMessage, 'Displayed success message should have the expected top border width.').toHaveCSS('color', 'rgb(0, 97, 65)');  
    await expect(this.successMessage,'Displayed success message should have the expected line height.' ).toHaveCSS('line-height', '20px');  
  }

//Document translation

async uploadDocument(filePath, displayError=false)
{			  
		await this.fileUpload.setInputFiles(filePath);
    if(!displayError)
    { 
      await expect(this.errorMessage, 'Error messageshould notbe displayed after uploading files').toBeHidden();
      await expect(this.docPreview, 'File icon with document format type should be displayed after uploading file').toBeVisible();
      await expect(this.docPreview, 'File icon with document format type should be displayed after uploading file').toHaveClass('no-preview type-'+(filePath.split('.').pop()).toLowerCase());
    }
    else
    { 
      await expect(this.errorMessage, 'Error message should be displayed after uploading file.').toBeVisible();
    }   
}

async startDocumentTranslation(translationParameters,displayError=false)
{	
  if(translationParameters.mobileView)  await this.translateFileMobButton.click({timeout:3000});
  else await this.translateButton.click({timeout:3000});
 
    if(!displayError)
    { 
      await expect(this.errorMessage, 'Error message should not be displayed after starting file translation.').toBeHidden();
    }
    else
    { 
      await expect(this.errorMessage,'Error message should be displayed after starting file translation.').toBeVisible();
    }
}

//wait for document translation
async waitForDocumentTranslation(translationParameters) {
  return await this.page.waitForResponse(async (response) => {
    if(response.url().includes(process.env.fileAPI))
    {           
        let responseData= await response.json();     
        await this.checkDocumentTranslationResponse(response, translationParameters);  
        if(responseData.status.includes('Error') || response.status()!=200) 
        {         
          throw new Error('Document translation error. Response status:'+ response.status()+' | '+JSON.stringify(responseData));
        }
        return responseData.status.includes('Completed');
    }
}, {
  timeout: translationParameters.documentTranslationTimeout
});
}

async checkDocumentTranslationResponse(response, translationParameters)
{   
  let responseData = await response.json();    
  if(responseData.domain!=null)
    {
     await expect(responseData,'File translation response should match the expected schema and contain translation values set in browser.').toEqual(expect.objectContaining({
          createdAt: expect.any(String),
          domain: expect.stringMatching(translationParameters.domainToExpect),         
          files: expect.arrayContaining([
                    expect.objectContaining({
                          id: expect.any(String),
                          extension: '.'+(translationParameters.filePath.split('.').pop()).toLowerCase(),
                          category: "Source",
                          size: expect.any(Number)
                  })
            ]),      
          id: expect.any(String),
          segments: expect.any(Number),
          srcLang: translationParameters.srcLangCode,
          status: expect.any(String),
          translatedSegments: expect.any(Number),
          trgLang: translationParameters.trgLangCode
        })
      );   
  }        
  else //auto domain detection starts returning the set domain after several responses, dont compare if still returning null
  {
   await expect(responseData, 'File translation response should match the expected schema and contain translation values set in browser.').toEqual(expect.objectContaining({
      createdAt: expect.any(String),      
      files: expect.arrayContaining([
                expect.objectContaining({
                      id: expect.any(String),
                      extension: '.'+(translationParameters.filePath.split('.').pop()).toLowerCase(),
                      category: "Source",
                      size: expect.any(Number)
              })
        ]),      
      id: expect.any(String),
      segments: expect.any(Number),
      srcLang: translationParameters.srcLangCode,
      status: expect.any(String),
      translatedSegments: expect.any(Number),
      trgLang: translationParameters.trgLangCode
    })
  );   
  }
}

//download file, return filepath
async downloadDocument()
{	 
	let [ download ] = await Promise.all([
	this.page.waitForEvent('download'),
  this.downloadButton.click({timeout:4000})
	]);
  await download.saveAs('./Downloads/'+await download.suggestedFilename());
	const path='./Downloads/'+await download.suggestedFilename();	
	return path;
}

async cancelDocumentTranslation()
{  
  await this.cancelButton.click({timeout:3000});
  await this.checkTranslationFormInDefaultState();
}

//grammar 
async translateAndCheckGrammarResponse(srcTextArray, translationParameters)
{
  if(!translationParameters.mobileView) await this.translateButton.click({timeout:3000});
  // wait for grammar suggestions, check response status, check request data
    let gramCheckResponses = await Promise.all(srcTextArray.map(async (txt) => {
          let response = await this.waitForGrammarResponse(txt,translationParameters);          
          await this.checkGrammarRequest(response);    
          return  await response.json();
    }));  
    return gramCheckResponses;
}

async waitForGrammarResponse(text,translationParameters)
{   
  return await this.page.waitForResponse(async (response) => {
    if(response.url().includes(process.env.grammarAPI))
    {        
        let request= await response.request();
        let postData= JSON.parse(await request.postData()); 
        return postData.text.includes(text) && response.status()==200;
    }
}, {
  timeout: translationParameters.grammarTimeout
});
}

async checkGrammarRequest(response)
{   
  let request = await response.request();
  let requestData = JSON.parse(await request.postData());   
  await expect(requestData, 'Grammar api request should match the expected schema and contain translation values set in browser.').toEqual(expect.objectContaining({
      text: expect.any(String),
      language: expect.any(String)
 }))
}

async checkGrammarResponse(responseData)
{   
 await expect(responseData,'Grammar api response should match the expected schema.').toEqual(expect.objectContaining({
    corrections:
        expect.arrayContaining([
              expect.objectContaining({
              span: 
              expect.objectContaining({
                start: expect.any(Number),
                end: expect.any(Number),
                value: expect.any(String)
              }),
              replacements:   
                  expect.arrayContaining([
                        expect.objectContaining({
                            value: expect.any(String)
                         })
                  ])
              })
          ]),
      corrected_text: expect.any(String)  
    })
);     
}

async checkUnderlinedPhrases(gramCheckResponses, translationTime)
{  
  //expect the displayed invalid phrase count to be the same as returned from API
  //expect the text to match
  let invalidPhrasesFromAPI = [];
  for(let responseData of gramCheckResponses)
  {       
    let phrases = responseData.corrections.map(function (x) { return x.span.value })
    invalidPhrasesFromAPI.push(...phrases);  
  }
  await expect(this.invalidPhrase, 'Displayed invalid phrase count should be the same as returned from grammar API. Check the underlined words if count doesnt match.').toHaveCount(invalidPhrasesFromAPI.length, {timeout: translationTime});  
  await expect(this.invalidPhrase, 'Displayed invalid phrase text should be the same as returned from grammar API.  Check the underlined words if text doesnt match.').toHaveText(invalidPhrasesFromAPI);

  //iterate over each invalid phrase and check the computed style is correct
  for(let i=0; i<invalidPhrasesFromAPI.length;i++)
  {   
    await this.checkUnderlineStyle(this.invalidPhrase.nth(i));
  }
  return invalidPhrasesFromAPI;
}

async checkUnderlineStyle(invalidPhrase)
{
  await expect(invalidPhrase, 'Underlined words should have "text" cursor').toHaveCSS('cursor', 'text');
  await expect(invalidPhrase, 'Underlined words should have text decoration style underline').toHaveCSS('text-decoration-line', 'underline');
  await expect(invalidPhrase, 'Underlined words should have wavy decorationline').toHaveCSS('text-decoration-style', 'wavy');
  await expect(invalidPhrase, 'Underlined words should have line thickness set to auto').toHaveCSS('text-decoration-thickness', 'auto');
  await expect(invalidPhrase, 'Underlined words should have red line color').toHaveCSS('text-decoration-color', 'rgb(255, 0, 0)');
}

async selectGrammarSuggestion(invalidPhraseText, correctionText, originalSentence)
{
  //click on the (underlined) invalid phrase >> click on the suggested correction in the menu
  let invalidPhraseLocator = this.page.locator('.tld-invalid-phrase:has-text("'+invalidPhraseText+'")'); 
  let correctionButtonLocator = this.page.locator('.grammar-check-menu .mat-button-wrapper:has-text(" '+correctionText+' ")'); 
  await this.page.waitForTimeout(1500);
  await invalidPhraseLocator.click({force:true, timeout:3000});
  await expect(this.suggestionPanel, 'Grammar suggestion popup should be visible after clicking on an underlined phrase').toBeVisible();
 //select the correction and wait for new grammar response
  await Promise.all([   
  await correctionButtonLocator.click({timeout:3000}),
  this.waitForGrammarResponse(originalSentence.replace(invalidPhraseText,correctionText),30000)
  ])
  await expect(this.suggestionPanel, 'Grammar suggestion popup should get hidden after selecting correction').toBeHidden({timeout:3000});
  await expect(this.errorMessage, 'Error message should notbe displayed after selecting grammar correction').toBeHidden({timeout:3000});
  await expect(this.suggestionPanel, 'Grammar suggestion popup should get hidden after selecting correction').toBeHidden({timeout:3000});
  //check the src text field contains the corretion and doesnt contain the invalid phrase
  await this.checkSrcInputFieldText(correctionText, invalidPhraseText);
}

async checkSrcInputFieldText(textToContain, textToNotContain)
{
  let inputFieldValue = await this.srcTextInput.inputValue()
  if(textToContain!=null) await expect(inputFieldValue, 'Source text input field should contain the expected text.').toEqual(expect.stringContaining(textToContain));
  if(textToNotContain!=null) await expect(inputFieldValue, 'Source text input field should not contain the expected text.').toEqual(expect.not.stringContaining(textToNotContain));
}

//KEYBOARD 
async translateTextWithKeyboard(srcTextArray, translationParameters)
{	
  await this.translateButton.focus();
  await expect(this.translateButton, 'Translate button should be focused after setting keyboard focus on it').toBeFocused();
  await this.page.keyboard.press('Enter');
  // wait for translations, check response status, check request data
  let translations = await Promise.all(srcTextArray.map(async (txt) => {
        let response = await this.waitForMTResponse(txt,translationParameters.textTranslationTimeout);
        await this.checkTranslationRequest(await response.request(), txt, translationParameters);    
        return response;
  }));  
  return translations;
}

async uploadDocumentWithKeyboard(filePath, displayError=false)
{ 
  const [fileChooser] = await Promise.all([
    this.page.waitForEvent('filechooser'),
    this.uploadButton.click({timeout:4000})
  ]);
  await fileChooser.setFiles(filePath);
  if(!displayError)
    { 
      await expect(this.errorMessage, 'Error message should notbe displayed after uploading files').toBeHidden();
      await expect(this.docPreview, 'File icon with document format type should be displayed after uploading file').toBeVisible();
      await expect(this.docPreview,'File icon with document format type should be displayed after uploading file').toHaveClass('no-preview type-'+filePath.split('.').pop());
    }
    else
    { 
      await expect(this.errorMessage,'Error message should be displayed after uploading file.').toBeVisible();
    } 
}

async startDocumentTranslationWithKeyboard(displayError=false)
{	
    await this.translateButton.focus();
    await expect(this.translateButton, 'Translate button should be focused after setting keyboard focus on it').toBeFocused();
    await  this.page.keyboard.press('Enter');
    if(!displayError)
    { 
      await expect(this.errorMessage, 'Error message should not be displayed after starting translation. Check the console log in test trace.').toBeHidden();
    }
    else
    { 
      await expect(this.errorMessage, 'Error message should be displayed after starting translation.').toBeVisible();
    }   
}

async downloadDocumentWithKeyboard()
{	 
  await this.downloadButton.focus();
  await expect(this.downloadButton, 'Download button should be focused after setting keyboard focus on it').toBeFocused({timeout:3000});  
	let [ download ] = await Promise.all([
	this.page.waitForEvent('download'),
  this.page.keyboard.press('Enter')
	]);
  await download.saveAs('./Downloads/'+await download.suggestedFilename());
	const path='./Downloads/'+await download.suggestedFilename();	
	return path;
}

async cancelDocumentTranslationWithKeyboard()
{  
  await this.cancelButton.focus();
  await expect(this.cancelButton, 'Cancel button should be focused after setting keyboard focus on it.').toBeFocused({timeout:3000});
  await this.page.keyboard.press('Enter');
  await this.checkTranslationFormInDefaultState();
}

async clearTranslateFieldsWithKeyboard()
{  
  await this.closeButton.focus();
  await expect(this.closeButton,'Close button should be focused after setting keyboard focus on it.').toBeFocused({timeout:3000});
  await this.page.keyboard.press('Enter');
  await this.checkTranslationFormInDefaultState();
}

async copyTranslationWithKeyboard()
{
  await this.copyButton.focus();
  await expect(this.copyButton, 'Copy button should be focused after setting keyboard focus on it.').toBeFocused({timeout:3000});
  await this.page.keyboard.press('Enter');
  await expect(this.successMessage,'Copy sucess message should be displayed after clicking copy button').toBeVisible({timeout:3000});   
  await this.checkDisplayedMessage('Translation copied');
  return this.trgHighlightParagraph.allInnerTexts();
}

async closeDisplayedMessageWithKeyboard()
{
  await this.closeMessageButton.focus();
  await expect(this.closeMessageButton,'Close button should be focused after setting keyboard focus on it.').toBeFocused({timeout:3000});
  await this.page.keyboard.press('Enter');
  await expect(this.message, 'Message should be hidden after closing it with keyboard.').toBeHidden({timeout:3000});     
}
}