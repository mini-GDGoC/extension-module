// utils/renderWavRecorder.tsx
import ReactDOM from 'react-dom/client';
import WavRecorder from '../components/WavRecorder';
import {clickCoordinate, clickCoordinateScroll} from './clickCoordinate';

type RenderWavRecorderArgs = {
  popupContainer: HTMLElement;
  wavRoot: ReturnType<typeof ReactDOM.createRoot> | null;
  setWavRoot: (root: ReturnType<typeof ReactDOM.createRoot> | null) => void;
  BASE_URL: string;
  delayMs?: number;
  onAutoClickDone?: () => void; // ← 추가: 클릭 완료 후 호출될 콜백
};

export function renderWavRecorder({
  popupContainer,
  wavRoot,
  setWavRoot,
  BASE_URL,
  delayMs = 0,
  onAutoClickDone,          // ← 추가
}: RenderWavRecorderArgs) {
  if (wavRoot) {
    wavRoot.unmount();
    setWavRoot(null);
  }

  const wavDiv = document.createElement('div');
  wavDiv.id = 'wavrecorder-wrap';
  popupContainer.appendChild(wavDiv);

  const root = ReactDOM.createRoot(wavDiv);
  setWavRoot(root);
  root.render(
    <WavRecorder
      onRecorded={async (audioBlob) => {
        const formData = new FormData();
        formData.append('file', audioBlob, 'audio.webm');
        try {
          const resp = await fetch(`${BASE_URL}/get_action`, {
            method: 'POST',
            body: formData,
          });
          const actionData = await resp.json();
          console.log('/get_action 응답:', actionData);

          if (actionData.action === 'click' && actionData.bbox) {
            // 클릭 후 바로 onAutoClickDone 호출
            clickCoordinate(actionData.bbox, 1/2,() => {
              console.log('자동 클릭 완료!');
              if (typeof onAutoClickDone === 'function') {
                onAutoClickDone();
              }
            });
          }
        } catch (e) {
          console.error('/get_action 실패:', (e instanceof Error ? e.message : e));
        }
      }}
      autoStart={true}
      startDelay={delayMs}
      recordingDuration={6500}
    />
  );
}
