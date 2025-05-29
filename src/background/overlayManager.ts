//overlayManager.ts
console.log('Background script loaded');

chrome.action.onClicked.addListener((tab) => {
  console.log('Extension icon clicked', tab);
  
  if (tab.id) {
    console.log('Injecting script into tab:', tab.id);
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: togglePopup
    }).then(() => {
      console.log('Script injected successfully');
    }).catch((error) => {
      console.error('Failed to inject script:', error);
    });
  } else {
    console.error('Tab ID is undefined');
  }
});

// 메시지 리스너 추가
chrome.runtime.onMessage.addListener((request, sender, _sendResponse) => {
  console.log('Message received in background:', request);
  if (request.action === 'showPopup') {
    // content script로 메시지 전송
    if (sender.tab?.id) {
      chrome.tabs.sendMessage(sender.tab.id, { action: 'togglePopup' });
    }
  }
});

function togglePopup() {
  const existingPopup = document.getElementById('extension-popup-overlay');
  
  if (existingPopup) {
    existingPopup.remove();
  } else {
    createPopup();
  }
}

function createPopup() {
  // 오버레이 생성
  const overlay = document.createElement('div');
  overlay.id = 'extension-popup-overlay';
  overlay.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background-color: rgba(0, 0, 0, 0.5);
    z-index: 999999;
    display: flex;
    align-items: center;
    justify-content: center;
  `;

  // 팝업 컨테이너 생성
  const popupContainer = document.createElement('div');
  popupContainer.id = 'extension-popup-container';
  popupContainer.innerHTML = '<div id="popup-root"></div>';
  
  overlay.appendChild(popupContainer);
  document.body.appendChild(overlay);

  // 오버레이 클릭 시 팝업 닫기
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) {
      overlay.remove();
    }
  });

  // ESC 키로 팝업 닫기
  const escHandler = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      overlay.remove();
      document.removeEventListener('keydown', escHandler);
    }
  };
  document.addEventListener('keydown', escHandler);

  // React 컴포넌트 렌더링
  loadReactPopup();
}

// function loadReactPopup() {
//   // React 앱을 동적으로 로드하고 렌더링하는 스크립트
//   const script = document.createElement('script');
//   script.type = 'module';
//   script.textContent = `
//     import ReactDOM from 'react-dom/client';
//     import React from 'react';

//     function ExtensionPopup() {
//       const closePopup = () => {
//         const overlay = document.getElementById('extension-popup-overlay');
//         if (overlay) overlay.remove();
//       };

//       return React.createElement('div', {
//         className: 'bg-[#FEF9EE] w-[400px] h-[300px] flex flex-col items-center justify-center rounded-lg shadow-2xl relative',
//         style: { fontFamily: 'system-ui, -apple-system, sans-serif' }
//       }, [
//         React.createElement('button', {
//           key: 'close-btn',
//           onClick: closePopup,
//           className: 'absolute top-2 right-2 w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-200 text-gray-600 font-bold text-lg',
//           title: '닫기'
//         }, '×'),
//         React.createElement('h2', {
//           key: 'title',
//           className: 'text-xl font-bold mb-4 text-gray-800'
//         }, '손길도우미'),
//         React.createElement('p', {
//           key: 'content',
//           className: 'text-gray-600 text-center px-6'
//         }, 'LLM 기반 디지털 서비스 사용 보조 Agent입니다.')
//       ]);
//     }

//     const root = ReactDOM.createRoot(document.getElementById('popup-root'));
//     root.render(React.createElement(ExtensionPopup));
//   `;
  
//   document.head.appendChild(script);
// }
function loadReactPopup() {
  // React 앱을 동적으로 로드하고 렌더링하는 스크립트
  const script = document.createElement('script');
  script.type = 'module';
  script.textContent = `
    import ReactDOM from 'react-dom/client';
    import React from 'react';

    function ExtensionPopup() {
      const closePopup = () => {
        const overlay = document.getElementById('extension-popup-overlay');
        if (overlay) overlay.remove();
      };

      return React.createElement('div', {
        className: 'bg-[#FEF9EE] w-[400px] h-[300px] flex flex-col items-center justify-center rounded-lg shadow-2xl relative',
        style: { fontFamily: 'system-ui, -apple-system, sans-serif' }
      }, [
        React.createElement('button', {
          key: 'close-btn',
          onClick: closePopup,
          className: 'absolute top-2 right-2 w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-200 text-gray-600 font-bold text-lg',
          title: '닫기'
        }, '×'),

      ]);
    }

    const root = ReactDOM.createRoot(document.getElementById('popup-root'));
    root.render(React.createElement(ExtensionPopup));
  `;
  
  document.head.appendChild(script);
}