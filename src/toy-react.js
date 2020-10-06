class ElementWrapper {
  constructor(type) {
    this.root = document.createElement(type);
  }

  setAttribute(name, value) {
    this.root.setAttribute(name, value);
  }

  appendChild(component) {
    // 参数 component 是一个 ElementWrapper 包装对象，其属性 root 才是真正的 DOM 节点
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
    this.props = Object.create(null);
    this.children = [];
    this._root = null;
  }

  setAttribute(name, value) {
    this.props[name] = value;
  }

  appendChild(component) {
    this.children.push(component);
  }

  get root() {
    if (!this._root) {
      // 调用自定义组件中的 render 函数，在 webpack 编译后，相当于调用 createElement 函数
      // 所以，this.render().root 等价于获取 createElement 返回值的 root 属性
      // 如果 root 属性不存在，则表明还未调用到 ElementWrapper 或 TextWrapper
      // 此时获取的是 Component 类的 root 属性，这就又触发了 get root()，形成递归调用
      // 直到调用到 ElementWrapper 或 TextWrapper，方可获取到 root 属性
      this._root = this.render().root;
    }

    return this._root;
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
      if (Array.isArray(child)) {
        insertChildren(child);
        return;
      }

      if (typeof child === "string") {
        child = new TextWrapper(child);
      }

      elem.appendChild(child);
    }
  };
  insertChildren(children);

  return elem;
}

/**
 * 将整个应用挂载到根 DOM 节点
 * @param {JSXComponent} component JSX 组件
 * @param {HTMLElement} parentElement 根 DOM 节点
 */
export function render(component, parentElement) {
  parentElement.appendChild(component.root);
}

export default {
  createElement,
  render,
  Component,
};
