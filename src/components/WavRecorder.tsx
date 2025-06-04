import { useRef, useState, useEffect } from 'react';

export default function WavRecorder({ onRecorded }: { onRecorded?: (blob: Blob) => void }) {
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

          if (onRecorded) onRecorded(blob);  // ← 콜백으로 녹음된 Blob 전달

          // ✅ 자동 다운로드 추가
  const downloadLink = document.createElement('a');
  downloadLink.href = URL.createObjectURL(blob);
  downloadLink.download = 'recorded_audio.webm';
  document.body.appendChild(downloadLink);
  downloadLink.click();
  document.body.removeChild(downloadLink);
    };

    mediaRecorder.start();

    // 3초 후 자동 정지
    setTimeout(() => {
      mediaRecorder.stop();
    }, 10000);
  };
// **2. mount 시 자동으로 녹음 시작**
  useEffect(() => {
    startRecording();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // **3. 버튼(직접 녹음)은 더이상 필요 없다면 삭제 가능!**
  // 만약 버튼도 유지하려면 남겨도 됨
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
