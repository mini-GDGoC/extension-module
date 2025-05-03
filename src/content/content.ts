import htmlCapture from "./htmlCapture.ts";

/**
 * 콘텐츠 스크립트 초기화 함수
 */
function initContentScript(): void {
  console.log('Content script가 로드되었습니다.');

  // HTML 캡처 모듈 초기화
  htmlCapture.init();

  // 필요한 경우 추가 기능 구현
}

// 콘텐츠 스크립트 초기화
initContentScript();
console.log('Content script loaded!');