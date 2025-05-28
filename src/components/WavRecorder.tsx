import { useRef, useState } from 'react';

export default function WavRecorder() {
  const [recording, setRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunks = useRef<Blob[]>([]);

  // wav 타입으로 녹음
  const startRecording = async () => {
    setRecording(true);
    setAudioUrl(null);
    audioChunks.current = [];

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });

    mediaRecorderRef.current = mediaRecorder;

    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) audioChunks.current.push(event.data);
    };

    mediaRecorder.onstop = async () => {
      // webm -> wav 변환 (간단히 webm 파일로 저장, wav 변환은 서버에서 하거나 추가 작업 필요)
        // 1) 녹음된 청크(조각)들을 합쳐서 Blob 객체로 만든다
      const blob = new Blob(audioChunks.current, { type: 'audio/webm' });
        // 2) Blob 으로부터 브라우저가 재생·다운로드할 수 있는 URL 생성
      setAudioUrl(URL.createObjectURL(blob));
        // 3) 마이크 스트림(트랙)을 완전히 닫아서 리소스 해제
      stream.getTracks().forEach((track) => track.stop());
      setRecording(false);
    };

    mediaRecorder.start();

    // 3초 후 자동 정지
    setTimeout(() => {
      mediaRecorder.stop();
    }, 3000);
  };

  return (
    <div className="flex flex-col items-center">
      <button
        className={`px-4 py-2 rounded-md text-white ${recording ? 'bg-gray-400' : 'bg-blue-500 hover:bg-blue-600'}`}
        onClick={startRecording}
        disabled={recording}
      >
        {recording ? '녹음 중...' : '3초간 녹음'}
      </button>
      {audioUrl && (
        <audio controls src={audioUrl} className="mt-4" />
      )}
    </div>
  );
}
