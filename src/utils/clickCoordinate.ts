/**
 * bbox: { x: number, y: number, width: number, height: number }
 * - x, y: 영역의 좌상단 (뷰포트 기준)
 * - width, height: 영역 크기
 */
// utils/clickCoordinate.ts
export function clickCoordinate(
  bbox: { x: number; y: number; width: number; height: number },
  onClicked?: () => void
) {
  const centerX = bbox.x / 2 + bbox.width / 4;
  const centerY = bbox.y / 2 + bbox.height / 4;

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

