import React from 'react';
import ReactDOM from 'react-dom';
import { Router } from 'react-router-dom'
import history from './history'
import './static/css/index.css';
import 'bootstrap/dist/css/bootstrap.css';
import App from './App';
import registerServiceWorker from './registerServiceWorker';

ReactDOM.render((<Router history={history}><App /></Router>),
 document.getElementById('root'));
registerServiceWorker();
