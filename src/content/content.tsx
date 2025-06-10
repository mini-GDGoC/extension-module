
//content.tsx
import ReactDOM from 'react-dom/client';
import triggerCenterClickThrough from '../utils/triggerCenterClickThrough';
import { renderWavRecorder } from '../utils/renderWavRecorder';
import { autoCapture } from '../utils/autoCapture';
import { setOverlayOpen } from '../state/overlayState';


console.log('손길도우미 확장프로그램이 로드되었습니다.');

const BASE_URL = import.meta.env.VITE_API_BASE_URL as string;

let wavRoot: ReturnType<typeof ReactDOM.createRoot> | null = null;

//autocapture을 분리하기 위해 사용하는 함수
function setWavRoot(root: ReturnType<typeof ReactDOM.createRoot> | null) {
  wavRoot = root;
}

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

  // 오버레이 열 때
  setOverlayOpen(true);

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
    const title = document.createElement('h1');
    title.textContent = '손길도우미';
    title.style.cssText = 'width: 100%; text-align: center; margin-top: 5vh;';

    // 질문
    const question = document.createElement('p');
    question.textContent = '음성 안내가 필요하신가요?';
    question.style.cssText =
      'text-align: center; font-size: 25px; margin-top: 9px;';

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

  function whichMenu() {
        // DOM 초기화
    popupContainer.innerHTML = '';

    console.log("autocapture 시작");

   // 약간의 지연을 두고 autoCapture 실행
    setTimeout(() => {
      autoCapture({
        popupContainer,
        BASE_URL,
        renderWavRecorder: () => renderWavRecorder({
          popupContainer,
          wavRoot,
          setWavRoot,
          BASE_URL,
          delayMs: 0,
          onAutoClickDone: () => {
              console.log('음식 메뉴 묻기(어떤버거인지).');
              whichMenu();

          }

        }),
      });
    }, 200); 

    // 타이틀
    const title = document.createElement('h2');
    title.textContent = '질문을 불러오는 중입니다';
    popupContainer.appendChild(title);

  }

  function askTakeOut() {
    popupContainer.innerHTML = '';

    // 필요해요 버튼 클릭 이후 캡처 통과되도록
    overlay.style.pointerEvents = 'none';
    popupContainer.style.pointerEvents = 'none';
    popupContainer.innerHTML = '';

    // 화면 중앙에 클릭 이벤트 트리거
    triggerCenterClickThrough();
    
    //캡처후 서버에 전송
  autoCapture({
    popupContainer,
    BASE_URL,
    renderWavRecorder: () => {
      renderWavRecorder({
        popupContainer,
        wavRoot,
        setWavRoot,
        BASE_URL,
        delayMs: 0,
        // ← 여기 onAutoClickDone으로 두 번째 함수를 넘겨준다
        onAutoClickDone: () => {
          console.log('첫 번째 클릭이 끝났으므로, 다음 함수를 실행합니다.');
          // 예를 들어 두 번째 autoCapture나, 다른 로직을 이곳에 호출
          whichMenu();
        },
      });
    },
  });

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
      // 오버레이가 닫혔으므로 플래그를 false로
      // 오버레이 닫을 때(ESC/클릭)
      setOverlayOpen(false);
      overlay.remove();
      document.removeEventListener('keydown', escHandler);
    }
  };
  document.addEventListener('keydown', escHandler);
}