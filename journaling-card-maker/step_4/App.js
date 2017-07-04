import React, {Component} from 'react';
import JournalingCard from './JournalingCard.js';
import "./style.css";



class App extends Component {
  render() {
    const content = (<div>
      <h3>Hello</h3>
      <img src="floredesserreset1418591861lema_0042.png" />
    </div>);
    return (<div><JournalingCard classname='size-key'b customname>{content}</JournalingCard></div>);
  }
}


export default App;
