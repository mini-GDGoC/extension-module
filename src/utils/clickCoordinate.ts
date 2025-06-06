/**
 * bbox: { x: number, y: number, width: number, height: number }
 * - x, y: 영역의 좌상단 (뷰포트 기준)
 * - width, height: 영역 크기
 */
// utils/clickCoordinate.ts
export function clickCoordinate(
  bbox: { x: number; y: number; width: number; height: number },
  ratio: number,
  onClicked?: () => void
) {
  const centerX = bbox.x * ratio + bbox.width / 2 * ratio;
  const centerY = bbox.y * ratio + bbox.height / 2 * ratio;

  const clickEvent = new MouseEvent('click', {
    bubbles: true,
    cancelable: true,
    clientX: centerX,
    clientY: centerY,
    view: window,
  });

  const elem = document.elementFromPoint(centerX, centerY);
  if (elem) {
    elem.dispatchEvent(clickEvent);
    if (typeof onClicked === 'function') {
      onClicked();
    }
    return true;
  } else {
    console.warn('No element found at bbox center:', centerX, centerY);
    return false;
  }
}


export function clickCoordinateScroll(
    bbox: { x: number; y: number; width: number; height: number },
    ratio,
    onClicked?: () => void) {
  const centerX = bbox.x * ratio + bbox.width / 2 * ratio;
  const centerY = bbox.y * ratio + bbox.height * ratio + bbox.height / 10 * ratio;

  const clickEvent = new MouseEvent('click', {
    bubbles: true,
    cancelable: true,
    clientX: centerX,
    clientY: centerY,
    view: window,
  });

  const elem = document.elementFromPoint(centerX, centerY);
  if (elem) {
    elem.dispatchEvent(clickEvent);
    if (typeof onClicked === 'function') {
      onClicked();
    }
    return true;
  } else {
    console.warn('No element found at bbox center:', centerX, centerY);
    return false;
  }
}
