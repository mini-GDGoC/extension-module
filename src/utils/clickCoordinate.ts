/**
 * bbox: { x: number, y: number, width: number, height: number }
 * - x, y: 영역의 좌상단 (뷰포트 기준)
 * - width, height: 영역 크기
 */
export function clickCoordinate(bbox: { x: number, y: number, width: number, height: number }) {
  const centerX = bbox.x + bbox.width / 2;
  const centerY = bbox.y + bbox.height / 2;

  // 마우스 이벤트 생성
  const clickEvent = new MouseEvent('click', {
    bubbles: true,
    cancelable: true,
    clientX: centerX,
    clientY: centerY,
    view: window,
  });

  // 해당 좌표에 위치한 엘리먼트 가져오기
  const elem = document.elementFromPoint(centerX, centerY);
  if (elem) {
    elem.dispatchEvent(clickEvent);
    return true;
  } else {
    console.warn('No element found at bbox center:', centerX, centerY);
    return false;
  }
}


export function clickCoordinateScrollBar(bbox: { x: number, y: number, width: number, height: number }, ratio: number) {
  // 스크롤인 경우에는 스크롤바의 좌표에서 높이보다 1/10만큼 더 내려간곳 클릭함

  const centerX = bbox.x * ratio + bbox.width * ratio / 2;
  const centerY = bbox.y * ratio + bbox.height * ratio + bbox.height * ratio / 10;

  // 마우스 이벤트 생성
  const clickEvent = new MouseEvent('click', {
    bubbles: true,
    cancelable: true,
    clientX: centerX,
    clientY: centerY,
    view: window,
  });

  // 해당 좌표에 위치한 엘리먼트 가져오기
  const elem = document.elementFromPoint(centerX, centerY);
  if (elem) {
    elem.dispatchEvent(clickEvent);
    return true;
  } else {
    console.warn('No element found at bbox center:', centerX, centerY);
    return false;
  }

}
