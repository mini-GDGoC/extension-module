// src/background/authService.ts

const AUTH_URL = 'https://openapi.vito.ai/v1/authenticate';
// const CLIENT_ID = process.env.RTZR_CLIENT_ID;
// const CLIENT_SECRET = process.env.RTZR_CLIENT_SECRET;
const CLIENT_ID     = import.meta.env.RTZR_CLIENT_ID as string
const CLIENT_SECRET = import.meta.env.RTZR_CLIENT_SECRET as string


let accessToken = '';
let expireAt = 0; // UNIX timestamp (초)

/**
 * /v1/authenticate 호출 → 토큰 저장
 */
// authService.ts 내 authenticate 함수 전체
async function authenticate(): Promise<void> {

  
  // (디버깅용) 실제로 주입된 값 확인
  console.log('▶ CLIENT_ID:', JSON.stringify(CLIENT_ID));
  console.log('▶ CLIENT_SECRET:', JSON.stringify(CLIENT_SECRET));

  const body = new URLSearchParams({
    client_id: CLIENT_ID,
    client_secret: CLIENT_SECRET,
  });

  console.log('[SW] ▶ AUTH_URL:', AUTH_URL);
console.log('[SW] ▶ PAYLOAD:', body.toString());


  try {
    const res = await fetch(AUTH_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json',
      },
      body: body.toString(),
    });

    if (!res.ok) {
      // 에러 응답 본문까지 로깅
      const errBody = await res.json().catch(() => null);
      console.error('🛑 Auth error response body:', errBody);
      throw new Error(`Auth failed: HTTP ${res.status}`);
    }

    const { access_token, expire_at } = await res.json();
    accessToken = access_token;
    expireAt = expire_at;

    // 로컬 스토리지에도 저장
    await chrome.storage.local.set({
      rtzrToken: accessToken,
      rtzrExpireAt: expireAt,
    });

    console.log('✅ RTZR token acquired, expires at', new Date(expireAt * 1000));
  } catch (err) {
    console.error('🔴 RTZR auth failed:', err);
  }
}


/**
 * 메시지로 토큰 요청 처리
 */
chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  if (msg.action === 'getToken') {
    const nowSec = Date.now() / 1000;
    const needsRefresh = nowSec > expireAt - 300;
    const reply = () => sendResponse({ token: accessToken });
    if (needsRefresh) {
      authenticate().then(reply);
    } else {
      reply();
    }
    return true; // 비동기 응답
  }
});

/**
 * 설치/업데이트 시와 5.5시간마다 토큰 갱신 예약
 */
chrome.runtime.onInstalled.addListener(() => {
  authenticate();
  chrome.alarms.create('rtzrRefresh', { periodInMinutes: 330 });
});
chrome.alarms.onAlarm.addListener(alarm => {
  if (alarm.name === 'rtzrRefresh') authenticate();
});
