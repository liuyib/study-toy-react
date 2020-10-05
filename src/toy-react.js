class ElementWrapper {
  constructor(type) {
    this.root = document.createElement(type);
  }

  setAttribute(name, value) {
    this.root.setAttribute(name, value);
  }

  appendChild(component) {
    // 参数 component 也是一个 ElementWrapper 包装对象
    // 所以 component.root 才是真正的 DOM 节点
    this.root.appendChild(component.root);
  }
}

class TextWrapper {
  constructor(content) {
    this.root = document.createTextNode(content);
  }
}

export class Component {
  constructor() {
    // Object.create(null) 创建一个绝对空的对象
    this.props = Object.create(null);
    this.children = [];
    // _ 开头表示私有属性
    this._root = null;
  }

  setAttribute(name, value) {
    this.props[name] = value;
  }

  appendChild(component) {
    this.children.push(component);
  }

  get root() {
    // 获取 Component 的 root 属性时，返回 render 后的 root 属性，
    // 如果 render 后没有 root 属性，则会递归调用，直到获取 root 属性。
    if (!this._root) {
      this._root = this.render().root;
    }

    return this._root;
  }
}

export function createElement(type, attributes, ...children) {
  let elem;

  if (typeof type === "string") {
    elem = new ElementWrapper(type);
  }
  // 传入的参数是一个类组件
  else {
    elem = new type();
  }

  for (let attr in attributes) {
    elem.setAttribute(attr, attributes[attr]);
  }

  for (let child of children) {
    // 处理文本节点
    if (typeof child === "string") {
      child = new TextWrapper(child);
    }

    elem.appendChild(child);
  }

  return elem;
}

export function render(component, parentElement) {
  parentElement.appendChild(component.root);
}
