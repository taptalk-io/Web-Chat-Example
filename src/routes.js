import React from "react";
import { BrowserRouter, Switch, Route, Redirect } from "react-router-dom";
import { ToastContainer } from 'react-toastify';
import ChatView from './page/chatView/ChatView';
import Login from './page/login/Login';
import Register from './page/register/Register';
import { connect } from 'react-redux';
import { setAppData } from './redux/actions/reduxActionAppData';
import { clearActiveRoom } from './redux/actions/reduxActionActiveRoom';
import { taptalk } from '@taptalk.io/web-sdk';

const Routes = (props) => {
    props.clearActiveRoom();

    let _appData = {
        appID: process.env.REACT_APP_API_KEY_ID,
        appSecret: process.env.REACT_APP_API_KEY_SECRET,
        //serverID: "c688547df4f956f51cd768fae",
        //serverSecret: "NjFiMWFmYjM5YWNjNTEuMS4x/YTEwNjZlYmU/YTgwZDQ1MDJiMmZh/MzUyYWVhMDYzMDY0",
        baseApiUrl: process.env.REACT_APP_ENVIRONMENT_API
    };

    props.setAppData({ data: _appData });
    
    let deviceID = "taptalk-chrome";
    let appID = process.env.REACT_APP_API_KEY_ID;
    let appSecret = process.env.REACT_APP_API_KEY_SECRET;
    // let serverID = "c688547df4f956f51cd768fae";
    // let serverSecret = "NjFiMWFmYjM5YWNjNTEuMS4x/YTEwNjZlYmU/YTgwZDQ1MDJiMmZh/MzUyYWVhMDYzMDY0";
    let baseApiUrl = process.env.REACT_APP_ENVIRONMENT_API;
    
    taptalk.init(appID, appSecret, baseApiUrl, deviceID);

    // props.setActiveRoom({ data: "asd" });


    return (
        <>
            <ToastContainer className="ToastContainer" />
            <BrowserRouter>
                <Switch>
                    <Route path="/login" component={Login} exact />
                    <Route path="/register" component={Register} exact />
                    <Route path="/chat" component={ChatView} exact />

                    <Route exact path="/" render={() => (
                        <Redirect to="/chat"/>
                    )} />

                    <Route render={() => (
                        <Redirect to="/chat"/>
                    )} />
                </Switch>
            </BrowserRouter>
        </>
    )
}

const mapDispatchToProps = {
    setAppData,
    clearActiveRoom
};
  
export default connect(null, mapDispatchToProps)(Routes);