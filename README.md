# reactjs-workshop
Resources for the reactjs workshop, Wellington July 2017


## Things to know

### Execution sequence of a React component’s lifecycle methods
http://javascript.tutorialhorizon.com/2014/09/13/execution-sequence-of-a-react-components-lifecycle-methods/

(also https://medium.com/react-ecosystem/react-components-lifecycle-ce09239010df)

### Interactivity and Binding best practices

    export default class CartItem extends React.Component {

       constructor(props) {
            super(props);
            this.increaseQty = this.increaseQty.bind(this);
        }
        increaseQty() {
          // do something
        }
        render() {
            return (<button onClick={this.increaseQty} className="button success">+</button>);
        }
    }

### Keeping track of things. Props vs state

`this.props` is used to store the value that remain constant over the lifetime of a component instance. It cannot be changed within the component.

`this.state` is used to store values that change as a function of some user interaction or other side-effect. It must be initialized in the constructor. After initialization, any change must be done with `this.setState({key: "value"})`.

    export default class CartItem extends React.Component {

       constructor(props) {
          super(props);
          const {initialValue} = this.props;
          this.increaseQty = this.increaseQty.bind(this);
          this.state = {counter: initialValue || 0};
        }
        increaseQty() {
          const {counter} = this.state
          this.setState({counter: counter+1});
        }
        render() {
          const {counter} = this.state
          return (
            <div>
              <div>{counter}</button
              <button onClick={this.increaseQty} className="button success">+</button>
            </div>
          );
        }
    }

### Redux

See notes
