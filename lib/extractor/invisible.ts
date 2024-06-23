import { HTMLElement } from "linkedom";

export const isInvisible = (element: HTMLElement) => {
  if (/display *: *none/.test(element.getAttribute("style"))) {
    return true;
  }

  return false;
};
