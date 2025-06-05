// src/utils/triggerCenterClickThrough.ts

/**
 * 화면 중앙에 클릭 이벤트를 트리거합니다.
 */
export default function triggerCenterClickThrough() {
  // 화면 중앙 좌표 계산
  const x = window.innerWidth / 2;
  const y = window.innerHeight / 2;

  // 중앙 좌표에 클릭 이벤트 생성
  const elem = document.elementFromPoint(x, y);
  if (elem) {
    // 마우스 이벤트(Click) 생성 및 전파
    const event = new MouseEvent('click', {
      view: window,
      bubbles: true,
      cancelable: true,
      clientX: x,
      clientY: y
    });
    elem.dispatchEvent(event);
  }
}
