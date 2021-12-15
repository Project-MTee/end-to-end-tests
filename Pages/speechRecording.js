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
  expect(responseData).toEqual(expect.objectContaining({
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
  await expect(this.timer).toBeVisible({timeout:1500}); 
}

async stopRecording()
{
  await this.stopButton.click({timeout:3000}); 
  await expect(this.stopButton).toBeDisabled({timeout:1500});
}

async cancelRecording()
{
  await this.cancelButton.click({timeout:3000});  
}

async checkDisplayedTimer(expectedTimeString)
{
 await expect(this.timer).toContainText(expectedTimeString, {timeout:2500});
}

async checkRecorderInDefaultState()
{
  await expect(this.timer).toBeHidden({timeout:3500});
  await expect(this.message).toBeHidden({timeout:3500});
  await expect(this.cancelButton).toBeHidden({timeout:3500}); 
}

async checkRecordingMessage(messageText)
{
  await expect(this.message).toBeVisible({timeout:2000});
  await expect(this.message).toContainText(messageText,{timeout:2000});   
}
//@KEYBOARD

async startRecordingWithKeyboard()
{
  await this.recordButton.focus({timeout:3000});
  await expect(this.recordButton).toBeFocused();
  await this.page.keyboard.press('Enter');
  await expect(this.timer).toBeVisible({timeout:1500}); 
}

async cancelRecordingWithKeyboard()
{
  await this.cancelButton.focus({timeout:3000});
  await expect(this.cancelButton).toBeFocused();
  await this.page.keyboard.press('Enter'); 
}

}