// utils/session.ts
//session ID 관리
let sessionID: string | null = null;

// 세션 ID를 생성 (UUID)
export function generateSessionID(): string {
    //브라우저 환경에서 crypto.randomUUID가 지원되면ㅊ
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // fallback: 간단한 랜덤 문자열
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

// 세션 ID를 가져옴 (없으면 생성)
export function getSessionID(): string {
  if (!sessionID) {
    sessionID = generateSessionID();
  }
  return sessionID;
}

// 세션 ID를 초기화 (필요시)
export function resetSessionID(): void {
  sessionID = null;
}
