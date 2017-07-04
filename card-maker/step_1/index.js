import React, {Component} from 'react';
import {render} from 'react-dom';

class App extends Component {
  render() {
    return <h1>Hello Wellington!</h1>
  }
}

render(React.createElement(App), document.querySelector('#app'));
