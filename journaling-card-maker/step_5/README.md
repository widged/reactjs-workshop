Time to add some interaction! Click on the card to see it play out.

    cd path/to/step_4/usage
    npm run start

For this, we need some way to maintain the state. For this, it becomes important to understand the fundamental difference between props and state. In react, `this.props` keeps the values that are defined when the component is instantiated and that remain constant over the lifetime of the component's instance. In contrast, `this.state` is used to store values that change as a function of the user interaction or some other side-effect.

The object `this.state` gets initialized in the constructor. After its initialisation, `this.state` should never be modified directly. Any change to the state at a later time must be made using `this.setState({key: "value"})`.

If you have never used reactjs before, the easiest way to define any interaction is:

    import React, {Component} from 'react';

    class JournalingCard extends Component {
      constructor(props) {
        super(props);
        this.state = {counter: 0}
      }
      render() {
        const {classname, children} = this.props;
        const {counter} = this.state;
        const onCounterChange = () => { this.setState({counter: counter + 1}); }
        return (<journaling-card onClick={this.onCounterChange} class={classname}>{counter}{children}</journaling-card>);
      }
    }

    export default JournalingCard;

However, a problem with that approach is that the function `onCounterChange` gets redefined every time the render function is called. Best practices are to attach the function to the class.


    import React, {Component} from 'react';
    class JournalingCard extends Component {
      constructor(props) {
        super(props);
        this.state = {counter: 0}
      }
      onCounterChange() {
        const {counter} = this.state;
        this.setState({counter: counter + 1});
      }
      render() {
        const {classname, children} = this.props;
        const {counter} = this.state;
        const onCounterChange = this.onCounterChange.bind(this);
        return (<journaling-card onClick={this.onCounterChange} class={classname}>{counter}{children}</journaling-card>);
      }
    }

    export default JournalingCard;

Better. But to have the bind call within the render function is not ideal. Even better practices are to move the binding call to the constructor.

        import React, {Component} from 'react';
        class JournalingCard extends Component {
          constructor(props) {
            super(props);
            this.state = {counter: 0};
            this.onCounterChange = this.onCounterChange.bind(this);

          }
          onCounterChange() {
            const {counter} = this.state;
            this.setState({counter: counter + 1});
          }
          render() {
            const {classname, children} = this.props;
            const {counter} = this.state;
            const {onCounterChange} = this;
            return (<journaling-card onClick={this.onCounterChange} class={classname}>{counter}{children}</journaling-card>);
          }
        }

        export default JournalingCard;

For clarity, I like to store any bound function into a bound object, but that is a very personal preference that you won't see in use anywhere else. Best might be to stick to the most common way of doing things.

        import React, {Component} from 'react';
        class JournalingCard extends Component {
          constructor(props) {
            super(props);
            this.state = {counter: 0};
            this.bound = {
              onCounterChange: this.onCounterChange.bind(this)
            };

          }
          onCounterChange() {
            const {counter} = this.state;
            this.setState({counter: counter + 1});
          }
          render() {
            const {classname, children} = this.props;
            const {counter} = this.state;
            const {onCounterChange} = this.bound;
            return (<journaling-card onClick={this.onCounterChange} class={classname}>{counter}{children}</journaling-card>);
          }
        }

        export default JournalingCard;
