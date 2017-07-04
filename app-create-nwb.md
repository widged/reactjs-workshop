# Creating a reactjs application, based on es6, with no configuration

## nwb

https://github.com/insin/nwb

A toolkit for React, Preact, Inferno & vanilla JS apps, React libraries and other npm modules for the web, with no configuration (until you need it)

with npm:

    npm install -g nwb
    cd path/to/projectfolder
    npm install --save-dev nwb

with yarn:

    yarn global add nwb
    cd path/to/projectfolder
    yarn add nwb

first app:
`index.js`

    import React, {Component} from 'react';
    import {render} from 'react-dom';

    class App extends Component {
      render() {
       return <h1>Hello world!</h1>
      }
    }
    render(React.createElement(App), document.querySelector('#app'));


See step1 as an example

    cd path/to/step_1
    npm install react
    npm install react-dom
    npm run start

  =>

  The app is running at http://localhost:3000/

Note: When working within a VM make sure to add the following to your `package.json` files to avoid `Invalid Host header` error.

    "start": "nwb serve-react-app --host your.ip.addr.ess index.js --reload",

  =>

  The app is running at http://your.ip.addr.ess:3000/
