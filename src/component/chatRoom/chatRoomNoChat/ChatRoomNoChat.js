import React from 'react';
import './ChatRoomNoChat.scss';
import { GoInfo } from 'react-icons/go';

var ChatRoomNoChat = () => {
  return (
    <div className="chat-room-no-chat-container">
        <div className="no-chat-container">
            <div className="no-chat-content">
                <GoInfo />
                <b>This is where your chat room will be displayed once you create one</b>
            </div>
        </div>
    </div>
  );
}

export default ChatRoomNoChat;
