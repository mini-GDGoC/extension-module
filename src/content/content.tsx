import ReactDOM from 'react-dom/client';
import WavRecorder from '../components/WavRecorder';
import playAudioBlob from './audioPlay';

console.log('손길도우미 확장프로그램이 로드되었습니다.');

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

// popup.css를 불러와 shadow root에 <style>로 삽입하는 함수 추가
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

  // 팝업 컨테이너
  const popupContainer = document.createElement('div');
  popupContainer.id = 'popup-container';


  // 팝업 내부 클릭은 버블링 막기
popupContainer.addEventListener('click', (e) => {
  e.stopPropagation();
});

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
    needBtn.onclick = showCaptureAndRecord; // 두번째 화면으로

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

  // 두번째 화면: 캡처 + WavRecorder
  function showCaptureAndRecord() {
    popupContainer.innerHTML = '';

    //필요해요 버튼 클릭 이후 캡처 통과되도록
    overlay.style.pointerEvents = 'none';
    popupContainer.style.pointerEvents = 'none';
    popupContainer.innerHTML = '';

    // 닫기 버튼
    const closeButton = document.createElement('button');
    closeButton.id = 'close-btn';
    closeButton.innerHTML = '×';
    closeButton.title = '닫기';
    closeButton.onclick = () => overlay.remove();

    // 타이틀
    const title = document.createElement('h2');
    title.textContent = '손길도우미';

    // 안내 텍스트
    const content = document.createElement('p');
    content.textContent = '스크린샷 캡처 또는 음성 안내 녹음을 시작할 수 있습니다.';

    // 캡처 버튼
    const captureBtn = document.createElement('button');
    captureBtn.id = 'action-btn';
    captureBtn.textContent = '스크린샷 캡처';
    captureBtn.onclick = () => {
      popupContainer.style.opacity = '0';
      setTimeout(() => {
        chrome.runtime.sendMessage({ action: 'captureVisibleTab' }, (dataUrl) => {
          playAudioBlob();
          popupContainer.style.opacity = '1';
          if (dataUrl) {
            const link = document.createElement('a');
            link.href = dataUrl;
            link.download = 'screenshot.png';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
          }
        });
      }, 50);
    };

    // WavRecorder mount할 div
    const wavRoot = document.createElement('div');
    wavRoot.id = 'wav-root';

    popupContainer.appendChild(closeButton);
    popupContainer.appendChild(title);
    popupContainer.appendChild(content);
    popupContainer.appendChild(captureBtn);
    popupContainer.appendChild(wavRoot);

    // React 컴포넌트 mount (shadowRoot에서!)
    ReactDOM.createRoot(wavRoot).render(<WavRecorder />);
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