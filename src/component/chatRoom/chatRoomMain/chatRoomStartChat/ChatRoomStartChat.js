import React from 'react';
import './ChatRoomStartChat.scss';
import Pelangi from '../../../../assets/img/pelangi.jpg';
import Helper from '../../../../helper/Helper';
import ChatRoomInputMessage from '../chatRoomInputMessage/ChatRoomInputMessage';

var ChatRoomStartChat = () => {
  return (
    <React.Fragment>
        <div className="chat-room-start-chat-wrapper">
            <div className="new-chat-avatar">
                <div className="new-chat-avatar-content">
                    <img src={Pelangi} alt="" />
                </div>
                <div className="new-chat-avatar-content">
                    <div className="avatar-word-wrapper">
                        <b>{Helper.renderUserAvatarWord("Bernama Sabur Bernie", false)}</b>
                    </div>
                </div>
            </div>

            <b>Start a conversation with Helena</b>
            <p>Say hello to Helena and start a conversation</p>
        </div>

        <ChatRoomInputMessage />
    </React.Fragment>
  );
}

export default ChatRoomStartChat;
