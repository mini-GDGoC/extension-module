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
  const existingPopup = document.getElementById('extension-popup-overlay');
  if (existingPopup) {
    existingPopup.remove();
  } else {
    createPopup();
  }
}

function createPopup() {
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

  const overlay = document.createElement('div');
  overlay.id = 'extension-popup-overlay';
const popupContainer = document.createElement('div');
popupContainer.style.cssText = `
  background-color: #FEF9EE;
  width: 400px;
  height: 300px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;  /* ★★★ 이걸로 변경 ★★★ */
  border-radius: 8px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  position: relative;
  padding: 20px;
`;


  const promptDiv = document.createElement('div');
  popupContainer.appendChild(promptDiv);

  ReactDOM.createRoot(promptDiv).render(
    <VoicePrompt onResult={(ok: boolean) => {
      ReactDOM.createRoot(promptDiv).unmount();
      promptDiv.remove();
      if (!ok) {
        overlay.remove();
      } else {
        const wavRoot = document.createElement('div');
        wavRoot.id = 'wav-root';

        const closeButton = document.createElement('button');
        closeButton.style.cssText = `position:absolute;top:16px;right:16px;width:32px;height:32px;border:none;background:transparent;color:#6B7280;font-size:18px;cursor:pointer;`;
        closeButton.innerHTML = '×';
        closeButton.title = '닫기';
        closeButton.onclick = () => overlay.remove();

        const title = document.createElement('h2');
        title.style.cssText = `font-size:24px;font-weight:bold;margin-bottom:0px;color:#1F2937;text-align:center;`;
        title.textContent = '손길도우미';

        const content = document.createElement('p');
        content.style.cssText = `color:#6B7280;text-align:center;padding:0 24px;line-height:1.6;margin-top:auto;margin-bottom:0px;align-self:stretch;`;
        content.textContent = 'LLM 기반 디지털 서비스 사용 보조 Agent입니다.';

        const actionButton = document.createElement('button');
        actionButton.style.cssText = `padding:8px 24px;background-color:#3B82F6;color:white;border-radius:8px;border:none;cursor:pointer;font-weight:500;position:absolute;top:80%;left:50%;transform:translate(-50%,-50%);`;
        actionButton.textContent = '스크린샷 캡처';
        actionButton.onclick = () => {
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

        popupContainer.appendChild(closeButton);
        popupContainer.appendChild(title);
        popupContainer.appendChild(content);
        popupContainer.appendChild(actionButton);
        popupContainer.appendChild(wavRoot);
        ReactDOM.createRoot(wavRoot).render(<WavRecorder />);
      }
    }} />
  );

  overlay.appendChild(popupContainer);
  document.body.appendChild(overlay);

  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) overlay.remove();
  });

  const escHandler = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      overlay.remove();
      document.removeEventListener('keydown', escHandler);
    }
  };
  document.addEventListener('keydown', escHandler);
}

function VoicePrompt({ onResult }: { onResult: (ok: boolean) => void }) {
  return (
    <div style={{
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      width: '100%',
      boxSizing: 'border-box',
      background: 'transparent',
      textAlign: 'center',
    }}>
      <h2 style={{
        fontSize: 22,
        fontWeight: 'bold',
        margin: '0 0 16px',
        writingMode: 'horizontal-tb',
        whiteSpace: 'normal',
        display: 'block'
      }}>
        음성 안내가 필요하신가요?
      </h2>
      <div style={{
        display: 'inline-block',
        gap: 24,
      }}>
        <button
          style={{
            padding: '12px 32px',
            background: '#3B82F6',
            color: 'white',
            border: 'none',
            borderRadius: 8,
            cursor: 'pointer',
            fontSize: 18,
            fontWeight: 600,
            whiteSpace: 'nowrap',
            display: 'inline-block',
            marginRight: 12,
          }}
          onClick={() => onResult(true)}
        >필요해요</button>
        <button
          style={{
            padding: '12px 32px',
            background: '#E5E7EB',
            color: '#4B5563',
            border: 'none',
            borderRadius: 8,
            cursor: 'pointer',
            fontSize: 18,
            fontWeight: 600,
            whiteSpace: 'nowrap',
            display: 'inline-block',
            marginLeft: 12,
          }}
          onClick={() => onResult(false)}
        >아니오</button>
      </div>
    </div>
  );
}
