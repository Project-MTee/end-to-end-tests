const { test } = require('@playwright/test');

//pages
const { TranslatePage } = require('../Pages/translatePage');
const { Footer } = require('../Pages/footer');

test.describe('footer checks:', () => {

  test.beforeEach(async ({ page, baseURL }) => {
    process.env.URL = baseURL;
    translatePage = new TranslatePage(page);
    await translatePage.navigate();
  });

  test("opens Data protection", async ({ page, baseURL }) => {
    footer = new Footer(page);
    await footer.openDataProtection();
  });

})