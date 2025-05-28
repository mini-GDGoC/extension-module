// import React, { useRef, useState, useEffect } from 'react';
// import { WaveFile } from 'wavefile';

// interface WavRecorderProps {
//   onFinish?: () => void;
// }

// const WavRecorder: React.FC<WavRecorderProps> = ({ onFinish }) => {
//   const [recording, setRecording] = useState(false);
//   // const mediaRecorderRef = useRef<MediaRecorder>();
//   const mediaRecorderRef = useRef<MediaRecorder | null>(null);
//   const audioChunksRef = useRef<Blob[]>([]);

//   useEffect(() => {
//     // cleanup on unmount
//     return () => {
//     const recorder = mediaRecorderRef.current;
//     if (recorder && recorder.state !== 'inactive') {
//       recorder.stop();
//     }
//   };
//   }, []);

//   const startRecording = async () => {
//     setRecording(true);
//     audioChunksRef.current = [];

//     const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
//     const recorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
//     mediaRecorderRef.current = recorder;

//     recorder.ondataavailable = e => {
//       if (e.data.size > 0) audioChunksRef.current.push(e.data);
//     };

//     recorder.onstop = async () => {
//       // 1) webm → PCM
//       const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
//       const arrayBuffer = await blob.arrayBuffer();
//       const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
//       const decoded = await audioCtx.decodeAudioData(arrayBuffer);

//       // 2) WAV로 인코딩
//       const wav = new WaveFile();
//       wav.fromScratch(
//         1,
//         decoded.sampleRate,
//         '16',
//         decoded.getChannelData(0)
//       );
//       const wavBuffer = wav.toBuffer();
//       const wavBlob = new Blob([wavBuffer], { type: 'audio/wav' });

//       // 3) 자동 다운로드
//       const url = URL.createObjectURL(wavBlob);
//       const a = document.createElement('a');
//       a.href = url;
//       a.download = 'recorded.wav';
//       document.body.appendChild(a);
//       a.click();
//       document.body.removeChild(a);
//       URL.revokeObjectURL(url);

//       setRecording(false);
//       onFinish?.();
//     };

//     recorder.start();
//     // 3초 뒤 자동 중지
//     setTimeout(() => {
//       recorder.stop();
//       stream.getTracks().forEach(t => t.stop());
//     }, 3000);
//   };

//   return (
//     <div style={{ textAlign: 'center', marginTop: 16 }}>
//       <button
//         onClick={startRecording}
//         disabled={recording}
//         style={{
//           padding: '8px 24px',
//           backgroundColor: recording ? '#9CA3AF' : '#10B981',
//           color: 'white',
//           border: 'none',
//           borderRadius: 6,
//           cursor: recording ? 'not-allowed' : 'pointer',
//         }}
//       >
//         {recording ? '녹음 중…' : '3초 음성 녹음'}
//       </button>
//     </div>
//   );
// };

// export default WavRecorder;

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
      const blob = new Blob(audioChunks.current, { type: 'audio/wav' });
      setAudioUrl(URL.createObjectURL(blob));
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
