// background.ts

import './overlayManager'
//import './messageListener'

chrome.runtime.onMessage.addListener((request, _sender, sendResponse) => {
  if (request.action === 'captureVisibleTab') {
    chrome.tabs.captureVisibleTab({ format: 'png' }, (dataUrl) => {
      sendResponse(dataUrl);
    });
    // 비동기 응답을 위해 true 리턴
    return true;
  }
});