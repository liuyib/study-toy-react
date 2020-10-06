const RENDER_TO_DOM = Symbol("render to dom");

class ElementWrapper {
  constructor(type) {
    this.root = document.createElement(type);
  }

  setAttribute(name, value) {
    if (/^on([\s\S]+)/.test(name)) {
      const eventName = RegExp.$1.toLowerCase();
      this.root.addEventListener(eventName, value);
    } else if (name === "className") {
      this.root.setAttribute("class", value);
    } else {
      this.root.setAttribute(name, value);
    }
  }

  appendChild(component) {
    const range = document.createRange();
    range.setStart(this.root, this.root.childNodes.length);
    range.setEnd(this.root, this.root.childNodes.length);
    component[RENDER_TO_DOM](range);
  }

  [RENDER_TO_DOM](range) {
    range.deleteContents();
    range.insertNode(this.root);
  }
}

class TextWrapper {
  constructor(content) {
    this.root = document.createTextNode(content);
  }

  [RENDER_TO_DOM](range) {
    range.deleteContents();
    range.insertNode(this.root);
  }
}

export class Component {
  constructor() {
    this.props = Object.create(null);
    this.children = [];
    this._root = null;
    this._range = null;
  }

  setAttribute(name, value) {
    this.props[name] = value;
  }

  appendChild(component) {
    this.children.push(component);
  }

  [RENDER_TO_DOM](range) {
    this._range = range;
    this.render()[RENDER_TO_DOM](range);
  }

  rerender() {
    this._range.deleteContents();
    this[RENDER_TO_DOM](this._range);
  }

  setState(newState) {
    if (this.state === null || typeof this.state !== "object") {
      this.state = newState;
      this.rerender();
      return;
    }

    const merge = (oldState, newState) => {
      for (const attr in newState) {
        const oldAttr = oldState[attr];

        if (oldAttr === null || typeof oldAttr !== "object") {
          oldState[attr] = newState[attr];
        } else {
          merge(oldState[attr], newState[attr]);
        }
      }
    };

    merge(this.state, newState);
    this.rerender();
  }
}

/**
 * 创建包装 DOM 节点
 * @param {string} type 根据大小写，@babel/plugin-transform-react-jsx 插件会自动决定传入“字符串” 或 “自定义组件类”
 * @param {Object} attributes 节点属性
 * @param  {Array|string} children 子节点（“由 new ElementWrapper 实例组成的数组” 或 “纯文本”）
 */
export function createElement(type, attributes, ...children) {
  let elem;

  if (typeof type === "string") {
    elem = new ElementWrapper(type);
  } else {
    // 传入的参数是一个 class
    elem = new type();
  }

  for (let attr in attributes) {
    elem.setAttribute(attr, attributes[attr]);
  }

  /**
   * 处理嵌套的子节点
   * @param {Array} children 由 new ElementWrapper 实例组成的数组
   */
  const insertChildren = (children) => {
    for (let child of children) {
      if (child === null) {
        continue;
      }

      if (Array.isArray(child)) {
        insertChildren(child);
      } else if (typeof child === "string") {
        elem.appendChild(new TextWrapper(child));
      } else {
        elem.appendChild(child);
      }
    }
  };
  insertChildren(children);

  return elem;
}

/**
 * 将整个应用挂载到根 DOM 节点
 * @param {JSXComponent} component JSX 组件
 * @param {HTMLElement} container 根 DOM 节点
 */
export function render(component, container) {
  const range = document.createRange();
  range.setStart(container, 0);
  range.setEnd(container, container.childNodes.length);
  range.deleteContents();
  component[RENDER_TO_DOM](range);
}

export default {
  createElement,
  render,
  Component,
};
