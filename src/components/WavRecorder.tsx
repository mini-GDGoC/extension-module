// components/WavRecorder.tsx 수정 버전

import { useRef, useState, useEffect } from 'react';

interface WavRecorderProps {
  onRecorded?: (blob: Blob) => void;
  autoStart?: boolean; // 자동 시작 여부 제어
  startDelay?: number; // 시작 지연 시간 (ms)
  recordingDuration?: number; // 녹음 시간 (ms)
}

export default function WavRecorder({ 
  onRecorded, 
  autoStart = true, 
  startDelay = 0,
  recordingDuration = 10000 
}: WavRecorderProps) {
  const [recording, setRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [countdown, setCountdown] = useState<number | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunks = useRef<Blob[]>([]);

  const startRecording = async () => {
    setRecording(true);
    setAudioUrl(null);
    setCountdown(null);
    audioChunks.current = [];

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });

      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) audioChunks.current.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        const blob = new Blob(audioChunks.current, { type: 'audio/webm' });
        setAudioUrl(URL.createObjectURL(blob));
        stream.getTracks().forEach((track) => track.stop());
        setRecording(false);

        if (onRecorded) onRecorded(blob);
      };

      mediaRecorder.start();

      // 설정된 시간 후 자동 정지
      setTimeout(() => {
        if (mediaRecorder.state === 'recording') {
          mediaRecorder.stop();
        }
      }, recordingDuration);
    } catch (error) {
      console.error('녹음 시작 실패:', error);
      setRecording(false);
    }
  };

  useEffect(() => {
    if (autoStart && startDelay > 0) {
      // 카운트다운 표시
      let timeLeft = Math.ceil(startDelay / 1000);
      setCountdown(timeLeft);
      
      const countdownInterval = setInterval(() => {
        timeLeft -= 1;
        setCountdown(timeLeft);
        
        if (timeLeft <= 0) {
          clearInterval(countdownInterval);
          setCountdown(null);
          startRecording();
        }
      }, 1000);

      return () => clearInterval(countdownInterval);
    } else if (autoStart && startDelay === 0) {
      // 지연 없이 바로 시작
      startRecording();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoStart, startDelay]);

  return (
    <div className="flex flex-col items-center p-4">
      {countdown !== null && (
        <div className="text-lg font-semibold text-blue-600 mb-2">
          녹음 시작까지 {countdown}초...
        </div>
      )}
      

      {!(autoStart && !recording && audioUrl) && (
  <button
    onClick={startRecording}
    disabled={recording || countdown !== null}
    className={`px-4 py-2 rounded-md text-white ${
      recording ? 'bg-red-500' : 'bg-blue-500 hover:bg-blue-600'
    } ${countdown !== null ? 'opacity-50 cursor-not-allowed' : ''}`}
  >
    {recording ? '녹음 중...' : countdown !== null ? '대기 중...' : ''}
  </button>
)}

      
      {recording && (
        <div className="mt-2 text-sm text-gray-600">
          🎤 음성을 녹음하고 있습니다...
        </div>
      )}
      
      {/* {audioUrl && (
        <audio controls src={audioUrl} className="mt-4" />
      )} */}
    </div>
  );
}