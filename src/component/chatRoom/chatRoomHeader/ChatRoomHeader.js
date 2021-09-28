import React, { useState, useEffect } from 'react';
import './ChatRoomHeader.scss';
import { Modal, ModalBody } from "reactstrap";
import Helper from '../../../helper/Helper';
import { taptalk, tapCoreChatRoomManager, tapCoreContactManager } from '@taptalk.io/web-sdk';
import ChatRoomHeaderInfoModal from './chatRoomHeaderInfoModal/ChatRoomHeaderInfoModal';
import ChatRoomAddBlockContact from '../chatRoomAddBlockContact/ChatRoomAddBlockContact';
import { clearActiveRoom } from '../../../redux/actions/reduxActionActiveRoom';
import { setParticipantList, clearParticipantList } from '../../../redux/actions/reduxActionParticipantList';
import { setMentionUsername, clearMentionUsername } from '../../../redux/actions/reduxActionMentionUsername';
import { setBlockingAddBlockContact } from '../../../redux/actions/reduxActionBlockingAddBlockContact';
import { clearUserClick } from '../../../redux/actions/reduxActionUserClick';
import { IoIosArrowBack } from 'react-icons/io';
import { connect } from 'react-redux';

var ChatRoomHeader = (props) => {
  // let [isShowAddToContact, setIsShowAddToContact] = useState(false);
  let [roomData, setRoomData] = useState(null);
  let [isActive, setIsActive] = useState(false);
  let [isTyping, setIsTyping] = useState([]);
  let [toggleRoomInfoModal, setToggleRoomInfoModal] = useState(false);

  let [noLongerParticipant, setNoLongerParticipant] = useState(false);
  let [mentionUsernameTemp, setMentionUsernameTemp] = useState(false);
  let [showLoadingFetchUser, setIsShowLoadingFetchUser] = useState(false);
  let [temporaryLastSeen, setTemporaryLastSeen] = useState(false); 
  let [lastSeenText, setLastSeenText] = useState("");
  let[intervalLastSeen, setIntervalLastSeen] = useState();
  // let intervalLastSeen = false;

  let runLastSeen = (_roomData) => {
    let lastOnline;
    let myAccountID = taptalk.getTaptalkActiveUser().userID;
    let participantIndex = _roomData.participants.findIndex(val => val.userID !== myAccountID);
    let otherParticipant = _roomData.participants[participantIndex];

    if(otherParticipant.isOnline) {
      lastOnline = {
        isActive: true,
        lastOnline: false
      }
    }else {
      lastOnline = {
        isActive: false,
        lastOnline: otherParticipant.lastActivity
      }
    }

    return lastOnline;
  }

  useEffect(() => {
    if(temporaryLastSeen) {
      if(temporaryLastSeen.activeRoom.roomID === props.activeRoom.roomID) {
        let _lastSeen = runLastSeen(temporaryLastSeen.roomData);
        if(_lastSeen.isActive) {
          setIsActive(true)
        }else {
          setLastSeenText(Helper.getLastActivityString(_lastSeen.lastOnline));
          
          let handler = setInterval(() => {
            setLastSeenText(Helper.getLastActivityString(_lastSeen.lastOnline));
          }, 60000)

          setIntervalLastSeen(handler);
          return () => clearInterval(handler);
        }
      }
    }

    return () => clearInterval(intervalLastSeen);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [temporaryLastSeen])

  useEffect(() => {
    if(roomData !== null) {
      if(roomData.room.type === 1) {
        setTemporaryLastSeen({
          activeRoom: props.activeRoom,
          roomData: roomData,
          time: new Date().valueOf()
        })

        //check contact
        let myAccountID = taptalk.getTaptalkActiveUser().userID;
        let participantIndex = roomData.participants.findIndex(val => val.userID !== myAccountID);
        let otherParticipant = roomData.participants[participantIndex];

        let checkIsContactExist = () => {
          let findIndex = props.userContactsNoGroup.findIndex(val => val.user.userID === otherParticipant.userID);
          
          
          return findIndex !== -1;
        }

        if(!checkIsContactExist() && !props.blockingAddBlockContact.dismiss[otherParticipant.userID]) {
          let _blockingAddBlockContact = {...props.blockingAddBlockContact};
          _blockingAddBlockContact.isShow = true;
          _blockingAddBlockContact.user = otherParticipant;
          props.setBlockingAddBlockContact(_blockingAddBlockContact)
        }
        //check contact
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [roomData])

  useEffect(() => {
    if(props.userClick) {
      // if(props.userClick.room !== 2) {
      //   toggleRoomInfoModalAction();
      // }else {
        setMentionUsernameTemp({
          time: new Date(),
          username: props.userClick
        })
      // }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [props.userClick])

  useEffect(() => {
    if(!toggleRoomInfoModal) {
      props.clearUserClick();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [toggleRoomInfoModal])

  let toggleShowLoadingFetchUser = () => {
    setIsShowLoadingFetchUser(!showLoadingFetchUser)
  }

  useEffect(() => {
    let runThis = async () => {
      if(mentionUsernameTemp.time) {
        let myUserName =  taptalk.getTaptalkActiveUser().username;
        let username = mentionUsernameTemp.username;

        if(username !== myUserName) {
          let indexParticipant = roomData.participants.findIndex(val => val.username === username);
          let runGoToMention = (username, userData = false) => {
            props.setMentionUsername({
              username: username,
              userData: userData
            });

            toggleRoomInfoModalAction();  
          }
          
          if(indexParticipant !== -1) {
            runGoToMention(username);
          }else {
            // if not found
            toggleShowLoadingFetchUser();

            tapCoreContactManager.getUserByUsername(username, true, {
              onSuccess : (response) => {
                setIsShowLoadingFetchUser(false);
                runGoToMention(response.user.username, response.user);
              },
      
              onError : (errorCode, errorMessage) => {
                setIsShowLoadingFetchUser(false);
                Helper.doToast(errorMessage, "fail");
                // setLoadingSearchContact(false);
                console.log(errorCode, errorMessage);
              }
            })
          }
        }
      }    
    }
    
    runThis();
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [mentionUsernameTemp]);

  useEffect(() => {
    let runThisFirst = async () => {
      // setIsShowAddToContact(false)
      props.clearParticipantList();
      setIsTyping([]);
      setRoomData(null);
      getRoomData();
      setNoLongerParticipant(false);

      //mention click
      window.clickMention = (username) => {
        setMentionUsernameTemp({
          time: new Date(),
          username: username
        })
      }
      //mention click
    }
    runThisFirst();

    clearInterval(intervalLastSeen)
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [props.activeRoom]);

  useEffect(() => {
    if(props.listenerStartTypingProps !== null) {
      if(props.activeRoom.roomID === props.listenerStartTypingProps.roomID) {
        setIsTyping(isTyping => [...isTyping, props.listenerStartTypingProps.user]);
      }
    } 
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [props.listenerStartTypingProps])

  useEffect(() => {
    if(props.listenerStopTypingProps !== null) {
      if(props.activeRoom.roomID === props.listenerStopTypingProps.roomID) {
        setIsTyping(isTyping => isTyping.filter(value => value.userID !== props.listenerStopTypingProps.user.userID));
      }
    } 
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [props.listenerStopTypingProps])

  useEffect(() => {
    let splitRoomID = props.activeRoom.roomID.split("-");
    let participantID = splitRoomID[0] === taptalk.getTaptalkActiveUser().userID ? splitRoomID[1] : splitRoomID[0];

    if(props.listenerUserOnlineProps !== null) {
      if(participantID === props.listenerUserOnlineProps.user.userID) {
        if(props.listenerUserOnlineProps.isOnline) {
          setIsActive(true);

        }else {
          setIsActive(false);
        }
      }
    } 
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [props.listenerUserOnlineProps])

  useEffect(() => {
    let runThisListener = async () => {
      if(props.messageListenerNewMessageProps !== null) {
        if(props.messageListenerNewMessageProps.type === 9001) {
          getRoomData();
          //disabled header avatar click
          if(
              props.messageListenerNewMessageProps.room.roomID === props.activeRoom.roomID &&
              props.messageListenerNewMessageProps.action === "room/delete"
          ) {
            setNoLongerParticipant(true);
          }
    
          if(
              props.messageListenerNewMessageProps.room.roomID === props.activeRoom.roomID &&
              props.messageListenerNewMessageProps.action === "room/leave" &&
              props.messageListenerNewMessageProps.user.userID === taptalk.getTaptalkActiveUser().userID
          ) {
            setNoLongerParticipant(true);
          }
    
          if(
              props.messageListenerNewMessageProps.room.roomID === props.activeRoom.roomID &&
              props.messageListenerNewMessageProps.action === "room/removeParticipant" &&
              props.messageListenerNewMessageProps.target.targetID === taptalk.getTaptalkActiveUser().userID
          ) {
            setNoLongerParticipant(true);
          }
        }
      }
    }

    runThisListener();
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [props.messageListenerNewMessageProps])
  
  let getRoomData = async () => {
    tapCoreChatRoomManager.getGroupChatRoom(props.activeRoom.roomID, {
      onSuccess: (response) => {
        setRoomData(response);

        // if(response.room.type === 2) {
          let myAccountID = taptalk.getTaptalkActiveUser().userID;

          props.setParticipantList(
            response.participants.filter((arr) => {
              return arr.userID !== myAccountID
            })
          )
        // }
      
        // if(props.activeRoom.type === 1) {
        //   let participants = response.participants;
        //   let splitRoomID = props.activeRoom.roomID.split("-");
        //   let participantID = splitRoomID[0] === taptalk.getTaptalkActiveUser().userID ? splitRoomID[1] : splitRoomID[0];
        //   let participantIndex = participants.findIndex(value => value.userID === participantID);
        //   setIsActive(participants[participantIndex].isOnline);
        // }
      },

      onError: (errorCode, errorMessage) => {
          setNoLongerParticipant(true);
          console.log(errorCode, errorMessage);
      }
    })
  }

  let toggleRoomInfoModalAction = () => {
    if(!noLongerParticipant) {
      setToggleRoomInfoModal(!toggleRoomInfoModal);
    }
  }

  let modalFetchUser = () =>{
    return (
      <Modal isOpen={showLoadingFetchUser} className="modal-fetch-user">
        <ModalBody>
          <div className="lds-ring">
            <div /><div /><div /><div />
          </div>
          <p>
            <b>Fetch User Data</b>
          </p>
        </ModalBody>
      </Modal>
    )
  }

  return (
    <div className="chat-room-header-container">
        {props.blockingAddBlockContact.isShow &&
          <ChatRoomAddBlockContact {...props} roomData={roomData} />
        }

        {modalFetchUser()}
        <div className="chat-room-identifier">
            <IoIosArrowBack 
              className="arrow-back-chat-room" 
              onClick={() => setTimeout(props.clearActiveRoom(), 500)}
            />

            <p>
              <b>{props.activeRoom.name}</b>
            </p>
            <br />

            {roomData &&
              (isTyping.length > 0 ?
                  props.activeRoom.type === 1 ?
                    <div className={`connectivity-status`}>
                      Typing<span className="typing-dot-one">.</span><span className="typing-dot-two">.</span><span className="typing-dot-three">.</span>
                    </div>
                    :
                    isTyping.length > 1 ?
                      <div className={`connectivity-status`}>
                        {isTyping.length} peoples typing<span className="typing-dot-one">.</span><span className="typing-dot-two">.</span><span className="typing-dot-three">.</span>
                      </div>
                      :
                      <div className={`connectivity-status`}>
                        {isTyping[0].fullname} is typing<span className="typing-dot-one">.</span><span className="typing-dot-two">.</span><span className="typing-dot-three">.</span>
                      </div>
                  :
                  props.activeRoom.type === 2 ?
                    <div className={`connectivity-status ${isActive ? "" : "status-offline"}`}>
                        {`${roomData.participants.length} Member${roomData.participants.length > 1 ? 's' : ''}`}
                    </div>
                    :
                    <div className={`connectivity-status ${isActive ? 'status-online' : 'status-offline'}`}>
                        {isActive ?
                          "Active Now"
                          :
                          // "Not Active now"
                          lastSeenText
                        }
                    </div>
              )
            }
        </div>

        {props.activeRoom.imageURL.thumbnail === "" ?
          <div className="user-avatar-name" 
               style={{background: taptalk.getRandomColor(props.activeRoom.name)}}
               onClick={() => toggleRoomInfoModalAction()}
          >
              <b>{Helper.renderUserAvatarWord(props.activeRoom.name, props.activeRoom.type === 2)}</b>
          </div>
          :
          <img src={props.activeRoom.imageURL.thumbnail} alt="" onClick={() => toggleRoomInfoModalAction()} />
        }

        <ChatRoomHeaderInfoModal 
            chatRoomDataForHeaderProps={props.chatRoomDataForHeaderProps}
            roomDataProps={roomData}
            toggleRoomInfoModalprops={toggleRoomInfoModal}
            toggleRoomInfoModalActionprops={toggleRoomInfoModalAction}
            chatRoomDataForHeader={props.chatRoomDataForHeader}
            mentionUsernameTemp={mentionUsernameTemp}
            clearMentionUsernameTemp={() => setMentionUsernameTemp(false)}
        />
    </div>
  );
}

const mapStateToProps = state => ({
  activeRoom: state.activeRoom,
  userClick: state.userClick,
  blockingAddBlockContact: state.blockingAddBlockContact,
  userContactsNoGroup: state.userContactsNoGroup
});

const mapDispatchToProps = {
  setParticipantList,
  clearParticipantList,
  setMentionUsername,
  clearMentionUsername,
  clearActiveRoom,
  clearUserClick,
  setBlockingAddBlockContact
}

export default connect(mapStateToProps, mapDispatchToProps)(ChatRoomHeader);
