# Playwright-e2e-tests

Contains e2e tests written in Playwright and run by Playwright Test test runner

  

## Requirements

Requires Playwright Test 1.23.0 and Node.js 14 or higher.

```

# install PlayWright Test

npm i -D @playwright/test@1.23.0

# install supported browsers

npx playwright install

```

  

## Running Tests

On **first run** or when **there have been visual or textual changes** in the website it's necessary to run the tests with `--update-snapshots` flag. This will update the reference files for accessibility, visual matching and uiTexts tests in \Tests folder. Otherwise these tests will fail. 
There can be screenshot rendering differences between different environments and chromium versions so it's advised to update snapshots when running in different environment or updating Playwright version.
```
# Update snapshots
npx playwright test --config=playwright.config.js --project=Desktop-Chrome --update-snapshots
```

Run all desktop tests:

```
npx playwright test --config=playwright.config.js --project=Desktop-Chrome
```

Run desktop smoke tests:

```
npx playwright test --config=playwright.config.js --project=Desktop-Chrome --grep @smoke
```

Run all mobile tests:

```
npx playwright test --config=playwright.config.js --project=Mobile-Chrome
```

Run all tablet tests:

```
npx playwright test --config=playwright.config.js --project=Tablet-Chrome
```

**Tests can be filtered** using `--grep` followed by a tag: `@smoke`, `@text`, `@web`, `@file`,` @grammar`, `@speech` and `@UI`. '@smoke' will run a short list of smoketests. '@UI' will run accessibility, uiTexts and visualMatching tests.
```
# Run only speech recognition tests

npx playwright test --config=playwright.config.js --project=Desktop-Chrome --grep @speech

# Run all the tests exluding accessibility, uiTexts and visualMatching (@UI tag)

npx playwright test --config=playwright.config.js --project=Desktop-Chrome --grep-invert @UI
```
  

## Test Results

- Results are displayed in console and written to junit xml file 'results.xml'

- Result reporter type can be changed in playwright.config.js under 'reporter'. Or passing `--reporter` command line option. ( see: https://playwright.dev/docs/test-reporters#built-in-reporters). 
```
npx playwright test --config=playwright.config.js --project=Mobile-Chrome --reporter=dot
```

- Folder 'test-results' will be generated for each failed test, containing a screenshot, snapshot diffs and trace.zip file. Trace.zip contains the browsers' trace of the test run with screenshots, console log and network traffic.

- To view the contents of trace.zip upload it to https://trace.playwright.dev/ or open with npx playwright show-trace [path to trace.zip] (see: https://playwright.dev/docs/trace-viewer#viewing-the-trace)
- File translation tests will generate a \Downloads folder with the downloaded translations.

  

## Configuration

Test configuration can be changed in **playwright.config.js** file. Update baseURL running against different environment.

Configuration is divided into 3 projects *Desktop-Chrome*, *Mobile-Chrome* and *Tablet-Chrome* that run specific sets of tests in different screen resolutions/scale factors to simulate browser behavior on a desktop and mobile device.
Tests run on 3 parallel test workers. Increasing the number might not speed up the overall time or result in translation timeouts if website and document translation uses the same translation system at the same time.

Timeouts can be changed for the whole test run, each test, navigation and translations.
```
const  config = {
workers:3, //number of parallel test workers
globalTimeout:  30*60*1000, //global timeout for the whole test run
timeout:  160000, //timeout for each test
...
use:{
textTranslationTimeout:  20000, //timeout for text translation requests
grammarTimeout:  20000, //timeout for text translation requests
documentTranslationTimeout:  120000, //timeout for the whole document translation
webTranslationTimeout:  120000, //timeout for website translation, if UI is not in the expected "done" state the test will fail and not wait for translations to finish
speechToTextTimout:10000, //timeout for speech-to-text requests
navigationTimeout:  20000, //timeout for navigations

```