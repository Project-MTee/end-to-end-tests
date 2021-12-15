// playwright.config.js
const { devices } = require('@playwright/test');

const config = {
	 workers:3, //number of parallel test workers
	 globalTimeout: 30*60*1000,	//global timeout for the whole test run
	 timeout: 160000,	//timeout for each test
	// repeatEach: 1,
	// retries:1,
  reporter: [ ['junit', { outputFile: 'results.xml' }],['list']], //['line'] //['dot'] ['list'] list reporter can display jumbled results in console or lag, left as default to see the list of tests
  reportSlowTests: { max: 0, threshold: 120000 },
  expect: {
		timeout: 5000,
		toMatchSnapshot: {
		  	threshold: 0.3,
	  }
	},
  use: {
	 headless: true,  //run the tests in headless or headfull mode
	 screenshot: 'only-on-failure', //save the screenshots and test run traces on failure
     video: 'on-first-retry',
	 trace: 'retain-on-failure',
	 baseURL:'https://mt.cs.ut.ee/',
	 textAPI:'api/translate/text',	 
	 fileAPI:'api/translate',
	 speechAPI:'api/speech-to-text',
	 grammarAPI:'api/grammar',	
	 textTranslationTimeout: 20000, //timeout for text translation requests
	 grammarTimeout: 20000, //timeout for text translation requests
	 documentTranslationTimeout: 120000, //timeout for the whole document translation
	 webTranslationTimeout: 120000,	//timeout for website translation, if UI is not in the expected "done" state the test will fail and not wait for translations to finish 
	 speechToTextTimout:10000, //timeout for speech-to-text requests
	 navigationTimeout: 20000, //timeout for navigations	 
	 uiLanguages:['EN','ET','DE','RU'],	
	 supportedDocFormats:'.docx, .xlsx, .odt, .tmx, .pptx, .txt', //only for checking the err message, file translation grabs everything from TestData\Supported folder
	 docMaxFileSize:'30MB', //only for checking the err message, TestData\Unsupported\large_file.docx is ~34MB for checking limit
	 textTranslateMaxLength: 10000 
	}, 
  projects: [
    {
	 name: 'Desktop-Chrome',	  
	 testMatch: ['**/*textTranslate*.spec.js',
	 			'**/*fileTranslate*.spec.js',
				 '**/*webTranslate.spec.js',
				 '**/*grammar*.spec.js',
				 '**/*speechTranslate*.spec.js',
				 '**/visualMatching.spec.js',
				 '**/uiTexts.spec.js',
				 '**/accessibility.spec.js',				 
				 '**/*fileTranslate.AllFormats.spec.js'
				],	
       use: {	
		viewport: {  width: 1920, height: 1080 },
		ignoreHTTPSErrors: true,	
		acceptDownloads:true,	
		colorScheme:'no-preference',
		locale:'en-GB',		
		permissions:['clipboard-read', 'clipboard-write'],
		launchOptions: {   			
			args: [				
			'--allow-file-access',
			'--allow-file-access-from-files',
			'--use-fake-ui-for-media-stream',		
			'--use-file-for-fake-audio-capture='+process.cwd()+'\\TestData\\Audio\\Sa oled liiga naljakas.wav%noloop',	
			'--use-fake-device-for-media-stream',	
			'--enable-pixel-canvas-recording'				
		]},	
		mobileView:false		
		}
   },
    // Test against mobile viewport.
    {
      name: 'Mobile-Chrome',		
	  testIgnore: ['**/accessibility.spec.js','**/*fileTranslate.AllFormats.spec.js'],	  	
	  testMatch: [
		  '**/*textTranslate*.spec.js',
		  '**/*fileTranslate.spec.js',
		  '**/visualMatching.spec.js',
		  '**/*grammar*.spec.js',
		  '**/*speechTranslate*.spec.js',
		  '**/*webTranslate.spec.js'
		],	 
      use:{
		 browserName: 'chromium',
		...devices['Galaxy S9+'],
		ignoreHTTPSErrors: true	,	
		acceptDownloads:true,			
		mobileView:true,
		launchOptions: {   			
			args: [				
			'--allow-file-access',
			'--allow-file-access-from-files',
			'--use-fake-ui-for-media-stream',		
			'--use-file-for-fake-audio-capture='+process.cwd()+'\\TestData\\Audio\\Sa oled liiga naljakas.wav%noloop',	
			'--use-fake-device-for-media-stream',	
			'--enable-pixel-canvas-recording'				
		]}
	  }	  
    },
	 // Test against tablet viewport.
    {
      name: 'Tablet-Chrome',		
	  testIgnore: ['**/accessibility.spec.js','**/*fileTranslate.AllFormats.spec.js'],	 
	  testMatch: [
		  '**/*textTranslate*.spec.js',
		  '**/*fileTranslate.spec.js',
		  '**/visualMatching.spec.js',
		  '**/*grammar*.spec.js'],
      use:{
		 browserName: 'chromium',
		...devices['Galaxy Tab S4'],
		ignoreHTTPSErrors: true	,	
		acceptDownloads:true,		
		mobileView:false
	  }	  
    }	 
  ],
};

module.exports = config;