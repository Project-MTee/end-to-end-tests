const { expect } = require('@playwright/test');

exports.Header = class Header {

  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    this.page = page;   
    this.headerElement=page.locator('header');
    this.logoImage = page.locator('.logo');
    this.aboutProjectLink = page.locator('a:has-text("About Project")');   //':is(a:has-text("About Project"), a:has-text("About In German"))'
    this.currentLang = page.locator('.current-lang');
    this.uiMenuButton = page.locator('[aria-label="Select language"]');
    this.uiLangMenu = page.locator('#mat-menu-panel-0');
    this.uiLangMenuItem= page.locator('#mat-menu-panel-0 .mat-menu-item');  
    this.interactiveElementsInHeader=page.locator(':is(header a, header button)'); //interactive elements in header list @keyboard to tab over
  }

  async openAboutProject() {
    await this.aboutProjectLink.click({timeout:3000});
    await expect(this.page, 'Should open the About page when clicking the link').toHaveURL(/.*about/);
  }

  async clickLogo(baseURL) {
    await this.logoImage.click({timeout:3000});
    await expect(this.page, 'Should open the baseUrl page when clicking the logo').toHaveURL(baseURL);
  }

  async openUILanguageMenu()
  {
    await expect(this.currentLang, 'UI language menu should be visible').toBeVisible(); 
    await this.uiMenuButton.click({timeout:3000});
    await expect(this.uiLangMenu, 'UI language menu should be opened when clicking it').toBeVisible();    
  }

  async changeUILanguage(languageCode) {   
    await this.openUILanguageMenu();
    await this.page.click('#mat-menu-panel-0 .mat-menu-item:has-text("'+languageCode+'")');
    await expect(this.uiLangMenu, 'UI language menu should be closed after selecting a language').toBeHidden();    //check menu closed
    await expect(this.currentLang, 'Current UI language should be set to the selected one').toHaveText(languageCode);  //check language set 
  }

  async checkAvailableUILanguages(languageCodes) {   
    await this.openUILanguageMenu();
    await expect(this.uiLangMenuItem,'Opened UI language menu should have the expected languages.').toHaveText(languageCodes);   
  }

 async chageUILanguageWithKeyboard(languageCode) //(accessibility)
 {
  let languages= await this.uiLangMenuItem.allInnerTexts();
  for(let i=0;i<languages.indexOf(languageCode);i++)
  {
  await this.page.keyboard.press('ArrowDown');
  }
  await this.page.keyboard.press('Enter');
  await expect(this.uiLangMenu, 'UI language menu should be closed after selecting a language with Enter').toBeHidden();    //check menu closed
  await expect(this.currentLang, 'Current UI language should be set to the selected one').toHaveText(languageCode); //check language set
 }

 async openUILanguageMenuWithKeyboard() //(accessibility)
 {
  await this.uiMenuButton.focus();
  await expect(this.uiMenuButton, 'UI language mneu should be focused').toBeFocused(); //check correct element focused
  await this.page.keyboard.press('Enter');
  await expect(this.uiLangMenu, 'UI language menu should be opened when pressing Enter while focused on it ').toBeVisible();  //check menu opened
 }

 async openAboutProjectWithKeyboard() //(accessibility)
 {
  await this.aboutProjectLink.focus();
  await expect(this.aboutProjectLink, 'About project link should be focused').toBeFocused(); //check correct element focused
  await this.page.keyboard.press('Enter');
  await expect(this.page, 'About project page should be opened when presing Enter while focused on About link').toHaveURL(/.*about/); //check correct url opened
}

}