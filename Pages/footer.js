const { expect } = require('@playwright/test');

exports.Footer = class Footer {

  constructor(page) {
    this.page = page;   
    this.footerElement=page.locator('footer');
    this.dataProtectionLink = page.locator('a:has-text("Data Protection Conditions")');  
  }

  async openDataProtection() {
    await this.dataProtectionLink.click({timeout:3000});
    await expect(this.page, 'Data protection page should be opened when clicking the link in the footer').toHaveURL(/.*data-protection-conditions/);
  }

}