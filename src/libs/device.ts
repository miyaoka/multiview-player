export function isTouchDevice() {
  return "ontouchstart" in window || navigator.maxTouchPoints > 0;
}
const div = document.createElement("div");
export function supportsDragAndDrop() {
  return typeof div.draggable === "boolean";
}
