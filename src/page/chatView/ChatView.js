import React, { useState, useEffect } from 'react';
import 'react-toastify/dist/ReactToastify.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import './ChatView.scss';
import RoomList from '../../component/roomList/RoomList';
import ChatRoom from '../../component/chatRoom/ChatRoom';
import { connect } from 'react-redux';
import { setActiveRoom } from '../../redux/actions/reduxActionActiveRoom';
import { clearReplyMessage } from '../../redux/actions/reduxActionReplyMessage';
import { clearForwardMessage } from '../../redux/actions/reduxActionForwardMessage';
import { setUserContacts } from '../../redux/actions/reduxActionUserContacts';
import { setUserContactsNoGroup } from '../../redux/actions/reduxActionUserContactsNoGroup';
import { taptalk, tapCoreContactManager, tapCoreChatRoomManager } from '@taptalk.io/web-sdk';
import Helper from '../../helper/Helper';
import HelperChat from '../../helper/HelperChat';

const CONNECTING_STATUS = {
  disconnected: 1,
  loading: 2,
  connected: 3
};

const SETUP_ROOM_MODAL_STATUS = {
  loading: 1,
  success: 3,
  fail: 4
}

var ChatView = (props) => {
  let [setupModalView, setSetupModalView] = useState(SETUP_ROOM_MODAL_STATUS.loading);
  let [messageListenerNewMessage, setMessageListenerNewMessage] = useState(null);
  let [messageListenerUpdateMessage, setMessageListenerUpdateMessage] = useState(null);
  let [listenerStartTyping, setListenerStartTyping] = useState(null);
  let [listenerStopTyping, setListenerStopTyping] = useState(null);
  let [listenerUserOnline, setListenerUserOnline] = useState(null);
  let [forceRefreshRoom, setForceRefreshRoom] = useState(false);
  let [connectingStatus, setConnectingStatus] = useState(CONNECTING_STATUS.loading);
  let [newEmitMessage, setNewEmitMessage] = useState(null);
  
  useEffect(() => {
    if(!taptalk.isAuthenticated()) {
      props.history.push('/login')
    }else {
      window.addEventListener('offline', function (event) {
        setConnectingStatus(CONNECTING_STATUS.disconnected);
        taptalk.disconnect();
      });
    
      window.addEventListener('online', function (event) {
        connect(true);
      });
      
      connect();
      getAllContact();
      onExpiredTokenListener();
    }

    //notif
    const isFirefox = typeof InstallTrigger !== 'undefined';
    
    if ('Notification' in window) {
      if (!isFirefox && Notification.permission !== 'denied') {
        Notification.requestPermission()
      }

      const onBodyClick = () => {
        if (isFirefox && Notification.permission !== 'denied') {
          Notification.requestPermission()
        }
      }

      document.body.addEventListener('click', onBodyClick);

      if (Notification.permission === 'granted' || Notification.permission === 'denied') {
        document.body.removeEventListener('click', onBodyClick);
      };
    }
    //notif
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [])

  let connect = (isInternetBackOnline = false) => {
    setConnectingStatus(CONNECTING_STATUS.loading);

    taptalk.connect({
      onSuccess: (successMessage) => {
        setTimeout(() => {
          setSetupModalView(SETUP_ROOM_MODAL_STATUS.success);
        }, 1000);

        setConnectingStatus(CONNECTING_STATUS.connected);
        console.log(successMessage)
      },
      onError: (errorMessage) => {
        setTimeout(() => {
          setSetupModalView(SETUP_ROOM_MODAL_STATUS.fail);
          Helper.doToast(errorMessage, 'fail');
        }, 1000);

        setConnectingStatus(CONNECTING_STATUS.disconnected);
        console.log(errorMessage);
      },
      onClose: (message) => {
        console.log(message);
        setConnectingStatus(CONNECTING_STATUS.disconnected);

        if (navigator.onLine && !isInternetBackOnline) {
          connect();
        }
      }
    });
  }

  let onExpiredTokenListener = () => {
    taptalk.addTapListener({
      onTapTalkRefreshTokenExpired: () => {
        Helper.forceLogout();
      }
    })
  }

  useEffect(() => {
    setTimeout(function(){
      messageListenerChatRoom();
      roomStatusListener();
    }, 0);
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, []);

  let messageListenerChatRoom =  () => {
    tapCoreChatRoomManager.addMessageListener(
      {
        onReceiveNewMessage: (messageModel) => {
          // console.log("on receive new message 1", messageModel);
          setMessageListenerNewMessage(messageModel);
        },

        onReceiveUpdateMessage: (messageModel) => {
          // console.log("on receive update message 1", messageModel);
          setMessageListenerUpdateMessage(messageModel); 
        },
      }
    )
  }

  let roomStatusListener = () => {    
    tapCoreChatRoomManager.addRoomStatusListener(
      {
        onReceiveStartTyping: (roomID, user) => {
          // console.log("on receive onReceiveStartTyping2", roomID, user);
          setListenerStartTyping({roomID: roomID, user: user});
        },

        onReceiveStopTyping: (roomID, user) => {
          // console.log("on receive onReceiveStopTyping", roomID, user);
          setListenerStopTyping({roomID: roomID, user: user});
        },

        onReceiveOnlineStatus: (user, isOnline, lastActive) => {
          // console.log("on receiveonReceiveOnlineStatus", user, isOnline, lastActive);
          setListenerUserOnline({user: user, isOnline: isOnline, lastActive:lastActive});
        }
      }
    )
  };

  let onClickRoomList = async (valChatData) => {
    tapCoreChatRoomManager.sendStopTypingEmit(props.activeRoom);
    props.clearReplyMessage();
    props.clearForwardMessage();
    HelperChat.resetChatRoomHeightAndInputText();
    props.setActiveRoom(valChatData.room);
  }

  let getAllContact = async () => {
    tapCoreContactManager.getAllUserContacts({
     onSuccess: (response) => {
        props.setUserContactsNoGroup(response)
        let newContactGroup = {};
        
        response.map((value) => {
          let alphabetGroupName = value.user.fullname[0].toUpperCase();
          if(newContactGroup[alphabetGroupName] === undefined) {
              newContactGroup[alphabetGroupName] = [];
              newContactGroup[alphabetGroupName].push(value);
          }else {
              newContactGroup[alphabetGroupName].push(value);
          }
          
          props.setUserContacts(newContactGroup);
          return null;
        })
     },

     onError: (errorCode, errorMessage) => {
      if((errorCode >= 40103) && (errorCode <= 40106)) {
        Helper.forceLogout();
      }
     }
    })
  }

  let undoForceRefreshRoom = () => {
    setForceRefreshRoom(false);
  }

  let deleteLocalChatRoom = () => {
    tapCoreChatRoomManager.deleteMessageByRoomID(props.activeRoom.roomID);
    props.setActiveRoom(null);
    setForceRefreshRoom(true);
  }

  let setNewEmitMessageAction = (message) => {
    //update room list last message before getting new message emit
    setNewEmitMessage(message);
  }
  
  if(taptalk.isAuthenticated()) {
    return (
      <div className="chat-view-container">
        <RoomList setupModal={setupModalView} 
                  onClickRoomListProps={onClickRoomList}
                  messageListenerNewMessageProps={messageListenerNewMessage}
                  messageListenerUpdateMessageProps={messageListenerUpdateMessage} 
                  forceRefreshRoomProps={forceRefreshRoom}
                  undoForceRefreshRoomProps={undoForceRefreshRoom}
                  connectingStatusProps={connectingStatus}
                  newEmitMessageProps={newEmitMessage}
        />
        
        {setupModalView === SETUP_ROOM_MODAL_STATUS.success &&
          <ChatRoom messageListenerNewMessageProps={messageListenerNewMessage}
                    messageListenerUpdateMessageProps={messageListenerUpdateMessage} 
                    listenerStartTypingProps={listenerStartTyping}
                    listenerStopTypingProps={listenerStopTyping}
                    listenerUserOnlineProps={listenerUserOnline}
                    setNewEmitMessageProps={setNewEmitMessageAction}
                    deleteLocalChatRoomProps={deleteLocalChatRoom}
          />
        }
      </div>
    );
  }else {
    return ""
  }
}

const mapStateToProps = state => ({
  activeRoom: state.activeRoom,
  userContacts: state.userContacts
});

const mapDispatchToProps = {
  setActiveRoom,
  clearReplyMessage,
  clearForwardMessage,
  setUserContacts,
  setUserContactsNoGroup
};

export default connect(mapStateToProps, mapDispatchToProps)(ChatView);
