// import ReactDOM from 'react-dom/client';
// import WavRecorder from '../components/WavRecorder';
// import playAudioBlob from './audioPlay';

console.log('손길도우미 확장프로그램이 로드되었습니다.');

const BASE_URL = import.meta.env.VITE_API_BASE_URL as string;


chrome.runtime.onMessage.addListener((request, _sender, _sendResponse) => {
  if (request.action === 'togglePopup') {
    togglePopup();
  }
});

function togglePopup() {
  const existing = document.getElementById('extension-popup-overlay');
  if (existing) existing.remove();
  else createPopup();
}

function triggerCenterClickThrough() {
  // 화면 중앙 좌표 계산
  const x = window.innerWidth / 2;
  const y = window.innerHeight / 2;

  // 중앙 좌표에 클릭 이벤트 생성
  const elem = document.elementFromPoint(x, y);
  if (elem) {
    // 마우스 이벤트(Click) 생성 및 전파
    const event = new MouseEvent('click', {
      view: window,
      bubbles: true,
      cancelable: true,
      clientX: x,
      clientY: y
    });
    elem.dispatchEvent(event);
  }
}

// popup.css를 불러와 shadow root에 <style>로 삽입하는 함수
async function loadPopupCSS(shadowRoot: ShadowRoot) {
  try {
    const cssURL = chrome.runtime.getURL('css/popup.css');
    const resp = await fetch(cssURL);
    const cssText = await resp.text();
    const styleTag = document.createElement('style');
    styleTag.textContent = cssText;
    shadowRoot.appendChild(styleTag);
  } catch (err) {
    console.error('popup.css 로드 실패:', err);
  }
}

async function createPopup() {
  // 오버레이 생성
  const overlay = document.createElement('div');
  overlay.id = 'extension-popup-overlay';
  overlay.style.position = 'fixed';
  overlay.style.top = '0';
  overlay.style.left = '0';
  overlay.style.width = '100vw';
  overlay.style.height = '100vh';
  overlay.style.zIndex = '999999';

  // shadow root 생성
  const shadow = overlay.attachShadow({ mode: 'open' });

  // popup.css를 fetch해서 shadow root에 삽입 (비동기 처리)
  await loadPopupCSS(shadow);

  // 팝업 컨테이너
  const popupContainer = document.createElement('div');
  popupContainer.id = 'popup-container';

  // 팝업 내부 클릭은 버블링 막기
  popupContainer.addEventListener('click', (e) => {
    e.stopPropagation();
  });

  // 자동 캡처 함수 - createPopup 내부에서 정의하여 popupContainer에 접근 가능
  function autoCapture() {
    // 팝업 안보이게 (필요시)
    popupContainer.style.opacity = '0';

    setTimeout(() => {
      chrome.runtime.sendMessage({ action: 'captureVisibleTab' }, (dataUrl) => {
        popupContainer.style.opacity = '1';
        if (dataUrl) {
          // 1. dataUrl을 Blob(이미지)으로 변환
          function dataURLtoBlob(dataurl: string) {
            const arr = dataurl.split(',');
            const mime = arr[0].match(/:(.*?);/)![1];
            const bstr = atob(arr[1]);
            let n = bstr.length;
            const u8arr = new Uint8Array(n);
            while (n--) {
              u8arr[n] = bstr.charCodeAt(n);
            }
            return new Blob([u8arr], { type: mime });
          }
          const imgBlob = dataURLtoBlob(dataUrl);

          // 2. FormData에 파일 추가
          const formData = new FormData();
          formData.append('file', imgBlob, 'screenshot.png');

          // 3. fetch를 사용한 multipart/form-data 전송 (axios 대신)
          fetch(`${BASE_URL}/get-question`, {
            method: 'POST',
            body: formData,
            // Content-Type 헤더는 fetch가 자동으로 설정하므로 제거
          })
          .then(response => response.json())
          .then(data => {
            console.log('서버 응답:', data);
            // 여기서 UI 업데이트, 다음 단계 등 후처리!
          })
          .catch(error => {
            console.error('업로드 실패:', error);
          });
        }
      });
    }, 500);
  }

  // 첫 화면: 음성 안내 필요?
  showPrompt();

  // 첫 화면 UI
  function showPrompt() {
    popupContainer.innerHTML = ''; // 초기화

    // 닫기 버튼
    const closeButton = document.createElement('button');
    closeButton.id = 'close-btn';
    closeButton.innerHTML = '×';
    closeButton.title = '닫기';
    closeButton.onclick = () => overlay.remove();

    // 타이틀
    const title = document.createElement('h2');
    title.textContent = '손길도우미';

    // 질문
    const question = document.createElement('p');
    question.textContent = '음성 안내가 필요하신가요?';

    // 버튼 그룹
    const buttonWrap = document.createElement('div');
    buttonWrap.style.display = 'flex';
    buttonWrap.style.justifyContent = 'center';
    buttonWrap.style.marginTop = '28px';
    buttonWrap.style.gap = '16px';

    // 필요해요 버튼
    const needBtn = document.createElement('button');
    needBtn.textContent = '필요해요';
    needBtn.style.cssText =
      'padding:12px 32px;background:#3B82F6;color:#fff;border:none;border-radius:8px;cursor:pointer;font-size:18px;font-weight:600;white-space:nowrap;';
    needBtn.onclick = askTakeOut; // 두번째 화면으로

    // 아니요 버튼
    const nopeBtn = document.createElement('button');
    nopeBtn.textContent = '아니오';
    nopeBtn.style.cssText =
      'padding:12px 32px;background:#E5E7EB;color:#4B5563;border:none;border-radius:8px;cursor:pointer;font-size:18px;font-weight:600;white-space:nowrap;';
    nopeBtn.onclick = () => overlay.remove();

    buttonWrap.appendChild(needBtn);
    buttonWrap.appendChild(nopeBtn);

    popupContainer.appendChild(closeButton);
    popupContainer.appendChild(title);
    popupContainer.appendChild(question);
    popupContainer.appendChild(buttonWrap);
  }

  function askTakeOut() {
    popupContainer.innerHTML = '';

    // 필요해요 버튼 클릭 이후 캡처 통과되도록
    overlay.style.pointerEvents = 'none';
    popupContainer.style.pointerEvents = 'none';
    popupContainer.innerHTML = '';

    // 화면 중앙에 클릭 이벤트 트리거
    triggerCenterClickThrough();
    autoCapture();

    // 타이틀
    const title = document.createElement('h2');
    title.textContent = '손길도우미';
    
    // 버튼 그룹
    const buttonWrap = document.createElement('div');
    buttonWrap.style.display = 'flex';
    buttonWrap.style.justifyContent = 'center';
    buttonWrap.style.marginTop = '28px';
    buttonWrap.style.gap = '16px';

    // 포장 버튼
    const needBtn = document.createElement('button');
    needBtn.textContent = '포장해가요';
    needBtn.style.cssText =
      'padding:12px 32px;background:#3B82F6;color:#fff;border:none;border-radius:8px;cursor:pointer;font-size:18px;font-weight:600;white-space:nowrap;';

    // 먹고가요 버튼
    const nopeBtn = document.createElement('button');
    nopeBtn.textContent = '먹고가요';
    nopeBtn.style.cssText =
      'padding:12px 32px;background:#E5E7EB;color:#4B5563;border:none;border-radius:8px;cursor:pointer;font-size:18px;font-weight:600;white-space:nowrap;';

    buttonWrap.appendChild(needBtn);
    buttonWrap.appendChild(nopeBtn);

    popupContainer.appendChild(title);
    popupContainer.appendChild(buttonWrap);
  }

  shadow.appendChild(popupContainer);
  document.body.appendChild(overlay);

  // 바깥 클릭시 닫기
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) overlay.remove();
  });

  // ESC 닫기
  const escHandler = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      overlay.remove();
      document.removeEventListener('keydown', escHandler);
    }
  };
  document.addEventListener('keydown', escHandler);
}