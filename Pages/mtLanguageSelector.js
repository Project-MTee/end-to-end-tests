const { expect } = require('@playwright/test');
const { Console } = require('console');
const {Header} = require('../Pages/header');

exports.MTLanguageSelector = class MTLanguageSelector {

constructor(page) {    
    this.page = page;
    this.activeElement = page.locator('.active');
    this.activeSrcLanguage = page.locator('#tld-source-language-list .language-title button'); 
    this.activeTrgLanguage = page.locator('#tld-target-language-list .language-title');
    this.activeTrgLanguageButton = page.locator('#tld-target-language-list .language-title button');
    this.srcMenuTrigger = page.locator('#tld-source-language-list tld-open-close-button.mat-menu-trigger');
    this.trgMenuTrigger = page.locator('#tld-target-language-list tld-open-close-button.mat-menu-trigger');  
    this.srcMenu = page.locator('data-test-id=src-lang-menu');
    this.trgMenu = page.locator('data-test-id=trg-lang-menu');
    this.srcMenuButtons = page.locator('data-test-id=src-lang-menu>>.language-title'); //button
    this.trgMenuButtons = page.locator('data-test-id=trg-lang-menu>>.language-title'); //button
    this.domainMenuTrigger = page.locator('tld-domain-list button');
    this.domainMenu = page.locator('data-test-id=tld-domain-list');
    this.domainMenuOptions = page.locator('data-test-id=tld-domain-list>>button');
    this.swapLanguagesButton = page.locator('.swap-languages-button');
  }

  async selectLanguageDirection(srcLanguageToSet, trgLanguageToSet)
  {    
     let activeSrcLang = await this.activeSrcLanguage.innerText({timeout:3000});
     let activeTrgLang = await this.activeTrgLanguage.innerText({timeout:3000});
    
    if(!activeSrcLang.includes(srcLanguageToSet)) //check if source language not already active
    {            
        await this.selectSrcLang(srcLanguageToSet);
        activeTrgLang = await this.activeTrgLanguage.innerText({timeout:3000});
    }
    else if(!activeTrgLang.includes(trgLanguageToSet)) //check if target language not already active
    {
        await this.selectTrgLang(trgLanguageToSet);      
    } 
    //check languages set correctly
    await this.checkActiveLanguages(srcLanguageToSet, trgLanguageToSet);  
  }

  async checkActiveLanguages(srcLanguageToSet,trgLanguageToSet)
  {	
    await expect(this.activeSrcLanguage, 'Active source language should be '+srcLanguageToSet).toContainText(srcLanguageToSet);
    await expect(this.activeTrgLanguage, 'Active target language should be '+trgLanguageToSet).toContainText(trgLanguageToSet);    
  }

  async selectSrcLang(srcLanguageToSet)
  { 
    await this.srcMenuTrigger.click({timeout:3000});
    await expect(this.srcMenu, 'Source language menu should be opened after clicking the menu trigger').toBeVisible({timeout:3000});    
    await this.page.click('data-test-id=src-lang-menu >>text='+srcLanguageToSet,{timeout:3000});
    await expect(this.srcMenu, 'Source language menu should be closed after selecting the language').toBeHidden({timeout:3000});  
  }

  async selectTrgLang(trgLanguageToSet)
  {
    await this.trgMenuTrigger.click({timeout:3000});
    await expect(this.trgMenu, 'Target language menu should be opened after clicking the menu trigger').toBeVisible({timeout:3000});    
    await this.page.click('data-test-id=trg-lang-menu >>text='+trgLanguageToSet,{timeout:3000});
    await expect(this.trgMenu, 'Target language menu should be closed after selecting the language').toBeHidden({timeout:3000});   
  }
 
  async selectDomain(domainName)
  {
    await this.domainMenuTrigger.click({timeout:3000});
    await expect(this.domainMenu, 'Domain menu should be opened after clicking the menu trigger').toBeVisible({timeout:3000});    
    await this.page.click('data-test-id=tld-domain-list >>text='+domainName,{timeout:3000});
    await expect(this.domainMenu, 'Domain menu should be closed after selecting the language').toBeHidden({timeout:3000});   
  }

  async checkActiveDomain(domain)
  {	     
    await expect(this.domainMenuTrigger,'Active domain language should be '+domain).toContainText(domain.charAt(0).toUpperCase());  
  }

// @keyboard for accessibility checks 

async selectLanguageDirectionWithKeyboard(srcLanguageToSet, trgLanguageToSet)
{    
  let activeSrcLang = await this.activeSrcLanguage.innerText({timeout:3000});
  let activeTrgLang = await this.activeTrgLanguage.innerText({timeout:3000});

  if(!activeSrcLang.includes(srcLanguageToSet)) //check if source language not already active
  {  
      //open dropdown & select language        
      await this.openSrcMenuWithKeyboard();      
      await this.selectSrcLangWithKeyboard(srcLanguageToSet);
      activeTrgLang = await this.activeTrgLanguage.innerText({timeout:3000});
  }
  else if(!activeTrgLang.includes(trgLanguageToSet)) //check if target language not already active
  {
      await this.openTrgMenuWithKeyboard();     
      await this.selectTrgLangWithKeyboard(trgLanguageToSet);      
  } 
 //check active languages  
 await expect(this.activeSrcLanguage, 'Active source language should be '+srcLanguageToSet).toContainText(srcLanguageToSet);
 await expect(this.activeTrgLanguage, 'Active target language should be '+trgLanguageToSet).toContainText(trgLanguageToSet);  
}

  async openSrcMenuWithKeyboard()
  {     
    await this.activeSrcLanguage.focus();
    await expect(this.activeSrcLanguage, 'Source language menu should be focused').toBeFocused();
    await  this.page.keyboard.press('Enter');
    await expect(this.srcMenu, 'Source menu should be opened after pressing Enter when focused on menu').toBeVisible({timeout:3000});    
  }

  async openTrgMenuWithKeyboard()
  {    
    if(this.activeTrgLanguageButton.isVisible)  await this.activeTrgLanguageButton.focus();
    else  await this.activeTrgLanguage.focus();

    await this.page.keyboard.press('Enter');
    await expect(this.trgMenu,'Target menu should be opened after pressing Enter when focused on menu').toBeVisible({timeout:3000});   
  }  

  async selectSrcLangWithKeyboard(srcLanguageToSet)
  {     
    let srcLanguagesInDropdown= await this.srcMenuButtons.allTextContents();
    let srcLanguagesInDropdownTrim= srcLanguagesInDropdown.map(str => str.trim());  
      for(let i=0;i<srcLanguagesInDropdownTrim.indexOf(srcLanguageToSet);i++)
        {            
        await this.page.keyboard.press('ArrowDown');
        }
        await this.page.keyboard.press('Enter');         
        await expect(this.srcMenu,'Source menu should be closed after selecting a language with Enter').toBeHidden({timeout:3000});     
  }

  async selectTrgLangWithKeyboard(trgLanguageToSet)
  {
    let trgLanguagesInDropdown= await this.trgMenuButtons.allTextContents();
    let trgLanguagesInDropdownTrim = trgLanguagesInDropdown.map(str => str.trim());  
      for(let i=0;i<trgLanguagesInDropdownTrim.indexOf(trgLanguageToSet);i++)
        {          
        await this.page.keyboard.press('ArrowDown');
        }
        await this.page.keyboard.press('Enter');         
        await expect(this.trgMenu, 'Target menu should be closed after selecting a language with Enter').toBeHidden({timeout:3000}); 
  }

  async selectDomainWithKeyboard(domainToSet)
  { 
    domainToSet = domainToSet[0].toUpperCase() + domainToSet.substring(1);
    await this.domainMenuTrigger.focus();  
    await expect(this.domainMenuTrigger, 'Domain menu should be focused').toBeFocused();
    await this.page.keyboard.press('Enter');
    await expect(this.domainMenu, 'Domain menu should be opened after pressing Enter when focused on menu').toBeVisible({timeout:3000});  
    let domains= await this.domainMenuOptions.allInnerTexts({timeout:5000});  
    for(let i=0;i<domains.indexOf(domainToSet);i++)
    {            
    await this.page.keyboard.press('ArrowDown');
    }
    await this.page.keyboard.press('Enter');         
    await expect(this.domainMenu,'Domain menu should be closed after selecting a domain with Enter').toBeHidden({timeout:3000});     
  }
  
}