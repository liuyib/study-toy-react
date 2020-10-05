export function createElement(tagName, attributes, ...children) {
  let elem = document.createElement(tagName);

  for (let attr in attributes) {
    elem.setAttribute(attr, attributes[attr]);
  }

  for (let child of children) {
    // 处理文本节点
    if (typeof child === "string") {
      child = document.createTextNode(child);
    }

    elem.appendChild(child);
  }

  return elem;
}
