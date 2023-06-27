export const btoax = (str) => btoa(unescape(encodeURIComponent(str)));
export const atobx = (str) => decodeURIComponent(escape(atob(str)));