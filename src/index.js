function createElement(tagName, attributes, ...children) {
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

let ToyReact = (
  <div id="a" class="b">
    <div>1</div>
    <div>2</div>
    <div>3</div>
  </div>
);

document.body.appendChild(ToyReact);
