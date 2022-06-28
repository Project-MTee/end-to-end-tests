const { test } = require('./baseTest');

//pages
const { TranslatePage } = require('../Pages/translatePage');
const { Header } = require('../Pages/header');

test.describe('grammar check @grammar:', () => {

  let translationParameters =
  {
    srcLang: 'Estonian',
    trgLang: 'English',
    srcLangCode: 'et',
    trgLangCode: 'en',
    domainToSet: 'general',
    domainToExpect: 'general',
    mobileView: false,
    textTranslationTimeout: 0,
    grammarTimeout: 0
  }

  test.beforeEach(async ({ page, baseURL, mobileView, textTranslationTimeout, grammarAPI, textAPI, grammarTimeout }) => {
    process.env.URL = baseURL;
    process.env.grammarAPI = grammarAPI;
    process.env.textAPI = textAPI;
    translationParameters.textTranslationTimeout = textTranslationTimeout;
    translationParameters.mobileView = mobileView;
    translationParameters.grammarTimeout = grammarTimeout;
    translationParameters.textTranslationTimeout = textTranslationTimeout;
    translatePage = new TranslatePage(page);
    await translatePage.navigate();
    header = new Header(page);
    await header.changeUILanguage('EN');
  });

  let examples = {
    'multiple whitespaces': 'See  on',
    'multiple paragraphs': 'Valitsuse üldkorraldused, millega on kehtestatud koroonapandeemia ajal erinevaid piiranguid ja reegleid, peaks olema piiratuma ulatusega, ütles riigikohtunik Ivo Pilving.\nKui soovid lugemist jätkata digipaketti tellimata ega soovi seda teadet näha, on Sul võimalus reklaamiblokeerija välja lülitada.\n"Ühele piirile me viitasime ja sellele on ka Tallinna ringkonnakohus juba viidanud, et valitsuste üldkorralduste – millega kõik koroonapassi nõuded on täna kehtestatud – et nende limiit peab ükskord lõppema.\nSest üldkorralduse olemus on ka see, et tema juriidiline toimeala peab siiski kuidagiviisi olema piiratud. Ta ei saa olla nii üldkehtiv nagu üks seadus. Ja kui ta muul viisil piiratud ei ole nagu näiteks teatud isikute grupi jaoks või midagi taolist, siis peab ta olema piiratud ajaliselt," rääkis riigikohtu halduskolleegiumi esimees Pilving neljapäeval peetud pressikonverentsil.',
  }

  for (const ex in examples) {
    test(`underlines mistakes - ${ex} @smoke`, async ({ page, baseURL }) => {
      let srcText = examples[ex];
      translatePage = new TranslatePage(page);
      await translatePage.mtLanguageSelector.selectLanguageDirection(translationParameters.srcLang, translationParameters.trgLang);
      await translatePage.translationForm.enterSrcText(srcText);
      let gramCheckResponses = await translatePage.translationForm.translateAndCheckGrammarResponse(srcText.split('\n'), translationParameters);
      Promise.all(gramCheckResponses.map(async (response) => {
        await translatePage.translationForm.checkGrammarResponse(response);
      }));
      await translatePage.translationForm.checkUnderlinedPhrases(gramCheckResponses,10000); //check underlined text and computed css style
    });
  }

  test("picks suggestion @smoke", async ({ page, baseURL }) => {
    let srcText = 'see On\nüldkorralduse  laialt.';
    translatePage = new TranslatePage(page);
    await translatePage.mtLanguageSelector.selectLanguageDirection(translationParameters.srcLang, translationParameters.trgLang);
    await translatePage.translationForm.enterSrcText(srcText);
    let gramCheckResponses = await translatePage.translationForm.translateAndCheckGrammarResponse(srcText.split('\n'), translationParameters);
    Promise.all(gramCheckResponses.map(async (response) => {
      await translatePage.translationForm.checkGrammarResponse(response);
    }));
    //iterate invalid phrases and pick the suggestions >> check if text is replaced in src field
    let invalidPhrases = [];
    let corrections = [];
    for (let i = 0; i < gramCheckResponses.length; i++) {
      invalidPhrases = gramCheckResponses[i].corrections.map(function (x) { return x.span.value });
      corrections = gramCheckResponses[i].corrections.map(function (x) { return x.replacements[0].value });
      for (let j = 0; j < invalidPhrases.length; j++) {
        let fixedSentenceToExpect = (srcText.split('\n')[i]).replace(invalidPhrases[j], corrections[j]);
        await translatePage.translationForm.selectGrammarSuggestion(invalidPhrases[j], corrections[j], fixedSentenceToExpect);
      }
    }
  });

})