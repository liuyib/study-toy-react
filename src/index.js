import { createElement, Component, render } from "./toy-react";

class MyComponent extends Component {
  render() {
    return (
      <div>
        <h1>My Component</h1>
        {this.children}
      </div>
    );
  }
}

render(
  <MyComponent id="a" class="b">
    <div>1</div>
    <div>2</div>
    <div>3</div>
  </MyComponent>,
  document.getElementById("app")
);
