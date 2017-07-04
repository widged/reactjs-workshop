import React, {Component} from 'react';
import {render} from 'react-dom';

class App extends Component {
  render() {
    return (<div><img src="carrot.svg" style={{width: 240, border: "1px solid gray", padding: 20}}/></div>);
  }
}

render(React.createElement(App), document.querySelector('#app'));
