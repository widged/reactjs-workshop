import React, {Component} from 'react';
import {render} from 'react-dom';

import "./style.css";

class JournalingCard extends Component {
  render() {
    const {classname, children} = this.props;
    return (<journaling-card class={classname}>{children}</journaling-card>);
  }
}

class App extends Component {
  render() {
    const content = (<div>
      <h3>Hello</h3>
      <img src="floredesserreset1418591861lema_0042.png" />
    </div>);
    return (<div><JournalingCard classname='size-key'>{content}</JournalingCard></div>);
  }
}

render(React.createElement(App), document.querySelector('#app'));
