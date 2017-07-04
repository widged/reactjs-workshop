import React, {Component} from 'react';
class JournalingCard extends Component {
  constructor(props) {
    super(props);
  }
  render() {
    const {classname, children} = this.props;
    return (<journaling-card class={classname}>{children}</journaling-card>);
  }
}

export default JournalingCard;
