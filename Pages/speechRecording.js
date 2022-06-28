let { expect } = require('@playwright/test');
const { brotliDecompress } = require('zlib');

exports.SpeechRecording = class SpeechRecording {

  constructor(page) {    
    this.page = page;
    this.recordButton= page.locator('tld-record button');
    this.recordButtonIcon= page.locator('tld-record button mat-icon');  
    this.stopButton = page.locator('tld-record button:has-text("stop")');
    this.cancelButton = page.locator('tld-record button:has-text("Cancel")');
    this.timer = page.locator('.tld-audio-timer');
    this.message = page.locator('text=Please speak to record');
  }

async waitForSpeechRecognition(translationParameters) {
  return await this.page.waitForResponse(async (response) => {
    if(response.url().includes(process.env.speechAPI))
    {           
        let responseData= await response.json();
        let request= await response.request();       
        await this.checkSpeechResponse(response, translationParameters);
        if(await request.method()=='POST'&&response.status()!=202)
        {
          throw new Error('Error posting recorded audio. Response status:'+ response.status()+' | '+JSON.stringify(responseData));
        }
        if(responseData.state.includes('error')||(await request.method()=='GET'&&response.status()!=200))
        {         
          throw new Error('Speech recognition error. Response status:'+ response.status()+' | '+JSON.stringify(responseData));
        }
        return responseData.state.includes('completed');
    }
}, {
  timeout: translationParameters.speechToTextTimout
});
}

async checkSpeechResponse(response, translationParameters)
{   
  let responseData = await response.json();    
  expect(responseData, 'Speech api should return response that matches the expected schema and translation language set in browser').toEqual(expect.objectContaining({
          job_id: expect.any(String),         
          created_at: expect.any(String), 
          updated_at: expect.any(String),
          language: translationParameters.srcLangCode,
          file_name: 'blob',
          state: expect.any(String)          
        })
    );   
}

async startRecording()
{
  await this.recordButton.click({timeout:3000});
  await expect(this.timer, 'Timer should be visible after starting recording').toBeVisible({timeout:1500}); 
}

async stopRecording()
{
  await this.stopButton.click({timeout:3000}); 
  await expect(this.stopButton, 'Stop button should be disabled after stoping recording.').toBeDisabled({timeout:1500});
}

async cancelRecording()
{
  await this.cancelButton.click({timeout:3000});  
}

async checkDisplayedTimer(expectedTimeString)
{
 await expect(this.timer, 'Recording timer should contain the expected time').toContainText(expectedTimeString, {timeout:2500});
}

async checkRecorderInDefaultState()
{
  await expect(this.timer, 'Recording timer should be hidden if the form is in default state').toBeHidden({timeout:3500});
  await expect(this.message, 'Recording message should be hidden if the form is in default state').toBeHidden({timeout:3500});
  await expect(this.cancelButton, 'Recording Cancel button should be hidden if the form is in default state').toBeHidden({timeout:3500}); 
}

async checkRecordingMessage(messageText)
{
  await expect(this.message, 'Recording message should be visible').toBeVisible({timeout:2000});
  await expect(this.message, 'Recording message should contain the expected text').toContainText(messageText,{timeout:2000});   
}
//@KEYBOARD

async startRecordingWithKeyboard()
{
  await this.recordButton.focus({timeout:3000});
  await expect(this.recordButton, 'Record button should be focused after focusing with keyboard').toBeFocused();
  await this.page.keyboard.press('Enter');
  await expect(this.timer, 'Recording timer should be visible after starting recording').toBeVisible({timeout:1500}); 
}

async cancelRecordingWithKeyboard()
{
  await this.cancelButton.focus({timeout:3000});
  await expect(this.cancelButton, 'Recording Cancel button should be focused after focusing with keyboard.').toBeFocused();
  await this.page.keyboard.press('Enter'); 
}

}