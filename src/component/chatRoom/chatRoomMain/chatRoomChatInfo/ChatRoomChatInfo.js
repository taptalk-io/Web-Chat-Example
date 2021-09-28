import React from 'react';
import './ChatRoomChatInfo.scss';
import { taptalk } from '@taptalk.io/web-sdk';

var ChatRoomChatInfo = (props) => {
  let messageInfo = (message) => {
    let sender, target, _message;

    if(message.user.userID === taptalk.getTaptalkActiveUser().userID) {
        sender = "You";
    }else {
        sender = message.user.fullname;
    }

    if(message.target.targetID === taptalk.getTaptalkActiveUser().userID) {
        target = "you";
    }else {
        target = message.target.targetName;
    }

    _message = message.body.replace("{{sender}}", sender).replace("{{target}}", target);

    return _message;
  }

  return (
    <div className="chat-room-info-wrapper">
        <div className="chat-room-info-content">
            <b>{messageInfo(props.singleChatDataProps)}</b>
        </div>
    </div>
  );
}

export default ChatRoomChatInfo;
