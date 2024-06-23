const urlRegex = /(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)/;
const httpRegex = /^https?:\/\//;

const getSecureUrl = (url: string) => {
  console.log("Fetcher: securing", url);

  if (!httpRegex.test(url)) {
    url = `https://${url}`;
    console.log("Fetcher: no http protocol. Added", url);
  }

  if (url.startsWith("http://")) {
    url = url.replace("http://", "https://");
    console.log("Fetcher: converted to https", url);
  }

  return url;
};

const getGoogleUrl = (url: string) => {
  url = encodeURI(url);
  console.log("Fetcher: google search link", `https://www.google.com/search?q=${url}`);
  return `https://www.google.com/search?q=${url}`;
};

const getValidUrl = (url: string) => {
  console.log("Fetcher: getting valid url info", { url });

  if (urlRegex.test(url)) {
    console.log("Fetcher: Valid, getting a secure url");
    return getSecureUrl(url);
  }

  console.log("Fetcher: no valid URL, getting a google search instead");
  const googleUrl = getGoogleUrl(url);
  return googleUrl;
};

export const Fetcher = async (url: string) => {
  try {
    const validlUrl = getValidUrl(url);
    const res = await fetch(validlUrl);
    const finalUrl = res.url;
    const txt = await res.text();
    return { txt, finalUrl };
  } catch (err) {
    console.error("Fetcher: error", err);
    throw err;
  }
};
