// utils/autoCapture.ts
import { clickCoordinate } from './clickCoordinate';


type AutoCaptureArgs = {
  popupContainer: HTMLElement;
  BASE_URL: string;
  renderWavRecorder: () => void;
};
  // 자동 캡처 함수 - createPopup 내부에서 정의하여 popupContainer에 접근 가능

export function autoCapture({ popupContainer, BASE_URL, renderWavRecorder }: AutoCaptureArgs) {
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
          // 3. fetch를 사용한 multipart/form-data 전송 
                  console.log("get-question 호출");

        fetch(`${BASE_URL}/get-question`, {
          method: 'POST',
          body: formData,
        })
          .then(response => response.json())
          .then(data => {
            console.log('서버 응답:', data);

             // 1. action: "click" 응답이면 세트음료 선택
            if (data.action === 'click' && data.bbox) {
              // clickCoordinate 함수는 기존에 구현된 함수
              console.log("세트음료 선택");
              console.log(data.bbox.x,data.bbox.y,data.bbox.width,data.bbox.height);
              clickCoordinate(data.bbox, 1/2, () => {
                // 클릭 완료 후, 다시 autoCapture 재호출 (재귀)
                autoCapture({ popupContainer, BASE_URL, renderWavRecorder });
              });
              return; // 이하 로직 실행 안 함
            }

              popupContainer.querySelectorAll('audio').forEach(audioElem => {
              try { audioElem.pause(); } catch(e) {}
              audioElem.remove();
            });
            if (data.tts_file) {
    const audio = new Audio(data.tts_file);
    audio.currentTime = 0;
    audio.play()
      .then(() => console.log('새 TTS 파일 재생 성공:', data.tts_file))
      .catch(err => {
        console.warn('새 TTS 파일 재생 실패:', err);
              });

              const audioElem = document.createElement('audio');
              audioElem.src = data.tts_file;
              audioElem.controls = true;
              audioElem.style.display = 'none';
              popupContainer.appendChild(audioElem);

              audio.addEventListener('ended', () => {
                console.log('오디오 재생 완료, n초 후 녹음 시작');
                setTimeout(() => {
                  renderWavRecorder();
                }, 0);
              });
            }


          })
          .catch(error => {
            console.error('업로드 실패:', error);
          });
      }
    });
  }, 500);
}
