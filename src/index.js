import ToyReact from "./toy-react";

class App extends ToyReact.Component {
  constructor() {
    super();

    this.state = {
      count: 1,
    };
  }

  render() {
    return (
      <div>
        <h1>Toy React</h1>
        <button
          onClick={() => {
            this.state.count += 1;
            this.rerender();
          }}
        >
          Add
        </button>
        Count: <span>{this.state.count.toString()}</span>
      </div>
    );
  }
}

ToyReact.render(<App />, document.getElementById("app"));
