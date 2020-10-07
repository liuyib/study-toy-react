const RENDER_TO_DOM = Symbol("render to dom");

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

  get vdom() {
    return this.render().vdom;
  }

  [RENDER_TO_DOM](range) {
    this._range = range;
    this._vdom = this.vdom;
    this.render()[RENDER_TO_DOM](range);
  }

  update() {
    const isSameNode = (oldNode, newNode) => {
      if (oldNode.type !== newNode.type) {
        return false;
      }

      for (const name in newNode.props) {
        if (oldNode.props[name] !== newNode.props[name]) {
          return false;
        }
      }

      const keys = (vals) => Object.keys(vals);
      if (keys(oldNode.props) > keys(newNode.props)) {
        return false;
      }

      if (newNode.type === "#text") {
        if (newNode.content !== oldNode.content) {
          return false;
        }
      }

      return true;
    };

    const update = (oldNode, newNode) => {
      if (!isSameNode(oldNode, newNode)) {
        newNode[RENDER_TO_DOM](oldNode._range);
        return;
      }
      newNode._range = oldNode._range;

      const newChildren = newNode.vchildren;
      const oldChildren = oldNode.vchildren;

      if (!newChildren || !newChildren.length) {
        return;
      }

      let tailRange = oldChildren[oldChildren.length - 1]._range;

      for (let i = 0; i < newChildren.length; i++) {
        const newChild = newChildren[i];
        const oldChild = oldChildren[i];

        if (i < oldChildren.length) {
          update(oldChild, newChild);
        } else {
          const range = document.createRange();
          range.setStart(tailRange.endContainer, tailRange.endOffset);
          range.setEnd(tailRange.endContainer, tailRange.endOffset);
          newChild[RENDER_TO_DOM](range);
          tailRange = range;
        }
      }
    };

    const vdom = this.vdom;
    update(this._vdom, vdom);
    this._vdom = vdom;
  }

  rerender() {
    const oldRange = this._range;
    const range = document.createRange();

    range.setStart(oldRange.startContainer, oldRange.startOffset);
    range.setEnd(oldRange.startContainer, oldRange.startOffset);
    this[RENDER_TO_DOM](range);

    oldRange.setStart(range.endContainer, range.endOffset);
    oldRange.deleteContents();
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

class ElementWrapper extends Component {
  constructor(type) {
    super(type);
    this.type = type;
  }

  get vdom() {
    this.vchildren = this.children.map((child) => child.vdom);

    return this;
  }

  [RENDER_TO_DOM](range) {
    this._range = range;

    let root = document.createElement(this.type);

    for (const name in this.props) {
      let value = this.props[name];

      if (/^on([\s\S]+)/.test(name)) {
        const eventName = RegExp.$1.toLowerCase();
        root.addEventListener(eventName, value);
      } else if (name === "className") {
        root.setAttribute("class", value);
      } else {
        root.setAttribute(name, value);
      }
    }

    if (!this.vchildren) {
      this.vchildren = this.children.map((child) => child.vdom);
    }

    for (const child of this.vchildren) {
      const childRange = document.createRange();
      childRange.setStart(root, root.childNodes.length);
      childRange.setEnd(root, root.childNodes.length);
      child[RENDER_TO_DOM](childRange);
    }

    replaceContent(range, root);
  }
}

class TextWrapper extends Component {
  constructor(content) {
    super(content);
    this.type = "#text";
    this.content = content;
  }

  get vdom() {
    return this;
  }

  [RENDER_TO_DOM](range) {
    this._range = range;
    let root = document.createTextNode(this.content);
    replaceContent(range, root);
  }
}

function replaceContent(range, node) {
  range.insertNode(node);
  range.setStartAfter(node);
  range.deleteContents();

  range.setStartBefore(node);
  range.setEndAfter(node);
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
