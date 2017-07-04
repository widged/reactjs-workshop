# reactjs-workshop
Resources for the reactjs workshop, Wellington July 2017


## Things to know

### Execution sequence of a React component’s lifecycle methods
http://javascript.tutorialhorizon.com/2014/09/13/execution-sequence-of-a-react-components-lifecycle-methods/

(also https://medium.com/react-ecosystem/react-components-lifecycle-ce09239010df)

## Binding best practices

  export default class CartItem extends React.Component {

     constructor(props) {
          super(props);
          this.increaseQty = this.increaseQty.bind(this);
      }

      render() {
          <button onClick={this.increaseQty} className="button success">+</button>
      }
  }

### Redux

See notes
