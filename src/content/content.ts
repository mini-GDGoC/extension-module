import htmlCapture from "./htmlCapture.ts";
//import * as wasi from "node:wasi";

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


// 클래스와 data-set 속성으로 정확히 찾기
// function clickBurgerButton() {
//   try {
//     const burgerButton = document.querySelector('div.category_button.bold.button[data-set="2"]');
//
//     if (burgerButton) {
//       console.log('버거 버튼 찾음:', burgerButton);
//       (burgerButton as HTMLElement).click();
//       console.log('버거 버튼 클릭 완료');
//       return true;
//     } else {
//       console.log('버거 버튼을 찾을 수 없음');
//       return false;
//     }
//   } catch (error) {
//     console.error('버거 버튼 클릭 중 오류:', error);
//     return false;
//   }
// }
// clickBurgerButton()

setTimeout(function() {
  // console.log('1초가 지났어요!');
}, 1000);


// content script에서 실행
function clickAt(x: number, y: number) {
  const element = document.elementFromPoint(x, y) as HTMLElement | null;
  if (element) {
    element.click();
  }
}

function wait(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function realClickAt() {

  clickAt(260, 191);
  console.log('<UNK1>');
  await wait(1000);
  clickAt(330, 306);
  console.log('<UNK2>');
  await wait(1000);
  clickAt(260, 191);
  console.log('<UNK3>');


}


realClickAt();


const width = window.innerWidth;
const height = window.innerHeight;
console.log(width, height);

