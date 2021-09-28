import React from 'react';
import './RoomListNoChat.scss';

var RoomListNoChat = () => {
  return (
    <div className="room-list-no-chat-container">
        <b>
            No chats to show
        </b>

        <p>
            It seems like you don’t have any chats to show, but don’t worry! Your chat list will grow once you
        </p>

        <b>
            Start a new chat
        </b>
    </div>
  );
}

export default RoomListNoChat;
