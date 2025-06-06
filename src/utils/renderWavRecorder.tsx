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
          } else if (actionData.action === 'scroll' && actionData.bbox) {
            // 스크롤 이라고 왔을 때의 처리
            clickCoordinateScroll(actionData.bbox, 1/2,() => {
                console.log('자동 스크롤 완료!');
                if (typeof onAutoClickDone === 'function') {
                    onAutoClickDone();
                }

                // 여기서 부터는 어케 해야 하는 지 모르겠음
                // 이 다음부터 get_scroll로 넘어가야 하는데 어떻게 넘어가는지 모르겠어
            })
          } else {
            // 여기서는 팔로우업 퀘스천이 들어옴
            {
              // "follow_up_question_url": obj_url,
            // "choices": [],
            // "user_answer": user_answer,
            }

            let audio_url = actionData.follow_up_question_url;
            let options = actionData.choices;
            console.log(audio_url, options, "get_action 응답 follow_up_question_url");
            if (audio_url) {
                const audio = new Audio(audio_url);
                audio.play().catch(err => {
                    console.warn('자동 재생 실패:', err);
                });

                const audioElem = document.createElement('audio');
                audioElem.src = audio_url;
                audioElem.controls = true;
                audioElem.style.display = 'none';
                popupContainer.appendChild(audioElem);

                //이거 이렇게 하는거 맞음 너가 코드 확인 필요 함 이미 렌더 안인데 여기서 get_action 다시 하려고 다시 render로 들어가느넥 맞는 방법인지 리액트를 몰라서 모르겠음
                // 그리고 여기서는 options들을 어떻게 화면에 보여줌? 렌더 안으로 들어가서 보여주는건가?
                audio.addEventListener('ended', () => {
                    console.log('오디오 재생 완료, n초 후 녹음 시작');
                    setTimeout(() => {
                    renderWavRecorder({
                        popupContainer,
                        wavRoot,
                        setWavRoot,
                        BASE_URL,
                        delayMs: 0,
                        onAutoClickDone, // ← 콜백 전달
                    });
                    }, 0);
                });
            }
            // 이거 화면 어떻게 보여줘야 함? get_question 처럼 하고 화면 보여줘야 하는데.
            //너가 오디오 캡쳐모듈에서 get-question 호출 하고 그 다음 부터 실행하는 로직과 같은걸로 여기 해야 함

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
