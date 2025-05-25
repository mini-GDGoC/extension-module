// content.ts
console.log('손길도우미 확장프로그램이 로드되었습니다.');

// 메시지 리스너 (필요시 background와 통신용)
chrome.runtime.onMessage.addListener((request, _sender, _sendResponse) => {
  if (request.action === 'togglePopup') {
    togglePopup();
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
  // 스타일 직접 적용 (CSS 파일 의존성 제거)
  if (!document.getElementById('extension-styles')) {
    const style = document.createElement('style');
    style.id = 'extension-styles';
    style.textContent = `
      #extension-popup-overlay {
        font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        background-color: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 999999;
        animation: fadeIn 0.2s ease-out;
      }
      
      #extension-popup-overlay * {
        box-sizing: border-box;
      }
      
      #extension-popup-overlay > div {
        animation: slideIn 0.3s ease-out;
        transform-origin: center;
      }
      
      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }
      
      @keyframes slideIn {
        from {
          opacity: 0;
          transform: scale(0.9) translateY(-20px);
        }
        to {
          opacity: 1;
          transform: scale(1) translateY(0);
        }
      }
    `;
    document.head.appendChild(style);
  }

  // 오버레이 생성
  const overlay = document.createElement('div');
  overlay.id = 'extension-popup-overlay';

  // 팝업 컨테이너 생성
  const popupContainer = document.createElement('div');
  popupContainer.style.cssText = `
    background-color: #FEF9EE;
    width: 400px;
    height: 300px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: space-between;
    border-radius: 8px;
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
    position: relative;
    padding: 20px;
  `;

  // 닫기 버튼
  const closeButton = document.createElement('button');
  closeButton.style.cssText = `
    position: absolute;
    top: 16px;
    right: 16px;
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    background-color: transparent;
    border: none;
    color: #6B7280;
    font-weight: bold;
    font-size: 18px;
    cursor: pointer;
    transition: background-color 0.2s;
  `;
  closeButton.innerHTML = '×';
  closeButton.title = '닫기';
  closeButton.addEventListener('click', () => overlay.remove());
  closeButton.addEventListener('mouseenter', () => {
    closeButton.style.backgroundColor = '#E5E7EB';
  });
  closeButton.addEventListener('mouseleave', () => {
    closeButton.style.backgroundColor = 'transparent';
  });

  // 제목
  const title = document.createElement('h2');
  title.style.cssText = `
    font-size: 24px;
    font-weight: bold;
    margin-bottom: 0px;
    color: #1F2937;
    text-align: center;
  `;
  title.textContent = '손길도우미';

  // 내용
  const content = document.createElement('p');
  content.style.cssText = `
    color: #6B7280;
  text-align: center;
    padding: 0 24px;
    line-height: 1.6;
    margin-top: auto;
    margin-bottom: 0px;
    align-self: stretch;
    position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  `;
  content.textContent = 'LLM 기반 디지털 서비스 사용 보조 Agent입니다.';

  // 버튼 예시
  const actionButton = document.createElement('button');
  actionButton.style.cssText = `
    padding: 8px 24px;
    background-color: #3B82F6;
    color: white;
    border-radius: 8px;
    border: none;
    cursor: pointer;
    transition: background-color 0.2s;
    font-weight: 500;
    // display: flex;
    // justify-content: flex-end;
    // align-items: center;
        position: absolute;
    top: 80%;
    left: 50%;
    transform: translate(-50%, -50%);

  `;
  actionButton.textContent = '시작하기';
  actionButton.addEventListener('click', () => {
    alert('기능을 시작합니다!');
  });
  actionButton.addEventListener('mouseenter', () => {
    actionButton.style.backgroundColor = '#2563EB';
  });
  actionButton.addEventListener('mouseleave', () => {
    actionButton.style.backgroundColor = '#3B82F6';
  });

  // 요소들 조립
  popupContainer.appendChild(closeButton);
  popupContainer.appendChild(title);
  popupContainer.appendChild(content);
  popupContainer.appendChild(actionButton);
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
}