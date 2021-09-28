import React from 'react';
import './App.scss';
// import ChatView from './page/chatView/ChatView';
import Routes from "./routes";
import { BrowserRouter as Router } from "react-router-dom"

var App = () => {
  return (
    <Router>
        <div className="App">
            <Routes />
        </div>
    </Router>
    // <div>
    //   <ChatView />
    // </div>
  );
}

export default App;
