// src/state/overlayState.ts
let overlayOpen = false;

export function setOverlayOpen(val: boolean) {
  overlayOpen = val;
}
export function isOverlayOpen() {
  return overlayOpen;
}
