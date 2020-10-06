import ToyReact from "./toy-react";

class App extends ToyReact.Component {
  constructor() {
    super();

    this.state = {
      count: 1,
      const: 411,
    };
  }

  render() {
    return (
      <div>
        <h1>Toy React</h1>
        <button
          onClick={() => {
            this.setState({
              count: this.state.count + 1,
            });
          }}
        >
          Add
        </button>
        <div>Count: {this.state.count.toString()}</div>
        <div>Const: {this.state.const.toString()}</div>
      </div>
    );
  }
}

ToyReact.render(<App />, document.getElementById("app"));
