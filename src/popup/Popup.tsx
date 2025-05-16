import { useEffect, useState } from 'react';

function Popup() {
  const [token, setToken] = useState<string | null>(null);
  const [result, setResult] = useState<string>('');

  // 마운트 시 Background 에게 토큰 요청
  useEffect(() => {
    chrome.runtime.sendMessage({ action: 'getToken' }, (resp) => {
      if (resp?.token) setToken(resp.token);
      else console.error('토큰을 못 받아옴');
    });
  }, []);

  // 예시: 파일 업로드 후 STT 호출
  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!token || !e.target.files?.[0]) return;
    const form = new FormData();
    form.append('audio', e.target.files[0]);
    const res = await fetch('https://openapi.vito.ai/v1/stt', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: form,
    });
    if (!res.ok) {
      setResult(`Error: ${res.status}`);
    } else {
      const json = await res.json();
      setResult(JSON.stringify(json, null, 2));
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-lg font-bold">ReturnZero STT 테스트</h1>
      <input type="file" accept="audio/*" onChange={handleFile} />
      <pre className="mt-2 whitespace-pre-wrap">{result}</pre>
    </div>
  );
}

export default Popup;
