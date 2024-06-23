import { HTMLElement } from "linkedom";

const allowedElems = ["body", "svg"];
const forbiddenTags = ["script", "nav", "footer", "aside"];
const unwantedStuff = [
  ["role", "button"],
  ["class", "js-"],
  ["class", "icon"],
  ["class", "navigation"],
  ["class", "-nav"],
  ["class", "-foot"],
  ["class", "foot-"],
  ["class", "menu"],
  ["class", "nav-"],
  ["class", "dropdown"],
  ["class", "share"],
  ["class", "social"],
  ["class", "controls"],
  ["class", "tags"],
  ["class", "deeplink"],
  ["class", "user"],
  ["href", "twitter"],
  ["href", "facebook"],
  ["href", "mailto:"],
  ["href", "reddit"],
  ["aria-label", "icon"],
  ["aria-hidden", "true"],
  ["id", "comments"],
  ["class", "comments"]
];

// Remove elements based on unwanted classnames or other attribute/values combos
export const isUnwanted = (element: HTMLElement) => {
  const tagName = element.tagName.toLowerCase();

  if (forbiddenTags.indexOf(tagName) >= 0) return true; // FUCK YOU 
  if (allowedElems.indexOf(tagName) >= 0) return false;

  let unwanted = false;

  for (let i = 0; i < unwantedStuff.length; ++i) {
    const pair = unwantedStuff[i];
    const value = element.getAttribute(pair[0]);

    if (value && element.getAttribute(pair[0]).indexOf(pair[1]) >= 0) {
      console.log("Extractor.isUnwanted: removing unwanted stuff", {
        stuff: pair[0],
        value: element.getAttribute(pair[0]),
        offendingValue: pair[1]
      });

      unwanted = true;
      break;
    }
  }

  return unwanted;
};