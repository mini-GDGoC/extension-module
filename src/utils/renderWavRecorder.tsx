// utils/renderWavRecorder.tsx
import ReactDOM from 'react-dom/client';
import WavRecorder from '../components/WavRecorder';
import { clickCoordinate } from './clickCoordinate';
import { isOverlayOpen } from '../state/overlayState';

import { getSessionID } from './session'; //session ID 가져오기



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
        
        formData.append('session_id', getSessionID()); // session_id 추가


         // 1) 오버레이가 닫혔으면 즉시 중단
        if (!isOverlayOpen()) return;

        try {
          const resp = await fetch(`${BASE_URL}/get_action`, {
            method: 'POST',
            body: formData,
          });
          const actionData = await resp.json();
          console.log('/get_action 응답:', actionData);

          // 2) /get_action 응답 후에도 오버레이가 닫혔으면 중단
          if (!isOverlayOpen()) return;

          // 505 에러면 재시도 (LLM 오류)
          if (actionData.status === 505) {
            try {
              const retryResp = await fetch(`${BASE_URL}/get_action`, {
                method: 'POST',
                body: formData,
              });
              const retryData = await retryResp.json();
              console.log('/get_action 재시도 응답:', retryData);

              // 재시도 후에도 오버레이가 닫혔으면 중단
              if (!isOverlayOpen()) return;

              Object.assign(actionData, retryData); // 이후 로직에서 재시도 결과 사용
            } catch (retryErr) {
              console.error('/get_action 재시도 실패:', (retryErr instanceof Error ? retryErr.message : retryErr));
              return;
            }
          }


          if (actionData.action === 'click' && actionData.bbox) {
            // 클릭 후 바로 onAutoClickDone 호출
            clickCoordinate(actionData.bbox, 1/2,() => {
              console.log('자동 클릭 완료!');
              if (typeof onAutoClickDone === 'function') {
                onAutoClickDone();
              }
            });
          }
          else if (actionData.follow_up_question_url) {
              //if (data.follow_up_question) {
              //타이틀 변경
              const titleElem = popupContainer.querySelector('h2');
              if (titleElem) titleElem.textContent = actionData.follow_up_question;
            //}

            // ------------
            // choices가 존재하면 리스트 추가
            if (Array.isArray(actionData.choices) && actionData.choices.length > 0) {
              // 이미 있는 리스트 있으면 제거
              const oldList = popupContainer.querySelector('ul.choices-list');
              if (oldList) oldList.remove();
              // 새 리스트 생성
              const listElem = document.createElement('ul');
              listElem.className = 'choices-list';
              listElem.style.margin = '18px 0 0 0';
              listElem.style.padding = '0 0 0 16px';
              listElem.style.fontSize = '18px';
              listElem.style.color = '#222';
              listElem.style.listStyle = 'disc';
              for (const c of actionData.choices) {
                const li = document.createElement('li');
                li.textContent = c;
                li.style.margin = '8px 0';
                listElem.appendChild(li);
              }
              // 타이틀(h2) 아래에 붙이기
              if (titleElem) titleElem.insertAdjacentElement('afterend', listElem);
              else popupContainer.appendChild(listElem);
            }
            console.log("title 변경 완료");
            const audio = new Audio(actionData.follow_up_question_url);
            audio.play();
            audio.addEventListener('ended', () => {
              // 음성 재생 끝난 뒤 다시 renderWavRecorder를 재귀 호출
             renderWavRecorder({
               popupContainer,
                wavRoot,
                setWavRoot,
                BASE_URL,
                delayMs,
                onAutoClickDone,
              });
            });
          }
        } catch (e) {
          console.error('/get_action 실패:', (e instanceof Error ? e.message : e));
        }
      }}
      autoStart={true}
      startDelay={delayMs}
      recordingDuration={6200}
    />
  );
}
