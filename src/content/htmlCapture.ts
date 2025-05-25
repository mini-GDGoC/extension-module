// // htmlCapture.ts

// /**
//  * HTML 캡처 기능을 제공하는 모듈
//  */
// interface HtmlCaptureMessage {
//   action: string;
//   html: string;
// }

// class HtmlCapture {
//   /**
//    * 현재 페이지의 전체 HTML을 가져옵니다.
//    * @returns {string} 페이지의 전체 HTML
//    */
//   public getFullHTML(): string {
//     const fullHTML: string = document.documentElement.outerHTML;
//     console.log('HTML 캡처됨');

//     // 백그라운드 스크립트나 팝업으로 HTML 전송
//     if (typeof chrome !== 'undefined' && chrome.runtime) {
//       const message: HtmlCaptureMessage = {
//         action: 'htmlCaptured',
//         html: fullHTML
//       };

//       chrome.runtime.sendMessage(message);
//     }

//     return fullHTML;
//   }

//   /**
//    * 터치 및 클릭 이벤트 리스너를 설정합니다.
//    */
//   public setupTouchListeners(): void {
//     // 터치 시작 이벤트
//     document.addEventListener('touchstart', (): void => {
//       console.log('터치 발생!');
//       this.getFullHTML();
//     });

//     // 클릭 이벤트 (데스크톱 환경용)
//     // 클릭 이벤트 (데스크탑 환경용)
//   document.addEventListener('click', (e: MouseEvent): void => {
//     console.log('클릭 발생!');
//     console.log('클릭 좌표 (client):', e.clientX, e.clientY); // 뷰포트 기준 좌표
//     console.log('클릭 좌표 (page):', e.pageX, e.pageY);     // 문서 전체 기준 좌표
//     console.log('클릭 좌표 (screen):', e.screenX, e.screenY); // 모니터 기준 좌표
//     this.getFullHTML();
//   });
//   }

//   /**
//    * HTML 캡처 모듈을 초기화합니다.
//    */
//   public init(): void {
//     if (document.readyState === 'complete' || document.readyState === 'interactive') {
//       this.setupTouchListeners();
//     } else {
//       document.addEventListener('DOMContentLoaded', (): void => {
//         this.setupTouchListeners();
//       });
//     }
//     console.log('HTML 캡처 모듈이 초기화되었습니다.');
//   }
// }

// // 싱글톤 인스턴스 생성 및 내보내기
// const htmlCapture = new HtmlCapture();
// export default htmlCapture;
