import ToyReact from "./toy-react";

class App extends ToyReact.Component {
  render() {
    return (
      <div>
        <h1>Toy React</h1>
        {this.children}
      </div>
    );
  }
}

ToyReact.render(
  <App id="a" class="b">
    <h2>Awesome Project</h2>
    <div>1</div>
    <div>2</div>
    <div>3</div>
  </App>,
  document.getElementById("app")
);
