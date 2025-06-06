import ReactDOM from 'react-dom/client';
import WavRecorder from '../components/WavRecorder';
import {clickCoordinate, clickCoordinateScrollBar} from './clickCoordinate';

// WavRecorder 렌더링 함수 (기존 코드 외부에 추가)

type RenderWavRecorderArgs = {
  popupContainer: HTMLElement;
  wavRoot: ReturnType<typeof ReactDOM.createRoot> | null;
  setWavRoot: (root: ReturnType<typeof ReactDOM.createRoot> | null) => void;
  BASE_URL: string;
  delayMs?: number;
};

export function renderWavRecorder({
  popupContainer,
  wavRoot,
  setWavRoot,
  BASE_URL,
  delayMs = 0,
}: RenderWavRecorderArgs) {
  // 기존 root가 있으면 제거
  if (wavRoot) {
    wavRoot.unmount();
    setWavRoot(null);
  }

  // 새로운 div 생성
  const wavDiv = document.createElement('div');
  wavDiv.id = 'wavrecorder-wrap';
  popupContainer.appendChild(wavDiv);

  // React 렌더링
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
                      // ↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓
            // get_action 응답에 bbox/action이 있으면 자동 클릭x
              if (actionData.action === 'click' && actionData.bbox) {
                clickCoordinate(actionData.bbox);
                console.log('화면 클릭');
              } else if (actionData.action === 'scroll' && actionData.bbox) {
                  //이렇게 하면 스크롤 바를 클릭 하는거라서 스크롤바 밑을 클릭 하는 로직을 만들어야 함
                  clickCoordinateScrollBar(actionData.bbox, 1/2); // 나중에 ratio 값 조정 해야 함 지금은 호인이 컴퓨터에 맞게 1/2로 함 brower_max-size/picture_max_size
              } else {
                  //추가 질문이 들어온 경우
                  console.log('get_action 응답에서 팔로우업 퀘스쳔이 들어옴');
                    // 팔로우업 질문이 있는 경우, WavRecorder를 다시 렌더링
                  /*
                {
                    "follow_up_question_url": obj_url,
                    "choices": [],
                    "user_answer": user_answer,
                }
                  * */

              }

            // ↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑
          // ... (버튼 클릭/스크롤 처리 등)
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
