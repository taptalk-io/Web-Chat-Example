import React, { useEffect, useState } from 'react';
import './ChatRoom.scss';
import ChatRoomHeader from './chatRoomHeader/ChatRoomHeader';
import ChatRoomNoChat from './chatRoomNoChat/ChatRoomNoChat';
import ChatRoomMain from './chatRoomMain/ChatRoomMain';
// import ChatRoomStartChat from './chatRoomMain/chatRoomStartChat/ChatRoomStartChat';
import { connect } from 'react-redux';

var ChatRoom = (props) => {
  // const [startNewChat] = useState(false);
  let [chatRoomDataForHeader, setchatRoomDataForHeader] = useState(null);

  useEffect(() => {
    setchatRoomDataForHeader(null);
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [props.activeRoom])

  let runSetChatRoomDataForHeader = (data) => {
    setchatRoomDataForHeader(data)
  }

  return (
    <div className={`chat-room-wrapper ${props.activeRoom !== null ? "active-chat-room" : ""}`}>
        {props.activeRoom === null ? 
          <ChatRoomNoChat />
          :
          <React.Fragment>
            <ChatRoomHeader listenerStartTypingProps={props.listenerStartTypingProps}
                            listenerStopTypingProps={props.listenerStopTypingProps}
                            listenerUserOnlineProps={props.listenerUserOnlineProps}
                            messageListenerNewMessageProps={props.messageListenerNewMessageProps}
                            chatRoomDataForHeader={chatRoomDataForHeader}
            />

            {/* {startNewChat ? 
              <ChatRoomStartChat />
              : */}
              <ChatRoomMain messageListenerNewMessageProps={props.messageListenerNewMessageProps}
                            messageListenerUpdateMessageProps={props.messageListenerUpdateMessageProps}
                            deleteLocalChatRoomProps={props.deleteLocalChatRoomProps}
                            setNewEmitMessageProps={props.setNewEmitMessageProps}
                            runSetChatRoomDataForHeader={runSetChatRoomDataForHeader}
              /> 
            {/* } */}
          </React.Fragment>
        }
    </div>
  );
}


const mapStateToProps = state => ({
  activeRoom: state.activeRoom
});

export default connect(mapStateToProps, null)(ChatRoom);
