// background.ts 또는 popup.ts에서


/**
 * Content Script에서 보낸 메시지를 처리하는 리스너
 */
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.action === 'htmlCaptured') {
    // HTML 데이터 받음
    console.log('백그라운드: HTML 캡처 메시지 수신됨');

    // HTML 내용 출력
    console.log('캡처된 HTML:');
    console.log(message.html);

    // HTML 길이 출력 (전체 내용이 너무 길 경우)
    // 여기서 출력하는 메세지는 f12해서 나오는 콘솔에 출력되는것이 아님 서비스워커창에 따로 출력됨
    console.log(`HTML 길이: ${message.html.length} 자`);

    // 응답 보내기 (필요한 경우)
    sendResponse({ status: 'success', message: 'HTML 수신 완료' });
  }

  // 비동기 응답을 위해 true 반환
  return true;
});
