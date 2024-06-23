import { parseHTML, HTMLElement } from "linkedom";
import { isUnwanted } from "./unwanted";
import { isInvisible } from "./invisible";

const keepAttributes = ["href", "id", "src", "colspan", "rowspan"];
const forbiddenTags = ["script", "nav", "footer", "aside"];
const allowedEmptyTags = ["img", "svg", "br", "hr", "iframe"];
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
  "pre",
  "code",
  "iframe"
];

const logElem = (elem: HTMLElement) => {
  return elem.outerHTML.substring(0, 50);
};

const getUrl = (path: string, baseUrl: string) => {
  if (!path) {
    console.log("Extractor.getUrl: empty path");
    return "";
  }

  console.log("Extractor.getUrl: getting", { path, baseUrl });
  if (path.startsWith("//")) {
    path = `https:${path}`;
  }

  if (!/^(data|https?):\/\//.test(path)) {
    path = `${baseUrl}${path.replace(/^\//, "")}`;
  }

  console.log("Extractor.getUrl: url is", { path });
  return path;
};

const cleanNode = (elem: HTMLElement, baseUrl: string, level: number) => {
  const tagName = elem.tagName.toLowerCase();
  console.log(`${indent(level)} Extractor.cleanNode: cleaning`, logElem(elem));

  // Invisible node
  if (isInvisible(elem)) {
    console.log("Extractor.cleanNode: invisible element");
    elem.remove();
    return;
  }

  // Empty node
  if (elem.innerText === "" && allowedEmptyTags.indexOf(tagName) < 0 && !elem.querySelector(allowedEmptyTags.join(","))) {
    console.log("Extractor.cleanNode: empty element");
    elem.remove();
    return;
  }

  // TODO: check for forbidden nodes?

  // Unwanted stuff
  if (isUnwanted(elem)) {
    elem.remove();
    return;
  }

  // Valid element

  // Remove attributes(most of them)
  if (elem.tagName !== "SVG") { // TODO: remove SVGs without dimensions?
    return;

    // TODO: There are other elems that need to keep attrs?
    const attrs = elem.getAttributeNames();
    attrs.forEach((attr: string) => {
      // Data-Src
      if (attr == "data-src") { // TODO: && elem === iframe/img ?
        elem.setAttribute("src", elem.getAttribute(attr));
      }

      if (keepAttributes.indexOf(attr) < 0) {
        elem.removeAttribute(attr);
      }
    });
  } else {
    return; // TODO: SVG must be rendered with all its children. Are there other elems like this?
  }

  // Fix images
  if (elem.tagName === "IMG") {  // TODO: PICTURE elements
    // TODO: get correct relative URLs (l3pro.netlify.app/html_test)
    console.log("IMG", elem.getAttribute("src"));
    const src = getUrl(elem.getAttribute("src"), baseUrl); // TODO use data-src if no src?
    console.log("IMG NOW", src);
    elem.setAttribute("src", src);
  }

  // TODO Iframes?
  // TODO Videos?

  // Fix links
  if (elem.tagName === "A") {
    console.log("A", elem.getAttribute("href"));

    if (elem.getAttribute("href")) {
      const href = getUrl(elem.getAttribute("href"), baseUrl);
      console.log("A NOW", href);
      elem.setAttribute("href", href);
      /* TODO: for mobile app, redirect this
      elem.setAttribute(
        "onClick",
        `window.ReactNativeWebView.postMessage('${href}')`,
      ); */
    }
  }

  elem.children.forEach(child => cleanNode(child, baseUrl, level + 1));
};

const indent = (level: number) => {
  let indent = "";

  for (let i = 0; i < level; ++i) {
    indent += ".";
  }

  return indent;
};

const checkNode = (root: HTMLElement, baseUrl: string, level = 0): string => {
  const tagName = root.tagName.toLowerCase();
  console.log(`${indent(level)} Extractor.checkNode: checking`, logElem(root));

  // Forbidden node
  if (forbiddenTags.indexOf(tagName) >= 0) {
    console.log("Extractor.checkNode: node is forbidden");
    return "";
  }

  // Invisible node
  if (isInvisible(root)) {
    console.log("Extractor.checkNode: node is invisible");
    return "";
  }

  // Unwanted stuff
  if (isUnwanted(root)) {
    return "";
  }

  // Content node
  if (contentTags.indexOf(tagName) >= 0) {
    console.log(`${indent(level)} Extractor.checkNode: node is content`);
    cleanNode(root, baseUrl, level);
    return root.isConnected ? root.outerHTML : "";
  }

  // Keep looking
  let content = "";
  root.children.forEach((elem: HTMLElement) => {
    content += checkNode(elem, baseUrl, level + 1);
  });

  return content; // TODO: newlines after each parsed element? spaces after inline elements?
};

const getBaseUrl = (url: string) => {
  const sections = url.replace(/^https?:\/\//, "").split("/");
  const domain = sections[0];
  const baseUrl = `https://${domain}/`;
  console.log("Extractor: Base URL", { url, baseUrl });
  return baseUrl;
};

export const Extractor = (html: string, url: string) => {
  const baseUrl = getBaseUrl(url);
  const { document } = parseHTML(html);
  const content = `
<head>
${styles}
</head>
<body>
  <h3><code>${url}</code></h3>
  <hr/>
  ${checkNode(document.body as unknown as HTMLElement, baseUrl)}
</body>`;
  return content;
};

const styles = `
<style>
img {
  max-width: 80%;
  display: block;
  margin: 1rem auto;
}

iframe {
  display: block;
  width: 80%;
  height: 40%;
  margin: 1rem auto;
}
</style>
`;
// TODO: Append basic styles, like table border?