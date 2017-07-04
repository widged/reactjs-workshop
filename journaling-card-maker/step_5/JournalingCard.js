import React, {Component} from 'react';
class JournalingCard extends Component {
  constructor(props) {
    super(props);
    this.state = {counter: 0}
    this.onCounterChange = this.onCounterChange.bind(this);
  }
  onCounterChange() {
    const {counter} = this.state;
    this.setState({counter: counter + 1})
  }
  render() {
    const {classname, children} = this.props;
    const {counter} = this.state;
    return (<journaling-card onClick={this.onCounterChange} class={classname}>{counter}{children}</journaling-card>);
  }
}

export default JournalingCard;
