import { parseHTML } from "linkedom";
import { Element } from "linkedom/types/interface/element";

const keepAttributes = ["href", "id", "src", "colspan", "rowspan"];
const forbiddenTags = ["script", "nav", "footer"];
const allowedEmptyTags = ["img", "svg"];
const contentTags = [
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "p",
  "blockquote",
  "ul",
  "a",
  "img",
  "table",
  "svg",
  "time",
  "span",
  "small",
];
const unwantedStuff =
  "[class*=dropdown],[class*=share],[class*=video],[href*=twitter],[href*=facebook],[href*=mailto:],[href*=reddit],[aria-label*=icon]";

const getBaseUrl = (path: string) => {
  let domain: any = path.replace(/^https?:\/\//, "").split("/");
  domain = domain[0];

  console.log("DOMAIN IS", path, `https://${domain}`);
  return `https://${domain}`;
};

/**
 * removing unwanted things??, like
 * everything before logos: document.querySelectorAll('[aria-label*=logo]')
 * everything like a dropdown document.querySelectorAll('[class*=dropdown]')
 * text that is contained in a DIV, not in a P or a SPAN or other content element
const removeBeforeLogo = (elem: Element) => {
  let parent = elem;

  while (parent.parentElement.tagName !== 'BODY') {
    console.log('ELEM', parent.outerHTML);

    while (parent.previousElementSibling !== null) {
      console.log('Remov', parent.previousElementSibling.outerHtml);
      parent.previousElementSibling.remove();
    }

    parent = parent.parentElement;
  }

  return parent;
}; */

const getUrl = (path: string, base: string) => {
  if (path.startsWith("//")) {
    path = `https:${path}`;
  }

  if (!/^(data|https?):\/\//.test(path)) {
    path = `${base}/${path}`;
  }

  return path;
};

const cleanNode = (elem: Element, baseUrl: string) => {
  console.log("CLEANING", elem.tagName, elem.outerHTML);
  // Remove invisible things
  if (/display *: *none/.test(elem.getAttribute("style"))) {
    console.log("INVISIBLE");
    elem.remove();
  }

  // Remove unwanted attributes(most of them)
  if (elem.tagName !== "SVG") {
    // TODO: There are other elems that need to keep attrs?
    const attrs = elem.getAttributeNames();
    attrs.forEach((attr: string) => {
      if (keepAttributes.indexOf(attr) < 0) {
        elem.removeAttribute(attr);
      }
    });
  } else {
    return; // TODO: SVG must be rendered with all its children. Are there other elems like this?
  }

  // Remove empty things
  // TODO: removing empty things again?
  if (
    elem.innerText === "" &&
    allowedEmptyTags.indexOf(elem.tagName.toLowerCase()) < 0 &&
    elem.children.length === 0 //TODO: diff between children and childNode?
  ) {
    console.log("EMPTY", {
      children: elem.children.length,
      childNodes: elem.childNodes.length,
    });
    elem.remove();
  }

  if (elem.tagName === "IMG") {
    // TODO: get correct relative URLs (l3pro.netlify.app/html_test)
    //console.log('IMG', elem.getAttribute('src'));
    const src = getUrl(elem.getAttribute("src"), baseUrl);
    //console.log('IMG NOW', src);
    elem.setAttribute("style", "max-width: 100%");
    elem.setAttribute("src", src);
  }

  if (elem.tagName === "A") {
    //console.log('A', elem, elem.getAttribute('href'));

    if (elem.getAttribute("href")) {
      const href = getUrl(elem.getAttribute("href"), baseUrl);
      //console.log('A NOW', href);
      elem.setAttribute("href", "#");
      elem.setAttribute(
        "onClick",
        `window.ReactNativeWebView.postMessage('${href}')`,
      );
    }
  }

  elem.children.forEach(child => cleanNode(child, baseUrl));
};

const checkNode = (root: Element, baseUrl: string) => {
  const tagName = root.tagName.toLowerCase();
  console.log("Checking", tagName);

  // Empty node
  if (
    root.innerText === "" &&
    allowedEmptyTags.indexOf(tagName) < 0 &&
    root.querySelectorAll(allowedEmptyTags.join(",")).length === 0
  ) {
    console.log("ROOT is empty", root.outerHTML);
    return "";
  }

  // Content node
  if (contentTags.indexOf(tagName) >= 0) {
    console.log("ROOT is content", root.outerHTML);
    cleanNode(root, baseUrl);
    return root.outerHTML;
  }

  // Keep looking
  let content = "";

  root.children.forEach((elem: Element) => {
    content += checkNode(elem, baseUrl);
  });

  return content; // TODO: newlines after each parsed element? spaces after inline elements?
};

export const Extractor = (
  html: string,
  url: string
) => {
  try {
    console.log("PARSING", html);
    console.log("\n\n");
    const { document } = parseHTML(html);
    const baseUrl = getBaseUrl(url);

    // Remove all unwanted elements
    console.log("UNWANTED", `${forbiddenTags.join(",")},${unwantedStuff}`);
    document.body
      .querySelectorAll(`${forbiddenTags.join(",")},${unwantedStuff}`)
      .forEach((node: Element) => node.remove());


    // Finally, cleanup the content
    const content = checkNode(document.body, baseUrl);
    return content;
  } catch (err) {
    console.error("Extractor: error", err);
    throw err;
  }
};
