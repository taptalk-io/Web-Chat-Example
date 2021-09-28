import React, { useState, useEffect, useRef } from 'react';
import './ChatRoomMain.scss';
import { Modal, ModalBody } from 'reactstrap';
import { FiUpload, FiCopy, FiTrash } from "react-icons/fi";
import { FaReply } from 'react-icons/fa';
import MediaQuery from 'react-responsive';
// import ChatRoomNewContact from './chatRoomNewContact/ChatRoomNewContact';
import ChatRoomChatInfo from './chatRoomChatInfo/ChatRoomChatInfo';
import ChatRoomMessageIn from './chatRoomMessageIn/ChatRoomMessageIn';
import ChatRoomMessageInFile from './chatRoomMessageInFile/ChatRoomMessageInFile';
import ChatRoomMessageInImage from './chatRoomMessageInImage/ChatRoomMessageInImage';
import ChatRoomMessageInVideo from './chatRoomMessageInVideo/ChatRoomMessageInVideo';
import ChatRoomMessageInLocation from './chatRoomMessageInLocation/ChatRoomMessageInLocation';
import ChatRoomMessageOut from './chatRoomMessageOut/ChatRoomMessageOut';
import ChatRoomMessageOutFile from './chatRoomMessageOutFile/ChatRoomMessageOutFile';
import ChatRoomMessageOutImage from './chatRoomMessageOutImage/ChatRoomMessageOutImage';
import ChatRoomMessageOutVideo from './chatRoomMessageOutVideo/ChatRoomMessageOutVideo';
import ChatRoomMessageOutLocation from './chatRoomMessageOutLocation/ChatRoomMessageOutLocation';
import ChatRoomInputMessage from './chatRoomInputMessage/ChatRoomInputMessage';
import ChatRoomSelectForward from '../chatRoomSelectForward/ChatRoomSelectForward';
// import { Scrollbars } from 'react-custom-scrollbars';
import { taptalk, tapCoreMessageManager, tapCoreChatRoomManager } from '@taptalk.io/web-sdk';
import { setActiveRoom } from '../../../redux/actions/reduxActionActiveRoom';
import { clearGoToChatBubble } from '../../../redux/actions/reduxActionGoToChatBubble';
import { setReplyMessage, clearReplyMessage } from '../../../redux/actions/reduxActionReplyMessage';
import { setForwardMessage, clearForwardMessage } from '../../../redux/actions/reduxActionForwardMessage';
import { clearActiveMessage } from '../../../redux/actions/reduxActionActiveMessage';
import { connect } from 'react-redux';
import Helper from "../../../helper/Helper";
import HelperChat from "../../../helper/HelperChat";
import WebWorker from "../../../helper/HelperWebWorker";
import iconClock from '../../../assets/img/icon-clock.png';

const CHAT_TYPE = {
  TAPChatMessageTypeText : 1001,
  TAPChatMessageTypeImage : 1002,
  TAPChatMessageTypeVideo : 1003,
  TAPChatMessageTypeFile : 1004,
  TAPChatMessageTypeLocation : 1005,
  TAPChatMessageTypeContact : 1006,
  TAPChatMessageTypeSticker : 1007,
  TAPChatMessageTypeSystemMessage : 9001,
  TAPChatMessageTypeUnreadMessageIdentifier : 9002
}

// var style = {
//     scrollStyle: {
//       position: "relative",
//       backgroundColor: "#ff7d00",
//       right: "-2px",
//       width: "5px",
//       borderRadius: "8px"
//     }
// };

var ChatRoomMain = (props) => {
  let [chatDataRoomMain, setChatDataRoomMain] = useState([]);
  let [chatDataRoomMainTemp, setChatDataRoomMainTemp] = useState(false);
  let [isLoadingChat, setIsLoadingChat] = useState(false);
  let chatRoomMesageListRef = useRef("messageLists");

  let [roomIsDeleted, setRoomIsDeleted] = useState(false);

  let [isNoLongerParticipant, setIsNoLongerParticipant] = useState(false);
  let [isShowLoadingBlocking, setIsShowLoadingBlocking] = useState(false);

  let [fileUploadProgress, setFileUploadProgress] = useState({});

  let [hasMoreChatBefore, setHasMoreChatBefore] = useState(false);

  let [showDropFileHere, setShowDropFileHere] = useState(false);
  let [lastDragAndDropFiles, setLastDragAndDropFiles] = useState({
    files: [],
    time: ""
  });

  let [showBlockingChatFirst, setShowBlockingChatFirst] = useState(true);
  let [mentionList, setMentionList] = useState({});
  let [webWorkerMentionList, setWebWorkerMentionList] = useState(null);
  let [webWorkerMyMentionCounter, setWebWorkerMyMentionCounter] = useState(null);
  let [myMentionCounter, setMyMentionCounter] = useState({});
  let [myMentionCounterTemp, setMyMentionCounterTemp] = useState(false);
  let [isShowModalForward, setIsShowModalForward] = useState(false);
  let [openModalActionMessage, setOpenModalActionMessage] = useState(false);

  let toggleModalActionMessage = () => {
    setOpenModalActionMessage(!openModalActionMessage);
  }

  let toggleModalForward = async (isSelect = false) => {
    HelperChat.resetChatRoomHeightAndInputText();
    !isSelect && props.clearForwardMessage();
    setIsShowModalForward(!isShowModalForward);
  }

  let reverseMessagesObject = (object) => {
    var newObject = {};
    var keys = [];

    for (var key in object) {
        keys.push(key);
    }

    for (var i = keys.length - 1; i >= 0; i--) {
      var value = object[keys[i]];
      newObject[keys[i]]= value;
    }       

    return newObject;
  }

  useEffect(() => {
    if(props.activeMessage) {
      toggleModalActionMessage();
    }else {
      setOpenModalActionMessage(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [props.activeMessage])

  //set webworker
  useEffect(() => {
    setWebWorkerMentionList(
      new WebWorker(() => {
        // eslint-disable-next-line no-restricted-globals
        self.addEventListener('message', function(e) {
          let { chatDataRoomMain, activeRoom, chatType } = e.data;
          let hashmap = {};
          
          let updateMessageMentionIndexes = (message) => {
            let originalText;
            if (message.type === chatType.TAPChatMessageTypeText) {
                originalText = message.body;
            } else if ((message.type === chatType.TAPChatMessageTypeImage || message.type === chatType.TAPChatMessageTypeVideo) && null !== message.data) {
                originalText = message.data.caption;
            } else if (message.type === chatType.TAPChatMessageTypeLocation && null !== message.data) {
                originalText = message.data.address;
            } else {
                return false;
            }
            if (null == originalText) {
                return false;
            }
            let mentionIndexes = [];
            
            if (originalText.includes("@")) {
                let length = originalText.length;
                let startIndex = -1;
                for (let i = 0; i < length; i++) {
                    if (originalText.charAt(i) === '@' && startIndex === -1) {
                        // Set index of @ (mention start index)
                        startIndex = i;
                    } else {
                        let endOfMention = originalText.charAt(i) === ' ' || originalText.charAt(i) === '\n';
    
                        if (i === (length - 1) && startIndex !== -1) {
                            let endIndex = endOfMention ? i : (i + 1);
                            if (endIndex > (startIndex + 1)) {
                                mentionIndexes.push(startIndex);
                                mentionIndexes.push(endIndex);
                            }
                            startIndex = -1;
                        } else if (endOfMention && startIndex !== -1) {
                            // End index for mentioned username
                            //String username = originalText.substring(startIndex + 1, i);
                            //if (vm.getRoomParticipantsByUsername().includesKey(username)) {
                            if (i > (startIndex + 1)) {
                                mentionIndexes.push(startIndex);
                                mentionIndexes.push(i);
                            }
                            //}
                            startIndex = -1;
                        }
                    }
                }
                if (mentionIndexes.length > 0) {
                    return {
                        localID: [message.localID],
                        mentionIndex: mentionIndexes
                    }
                }else {
                    return false;
                }
            }
          }
        
          Object.keys(chatDataRoomMain).map((val) => {
            let result = updateMessageMentionIndexes(chatDataRoomMain[val], activeRoom);

            if(result) {
              hashmap[result.localID] = result.mentionIndex;
            }
            
            return null;
          })
          
          // eslint-disable-next-line no-restricted-globals
          self.postMessage({
            data: {
              activeRoom: activeRoom,
              mentionList: hashmap
            }
          })
        })
      })
    )
    //mentionList

    setWebWorkerMyMentionCounter(
      new WebWorker(() => {
        // eslint-disable-next-line no-restricted-globals
        self.addEventListener('message', function(e) {
          let { chatDataRoomMain, activeRoom, chatType, activeUser } = e.data;
          let hashmap = {};

          let isActiveUserMentioned = (message) => {
            if (message.user.username === activeUser.username ||
                (message.type !== chatType.TAPChatMessageTypeText && message.type !== chatType.TAPChatMessageTypeImage && message.type !== chatType.TAPChatMessageTypeVideo) ||
                activeUser === null ||
                message.isRead
            ) {
                return false;
            }
            
            let text = message.body;
            if (null === text || text === "") {
                return false;
            }

            return (
              text.includes(" @" + activeUser.username + " ") ||
              text.includes(" @" + activeUser.username + "\n") ||
              (text.includes(" @" + activeUser.username) && text.endsWith(activeUser.username)) ||
              text.includes("\n@" + activeUser.username + " ") ||
              text.includes("\n@" + activeUser.username + "\n") ||
              (text.includes("\n@" + activeUser.username) && text.endsWith(activeUser.username)) ||
              text.startsWith("@" + activeUser.username) && text.includes("@" + activeUser.username + " ") ||
              text.startsWith("@" + activeUser.username) && text.includes("@" + activeUser.username + "\n") ||
              text === "@" + activeUser.username
            );
          }
          
          Object.keys(chatDataRoomMain).map((val) => {
            let result = isActiveUserMentioned(chatDataRoomMain[val]);
            
            if(result) {
              hashmap[chatDataRoomMain[val].localID] = chatDataRoomMain[val];
            }
            
            return null;
          })
          
          // eslint-disable-next-line no-restricted-globals
          self.postMessage({
            data: {
              activeRoom: activeRoom,
              myMentionCounter: hashmap
            }
          })
        })
      })
    )
    //myMentionCounter
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    let runWebWorkerMentionList = async () => {
      if(webWorkerMentionList !== null) {
        webWorkerMentionList.addEventListener('message', (e) => {
          let { data } = e.data;
          setMentionList(data.mentionList);
        })
      }
    } 

    runWebWorkerMentionList();
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [webWorkerMentionList])

  useEffect(() => {
    let runWebWorkerMyMentionCounter = async () => {
      if(webWorkerMyMentionCounter !== null) {
        webWorkerMyMentionCounter.addEventListener('message', (e) => {
          let { data } = e.data;
          if(Object.keys(data.myMentionCounter).length > 0) {
            setMyMentionCounterTemp({
              time: new Date(),
              list: data.myMentionCounter,
              room: data.activeRoom
            })
          }
        })
      }
    }

    runWebWorkerMyMentionCounter();
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [webWorkerMyMentionCounter])
  //set webworker

  useEffect(() => {
    let runWebWorkerMyMentionCounterTemp = async () => {
      if(myMentionCounterTemp) {
        if(props.activeRoom.roomID === myMentionCounterTemp.room.roomID) {
          setMyMentionCounter(myMentionCounterTemp.list);
        }
      }
    }

    runWebWorkerMyMentionCounterTemp();
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [myMentionCounterTemp])

  useEffect(() => {
    let runFileUploadProgress = async () => {
      let _fileUploadProgress = {...fileUploadProgress};

      if(Object.keys(_fileUploadProgress).length > 0) {
        let _localID = Object.keys(_fileUploadProgress)[0];
        let _chatDataRoomMain = {...chatDataRoomMain};
        
        if(_fileUploadProgress[_localID].message !== null) {
          _chatDataRoomMain[_fileUploadProgress[_localID].message.localID] = _fileUploadProgress[_localID].message;
          props.runSetChatRoomDataForHeader(_chatDataRoomMain);
          setChatDataRoomMain(_chatDataRoomMain);
          scrollChatViewToBottom();
        }else {
          if(_chatDataRoomMain[_localID]) {
            _chatDataRoomMain[_localID].bytesUpload = _fileUploadProgress[_localID].bytes;
            _chatDataRoomMain[_localID].percentageUpload = _fileUploadProgress[_localID].percentage;
            props.runSetChatRoomDataForHeader(_chatDataRoomMain);
            setChatDataRoomMain(_chatDataRoomMain);
          }
        }

        setFileUploadProgress({});
      }
    }

    runFileUploadProgress();
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [fileUploadProgress])
  
  useEffect(() => {
    let runFirst = async () => {
      let chatData = tapCoreChatRoomManager.getCurrentChatInRoom(props.activeRoom.roomID);

      setShowBlockingChatFirst(true);
      
      if(Object.keys({...chatData}).length > 0) {
        Object.keys(chatData).map((value) => {
          if(!chatData[value].isHidden) {
            setShowBlockingChatFirst(false);
            return null;
          }

          return null;
        })
      }

      setMyMentionCounter({});
      props.runSetChatRoomDataForHeader(chatData);
      setChatDataRoomMain(reverseMessagesObject(chatData));
      setRoomIsDeleted(false);
      setIsNoLongerParticipant(false);
  
      setTimeout(function() {
        if(props.activeRoom !== null) { 
          getMessageAfter();
        }
      }, 0);
  
      setIsNoLongerParticipant(false);
    }

    runFirst();

    let onlineCallbackOnChatRoom = () => {
      if(props.activeRoom !== null) {
        setTimeout(() => {
          getMessageAfter(true)
        }, 5000);
      }
    }

    window.addEventListener('online', onlineCallbackOnChatRoom);
    
    return () => {
      window.removeEventListener('online', onlineCallbackOnChatRoom);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [props.activeRoom]);

  useEffect(() => {
    let runReplyMessage = async () => {
      let _replyMessage = {...props.replyMessage};

      let elChatRoomMain = document.getElementsByClassName("chat-room-main-wrapper")[0];
      let chatRoomContainerHeight = elChatRoomMain.style.maxHeight === "" ? 108 : parseInt(elChatRoomMain.style.maxHeight.split("-")[1].replace("px", ""));
      let heightNew = 0;

      let setNewHeight = (height, isSet) => {
        heightNew = height;
        elChatRoomMain.style.setProperty("max-height", "calc(100vh - " + heightNew + "px)", "important");
        _replyMessage.setHeightChatRoom = isSet;
        props.setReplyMessage(_replyMessage);
      }
      
      if(_replyMessage.message && !_replyMessage.setHeightChatRoom) {
        setNewHeight(chatRoomContainerHeight + 68, true);
      }
    }

    runReplyMessage();
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [props.replyMessage])

  useEffect(() => {
    let runForwardMessage = async () => {
      let _forwardMessage = {...props.forwardMessage};
      let elChatRoomMain = document.getElementsByClassName("chat-room-main-wrapper")[0];
      let chatRoomContainerHeight = elChatRoomMain.style.maxHeight === "" ? 108 : parseInt(elChatRoomMain.style.maxHeight.split("-")[1].replace("px", ""));
      let heightNew = 0;
      
      let setNewHeight = (height, isSet) => {
        heightNew = height;
        elChatRoomMain.style.setProperty("max-height", "calc(100vh - " + heightNew + "px)", "important");
        _forwardMessage.setHeightChatRoom = isSet;
        props.setForwardMessage(_forwardMessage);
      }
      
      setIsShowModalForward((_forwardMessage.message && !_forwardMessage.target) ? true : false);
      if(_forwardMessage.message && !_forwardMessage.setHeightChatRoom && _forwardMessage.target) {
        setNewHeight(chatRoomContainerHeight + 68, true);
      }
    }

    runForwardMessage();
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [props.forwardMessage])

  useEffect(() => {
    let runChatDataRoomMainTemp = () => {
      if(chatDataRoomMainTemp) {
        if(chatDataRoomMainTemp.activeRoom.roomID === props.activeRoom.roomID) {
          props.runSetChatRoomDataForHeader(chatDataRoomMainTemp.chats);
          setChatDataRoomMain(chatDataRoomMainTemp.chats);

          if (chatDataRoomMainTemp.isFirstLoad) {
            scrollChatViewToBottom();
          } 
        
          if(chatDataRoomMainTemp.scrollingBackHeight) {
            setTimeout(() => {
              chatRoomMesageListRef.current.scrollTop = document.querySelectorAll(".chat-room-main-content")[0].scrollHeight - chatDataRoomMainTemp.scrollingBackHeight;
            }, 0)
          }

          if(chatDataRoomMainTemp.findLocalID) {
            if(!chatDataRoomMainTemp.chats[chatDataRoomMainTemp.findLocalID] && chatDataRoomMainTemp.hasMore) {
              getMessageBefore(false, false, chatDataRoomMainTemp.findLocalID);
            }else if(!chatDataRoomMainTemp.chats[chatDataRoomMainTemp.findLocalID] && !chatDataRoomMainTemp.hasMore) {
              setIsShowLoadingBlocking(false);
            }else {
              setTimeout(() => {
                scrollToReply(chatDataRoomMainTemp.findLocalID);
                setIsShowLoadingBlocking(false);
              }, 0)
            }
          }
        }
      }
    }

    runChatDataRoomMainTemp();
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [chatDataRoomMainTemp])

  useEffect(() => {
    // setRoomIsDeleted
    // setIsNoLongerParticipant

    let lengthChatData = Object.keys(chatDataRoomMain).length - 1;
    let lastChat = chatDataRoomMain[Object.keys(chatDataRoomMain)[lengthChatData]];

    if(
      lastChat &&
      lastChat.action === 'room/removeParticipant' &&
      lastChat.type === 9001 &&
      lastChat.target.targetID === taptalk.getTaptalkActiveUser().userID
    ) {
      // setRoomIsDeleted(true);
      setIsNoLongerParticipant(true);
      props.clearReplyMessage();
      props.clearForwardMessage();
    }else {
      setIsNoLongerParticipant(false);
    }

    if(props.goToChatBubble.localID) {
      scrollToReply(props.goToChatBubble.localID);
    }

    //mention
    let runMention = async () => {
      if(props.activeRoom.type === 2 && webWorkerMentionList !== null) {
        webWorkerMentionList.postMessage({
            activeRoom: props.activeRoom,
            chatDataRoomMain: chatDataRoomMain,
            chatType: CHAT_TYPE
        })
      }
    }

    let runMyMentionCounter = async () => {
      if(props.activeRoom.type === 2 && webWorkerMyMentionCounter !== null) {
        webWorkerMyMentionCounter.postMessage({
            activeRoom: props.activeRoom,
            chatDataRoomMain: chatDataRoomMain,
            chatType: CHAT_TYPE,
            activeUser: taptalk.getTaptalkActiveUser()
        })
      }
    }

    runMyMentionCounter();
    runMention();
    //mention
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [chatDataRoomMain]);

  useEffect(() => {
    let listenerNewMessage = props.messageListenerNewMessageProps === null ? null : props.messageListenerNewMessageProps;

    if(props.activeRoom !== null) {

      if(listenerNewMessage !== null) {
        // console.log('new', listenerNewMessage)
        if(props.activeRoom.roomID === listenerNewMessage.room.roomID) {
          let cloneChatDataRoomMain = {...chatDataRoomMain};

          if(!listenerNewMessage.isHidden) {
            setShowBlockingChatFirst(false);
          }

          if(listenerNewMessage.user.userID === taptalk.getTaptalkActiveUser().userID) {
            // room/deleted
            if(listenerNewMessage.action === "room/delete" && listenerNewMessage.type === 9001) {
              setRoomIsDeleted(true);
            }

            // room/leave
            if(listenerNewMessage.action === "room/leave" && listenerNewMessage.type === 9001) {
              props.setActiveRoom(null);
            }

            // room/removeParticipant

            // if message was from me
            cloneChatDataRoomMain[listenerNewMessage.localID] = listenerNewMessage;
            
            //imediately scrolling to bottom
            scrollChatViewToBottom();
          }else {
            //if chat was from another device
            let el = document.querySelectorAll(".chat-room-main-content")[0];
            
            if(el.scrollTop === (el.scrollHeight - el.offsetHeight)) {
              scrollChatViewToBottom();
            }
            cloneChatDataRoomMain[listenerNewMessage.localID] = listenerNewMessage;
            // unreadMessageAction({[listenerNewMessage.localID]: listenerNewMessage});
          }

          props.runSetChatRoomDataForHeader(cloneChatDataRoomMain);
          setChatDataRoomMain(cloneChatDataRoomMain);
        }
        
      }
      
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [props.messageListenerNewMessageProps]);

  useEffect(() => {
    let listenerUpdateMessage = props.messageListenerUpdateMessageProps === null ? null : props.messageListenerUpdateMessageProps;
    
    if(props.activeRoom !== null) {

      if(listenerUpdateMessage !== null) { 
        if(props.activeRoom.roomID === listenerUpdateMessage.room.roomID) {
          let cloneChatData= {...chatDataRoomMain};
          cloneChatData[listenerUpdateMessage.localID] = listenerUpdateMessage;
          props.runSetChatRoomDataForHeader(cloneChatData);
          setChatDataRoomMain(cloneChatData);
          // if(listenerUpdateMessage.isDelivered && !listenerUpdateMessage.isRead) {
          //   let cloneChatDataUndelivered = {...chatDataRoomMain};

          //   if(cloneChatDataUndelivered[listenerUpdateMessage.localID]) {
          //     cloneChatDataUndelivered[listenerUpdateMessage.localID].isDelivered = true;
          //     setChatDataRoomMain(cloneChatDataUndelivered);
          //   }
          // }

          // //set all chat data isRead to true 
          // if(listenerUpdateMessage.isRead) {
          //   let cloneChatDataUnRead = {...chatDataRoomMain};

          //   Object.keys(cloneChatDataUnRead).map(function(i) {
          //     if(!cloneChatDataUnRead[i].isRead) {
          //       cloneChatDataUnRead[i].isRead = true;
          //       setChatDataRoomMain(cloneChatDataUnRead);
          //     }

          //     return null;
          //   });
          // }
          
        }

      }

    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [props.messageListenerUpdateMessageProps]);

  let unreadMessageAction = (arrayOfMessage) => {
    let _myMentionCounter = {...myMentionCounter};
    let unreadMessageArray = [];

    Object.keys(arrayOfMessage).map(function(i) {
      if(!arrayOfMessage[i].isRead && (arrayOfMessage[i].user.userID !== taptalk.getTaptalkActiveUser().userID)) {
        unreadMessageArray.push(arrayOfMessage[i].messageID);

        if(i) {
          delete _myMentionCounter[i];
        }
      }

      return null;
    });

    setMyMentionCounter(_myMentionCounter)

    if(unreadMessageArray.length > 0) {
      tapCoreMessageManager.markMessageAsRead(unreadMessageArray);
    }
  }

  let generateNewFileUploadProgress = (localID, percentage, bytes, message = null) => {
    let newFileUploadProgress = {
      [localID]: {
        percentage: percentage,
        bytes: bytes,
        message: message
      }
    }

    return newFileUploadProgress;
  }

  let scrollChatViewToBottom = () => {
    setTimeout(function() {
      if(chatRoomMesageListRef.current !== null) {
        chatRoomMesageListRef.current.scrollTop = chatRoomMesageListRef.current.scrollHeight;
      }
    }, 0);
  }

  let onScrollListener = () => {
    let currentViewHeight = chatRoomMesageListRef.current.scrollHeight;
    if(chatRoomMesageListRef.current.scrollTop === 0 && props.activeRoom && hasMoreChatBefore) {
      getMessageBefore(false, currentViewHeight);
    }
  }

  let getMessageAfter = async (isReconnect) => {
    setTimeout(function() {
      if(!isReconnect) {
       setIsLoadingChat(true);
      }

      tapCoreMessageManager.getNewerMessagesAfterTimestamp(props.activeRoom.roomID, {
        onSuccess: (messages) => {
              setIsLoadingChat(false);
              // unreadMessageAction(messages);

              if(messages !== null) {
                // setChatDataRoomMain(reverseMessagesObject(messages));
                setChatDataRoomMainTemp({
                  chats: reverseMessagesObject({...messages}),
                  activeRoom: props.activeRoom,
                  timeStamp: new Date().valueOf()
                })
        
                if(!isReconnect) {
                  Object.keys(messages).length < 50 && getMessageBefore(true, false);
                }
                
                if(!props.goToChatBubble.localID) {
                  scrollChatViewToBottom();
                }
              }
          },
          onError: (errorCode, errorMessage) => {
              setIsLoadingChat(false);
              console.log(errorCode, errorMessage);
          }
      });
    }, isReconnect ? 0 : 100);
  }

  let getMessageBefore = async (isFirstLoad= false, scrollingBackHeight, findLocalID) => {
    let numberOfItems = 50;
    let roomID = props.activeRoom.roomID;

    if(!findLocalID) {
      setIsLoadingChat(true);
    }else {
      setIsShowLoadingBlocking(true);
    }
    
    setTimeout(function() {
      if(roomID && roomID === props.activeRoom.roomID) {
        tapCoreMessageManager.getOlderMessagesBeforeTimestamp(roomID, numberOfItems, {
          onSuccess: (messages, hasMore) => {
              if(roomID === props.activeRoom.roomID || props.activeRoom !== null ) {
                setHasMoreChatBefore(hasMore);
                setIsLoadingChat(false);
                // unreadMessageAction({...messages});
                // setChatDataRoomMain(reverseMessagesObject({...messages}));
                setChatDataRoomMainTemp({
                  chats: reverseMessagesObject({...messages}),
                  activeRoom: props.activeRoom,
                  timeStamp: new Date().valueOf(),
                  scrollingBackHeight: scrollingBackHeight,
                  findLocalID: findLocalID,
                  isFirstLoad: isFirstLoad,
                  hasMore: hasMore
                })
              }
          },
          onError: (errorCode, errorMessage) => {
              setIsLoadingChat(false);
              console.log(errorCode, errorMessage);
          }
        });
      }
    }, 100);
  }

  let isBubbleOnViewPort = async (message) => {
    unreadMessageAction({[message.localID]: message});
  }

  let generateMessageBuble = (messageData, index) => {
    let activeUser = taptalk.getTaptalkActiveUser().userID;
    switch(messageData.type) {
      case CHAT_TYPE.TAPChatMessageTypeText:
        return (
          messageData.user.userID !== activeUser ?
            <ChatRoomMessageIn 
              key={index} 
              singleChatDataProps={messageData} 
              activeUserID={activeUser}
              onReplyMessage={onReplyMessage}
              onForwardMessage={onForwardMessage}
              scrollToReply={scrollToReply}
              mentionList={mentionList[messageData.localID]}
              isBubbleOnViewPort={isBubbleOnViewPort}
            />
            :
            <ChatRoomMessageOut 
              key={index} 
              singleChatDataProps={messageData} 
              activeUserID={activeUser}
              onReplyMessage={onReplyMessage}
              onForwardMessage={onForwardMessage}
              scrollToReply={scrollToReply}
              mentionList={mentionList[messageData.localID]}
            />
        )
      case CHAT_TYPE.TAPChatMessageTypeImage:
          return (
            messageData.user.userID !== activeUser ?
              messageData.isDeleted ?
                <ChatRoomMessageIn 
                  key={index} 
                  singleChatDataProps={messageData} 
                  activeUserID={activeUser}
                  onReplyMessage={onReplyMessage}
                  onForwardMessage={onForwardMessage}
                  scrollToReply={scrollToReply}
                  mentionList={mentionList[messageData.localID]}
                  isBubbleOnViewPort={isBubbleOnViewPort}
                />
                :
                <ChatRoomMessageInImage 
                  key={index} 
                  singleChatDataProps={messageData} 
                  activeUserID={activeUser}
                  onReplyMessage={onReplyMessage}
                  onForwardMessage={onForwardMessage}
                  scrollToReply={scrollToReply}
                  mentionList={mentionList[messageData.localID]}
                  isBubbleOnViewPort={isBubbleOnViewPort}
                />
              :
              messageData.isDeleted ?
                <ChatRoomMessageOut 
                  key={index} 
                  singleChatDataProps={messageData} 
                  activeUserID={activeUser}
                  onReplyMessage={onReplyMessage}
                  onForwardMessage={onForwardMessage}
                  scrollToReply={scrollToReply}
                  mentionList={mentionList[messageData.localID]}
                />
                :
                <ChatRoomMessageOutImage 
                  key={index} 
                  singleChatDataProps={messageData} 
                  activeUserID={activeUser}
                  onReplyMessage={onReplyMessage}
                  onForwardMessage={onForwardMessage}
                  scrollToReply={scrollToReply}
                  mentionList={mentionList[messageData.localID]}
                />
          )
      case CHAT_TYPE.TAPChatMessageTypeVideo:
          return (
            messageData.user.userID !== activeUser ?
              messageData.isDeleted ?
                <ChatRoomMessageIn 
                  key={index} 
                  singleChatDataProps={messageData} 
                  activeUserID={activeUser}
                  onReplyMessage={onReplyMessage}
                  onForwardMessage={onForwardMessage}
                  scrollToReply={scrollToReply}
                  mentionList={mentionList[messageData.localID]}
                  isBubbleOnViewPort={isBubbleOnViewPort}
                />
                :
                <ChatRoomMessageInVideo 
                  key={index} 
                  singleChatDataProps={messageData} 
                  activeUserID={activeUser}
                  onReplyMessage={onReplyMessage}
                  onForwardMessage={onForwardMessage}
                  scrollToReply={scrollToReply}
                  mentionList={mentionList[messageData.localID]} 
                  isBubbleOnViewPort={isBubbleOnViewPort}
                />
                :
              messageData.isDeleted ?
                <ChatRoomMessageOut 
                  key={index} 
                  singleChatDataProps={messageData} 
                  activeUserID={activeUser}
                  onReplyMessage={onReplyMessage}
                  onForwardMessage={onForwardMessage}
                  scrollToReply={scrollToReply}
                  mentionList={mentionList[messageData.localID]}
                />
                :
                <ChatRoomMessageOutVideo 
                  key={index} 
                  singleChatDataProps={messageData} 
                  activeUserID={activeUser}
                  onReplyMessage={onReplyMessage}
                  onForwardMessage={onForwardMessage}
                  scrollToReply={scrollToReply}
                  mentionList={mentionList[messageData.localID]}
                />
          )
      case CHAT_TYPE.TAPChatMessageTypeSystemMessage:
          return (
            <ChatRoomChatInfo 
              key={index} 
              singleChatDataProps={messageData} 
              activeUserID={activeUser}
              onReplyMessage={onReplyMessage}
              onForwardMessage={onForwardMessage}
              scrollToReply={scrollToReply}
              mentionList={mentionList[messageData.localID]}
            />
          )
      case CHAT_TYPE.TAPChatMessageTypeLocation:
          return (
            messageData.user.userID !== activeUser ?
              messageData.isDeleted ?
                <ChatRoomMessageIn 
                  key={index} 
                  singleChatDataProps={messageData} 
                  activeUserID={activeUser}
                  onReplyMessage={onReplyMessage}
                  onForwardMessage={onForwardMessage}
                  scrollToReply={scrollToReply} 
                  mentionList={mentionList[messageData.localID]}
                  isBubbleOnViewPort={isBubbleOnViewPort}
                />
                :
                <ChatRoomMessageInLocation 
                  key={index} 
                  singleChatDataProps={messageData} 
                  activeUserID={activeUser}
                  onReplyMessage={onReplyMessage}
                  onForwardMessage={onForwardMessage}
                  scrollToReply={scrollToReply}
                  mentionList={mentionList[messageData.localID]}
                  isBubbleOnViewPort={isBubbleOnViewPort}
                />
              :
              messageData.isDeleted ?
                <ChatRoomMessageOut 
                  key={index} 
                  singleChatDataProps={messageData} 
                  activeUserID={activeUser}
                  onReplyMessage={onReplyMessage}
                  onForwardMessage={onForwardMessage}
                  scrollToReply={scrollToReply}
                  mentionList={mentionList[messageData.localID]}
                />
                :
                <ChatRoomMessageOutLocation 
                  key={index} 
                  singleChatDataProps={messageData} 
                  activeUserID={activeUser}
                  onReplyMessage={onReplyMessage}
                  onForwardMessage={onForwardMessage}
                  scrollToReply={scrollToReply}
                  mentionList={mentionList[messageData.localID]}
                />
          )
      case CHAT_TYPE.TAPChatMessageTypeFile:
          return (
            messageData.user.userID !== activeUser ?
              messageData.isDeleted ?
                <ChatRoomMessageIn 
                  key={index} 
                  singleChatDataProps={messageData} 
                  activeUserID={activeUser}
                  onReplyMessage={onReplyMessage}
                  onForwardMessage={onForwardMessage}
                  scrollToReply={scrollToReply}
                  mentionList={mentionList[messageData.localID]}
                  isBubbleOnViewPort={isBubbleOnViewPort}
                />
                :
                <ChatRoomMessageInFile 
                  key={index} 
                  singleChatDataProps={messageData} 
                  activeUserID={activeUser}
                  onReplyMessage={onReplyMessage}
                  onForwardMessage={onForwardMessage}
                  scrollToReply={scrollToReply}
                  mentionList={mentionList[messageData.localID]}
                  isBubbleOnViewPort={isBubbleOnViewPort}
                />
              :
              messageData.isDeleted ?
                <ChatRoomMessageOut 
                  key={index} 
                  singleChatDataProps={messageData} 
                  activeUserID={activeUser}
                  onReplyMessage={onReplyMessage}
                  onForwardMessage={onForwardMessage}
                  scrollToReply={scrollToReply} 
                  mentionList={mentionList[messageData.localID]}
                />
                :
                <ChatRoomMessageOutFile 
                  key={index} 
                  singleChatDataProps={messageData} 
                  activeUserID={activeUser}
                  onReplyMessage={onReplyMessage}
                  onForwardMessage={onForwardMessage}
                  scrollToReply={scrollToReply}
                  mentionList={mentionList[messageData.localID]}
                />
          )
      default:
        break;
    }
  }

  let onInputNewMessage = (messageText) => {
    tapCoreChatRoomManager.sendStopTypingEmit(props.activeRoom.roomID);

    if((props.activeRoom) && (messageText !== "") && (messageText.replace(/\s/g, '').length !== 0)) {
      let split4000char = messageText.match(/.{1,4000}/gs);

      for(let i in split4000char) {
        tapCoreMessageManager.sendTextMessage(split4000char[i], props.activeRoom, function(message) { 
          // message.body = split4000char[i];
        
          props.setNewEmitMessageProps(message);
  
          let currentChatRoomData = chatDataRoomMain;
  
          currentChatRoomData[message.localID] = message;
          props.runSetChatRoomDataForHeader(currentChatRoomData);
          setChatDataRoomMain(currentChatRoomData);

          scrollChatViewToBottom();
        }, props.replyMessage.message, props.forwardMessage.message);
      }
    }
  }

  let onStartUploadFile = (message) => {
    setFileUploadProgress(generateNewFileUploadProgress(message.localID, 0, 0, message));
  }

  let onProgressUploadFile = (localID, percentage, bytes) => {
    setFileUploadProgress(generateNewFileUploadProgress(localID, percentage, bytes));
  }

  let runningFileMessage = (files) => {
      let timeout = 0;
      files.map((value, index) => {
        if(index > 0) {
          timeout += 500;
        }

        setTimeout(() => {
          tapCoreMessageManager.sendFileMessage(value, props.activeRoom, 
            {
              onStart: (message) => {
                props.setNewEmitMessageProps(message);
                onStartUploadFile(message);
                HelperChat.resetChatRoomHeightAndInputText();
                props.clearReplyMessage();
                props.clearForwardMessage();
              },
      
              onProgress: (localID, percentage, bytes) => {
                onProgressUploadFile(localID, percentage, bytes);
              },
      
              onSuccess: (message) => {
                
              },
      
              onError: (errorCode, errorMessage) => {
                Helper.doToast(errorMessage);
                console.log(errorCode, errorMessage);
              }
            }, props.replyMessage.message, props.forwardMessage.message);
        }, timeout);

        return null;
      })
  }

  let runningImageMessage = (file, caption, index) => {
    tapCoreMessageManager.sendImageMessage(file, caption, props.activeRoom, 
      {
        onStart: (message) => {
          props.setNewEmitMessageProps(message);
          onStartUploadFile(message);
          HelperChat.resetChatRoomHeightAndInputText();
          props.clearReplyMessage();
          props.clearForwardMessage();
        },

        onProgress: (localID, percentage, bytes) => {
          onProgressUploadFile(localID, percentage, bytes);
        },

        onSuccess: (message) => {
          
        },

        onError: (errorCode, errorMessage) => {
          Helper.doToast(errorMessage);
          console.log(errorCode, errorMessage);
        }
    }, props.replyMessage.message, index > 0 ? false : props.forwardMessage.message);
  }

  let runningVideoMessage = (file, caption, index) => {
    tapCoreMessageManager.sendVideoMessage(file, caption, props.activeRoom, 
      {
        onStart: (message) => {
          onStartUploadFile(message);
          props.setNewEmitMessageProps(message);
          HelperChat.resetChatRoomHeightAndInputText();
          props.clearReplyMessage();
          props.clearForwardMessage();
        },

        onProgress: (localID, percentage, bytes) => {
          onProgressUploadFile(localID, percentage, bytes);
        },

        onSuccess: (message) => {
          
        },

        onError: (errorCode, errorMessage) => {
          Helper.doToast(errorMessage);
          console.log(errorCode, errorMessage);
        }
    }, props.replyMessage.message, index > 0 ? false : props.forwardMessage.message);
  }

  let generateBubbleThisGroupUnavailable = () => {
    return (
      <div className="room-is-unavailable">
        Sorry, this group is unavailable
      </div>
    )
  }

  let onReplyMessage = async (message) => {
    props.clearForwardMessage();
    let _replyMessage = {...props.replyMessage};
    _replyMessage.message = message;
    props.setReplyMessage(_replyMessage)
  }

  let onForwardMessage = async (message) => {
    HelperChat.resetChatRoomHeightAndInputText();
    props.clearReplyMessage();
    let _forwardMessage = {...props.forwardMessage};
    _forwardMessage.setHeightChatRoom = false;
    _forwardMessage.target = false;
    _forwardMessage.message = message;
    props.setForwardMessage(_forwardMessage)
  }

  let scrollToReply = (localID) => {
    let targetScroll = document.querySelectorAll(".chat-room-main-content")[0];
    let targetLocalID = document.querySelector(`#message-${localID}`);
    props.clearGoToChatBubble();

    if(targetLocalID !== null) {
        targetScroll.scrollTop = targetLocalID.offsetTop;

        // targetScroll.scrollTo({
        //     top: targetLocalID.offsetTop,
        //     behavior: 'smooth',
        // });
        
        targetLocalID.classList.add("highlight-chat-bubble");

        setTimeout(() => {
            targetLocalID.classList.remove("highlight-chat-bubble");
        }, 2000);
    }else {
      getMessageBefore(false, false, localID)
    }
  }

  let runSetLastDragAndDropFiles = () => {
    setLastDragAndDropFiles({
      files: [],
      time: ""
    })
  }

  let toggleDropFileHere = () => {
    setShowDropFileHere(!showDropFileHere);
  }

  let hidedropFileHere = () => {
    setShowDropFileHere(false);
  }

  let checkIsFileorMedia = (files) => {
    let _files = Array.from(files);

    if(_files.length > 0) {
      let isMedia = null;
  
      _files.map((value) => {
        if(value.type.split("/")[0] === "video" || value.type.split("/")[0] === "image") {
          isMedia === null && (isMedia = true);
        }else {
          isMedia = false;
        }
  
        return null;
      })
  
      if(!isMedia) {
        runningFileMessage(_files);
      }else {
        setLastDragAndDropFiles({
          files: _files,
          time: new Date().valueOf()
        })
      }
    }
  }

  let generateViewDropFileHere = () => {
    let handleDropFile = (e) => {
      toggleDropFileHere();
      e.preventDefault();
      let files= e.dataTransfer.files;
      checkIsFileorMedia(files);
    }

    return (
      <div className={`drop-file-here-wrapper ${showDropFileHere ? "active-drop-file-here-wrapper" : ""}`}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {handleDropFile(e)}}
      >
        <div className="drop-file-here-content">
          <div className="drop-file-here-inner-content">
            <FiUpload />

            <p>
              Drop your files, image or video here
            </p>
          </div>
        </div>
      </div>
    )
  }

  let onClickMentionCounter = () => {
    scrollToReply(Object.keys(myMentionCounter)[0]);
    
    setMyMentionCounter({});
  }

  let deleteMessageAction = (message) => {
    let messageIDs = [];
    messageIDs.push(message.messageID);
    tapCoreMessageManager.markMessageAsDeleted(message.room.roomID, messageIDs, true);
  }

  let modalActionMessage = () => {
    let myAccountID = taptalk.getTaptalkActiveUser().userID;
    let message = props.activeMessage;

    let isShowCopyForward = () => {
      let show = false;

      if(message.type === CHAT_TYPE.TAPChatMessageTypeText || message.type === CHAT_TYPE.TAPChatMessageTypeLocation) {
        show = true;
      }

      return show;
    }

    let isShowDelete = () => {
      let show = true;

      if(myAccountID !== message.user.userID) {
        show = false;
      }

      return show;
    }

    return (
      <Modal className="modal-action-message" isOpen={openModalActionMessage}>
        <ModalBody>
            <div className="action-message-wrapper-chat">
              {isShowCopyForward() &&
                <div 
                  className="action-message-content" 
                  onClick={() => {
                    props.clearActiveMessage();
                    HelperChat.copyToClipBoard(props.activeMessage.body);
                  }}
                >
                    <FiCopy />
                    <span>Copy</span>
                </div>
              }
              
              <div 
                className="action-message-content" 
                onClick={() => {
                  props.clearActiveMessage();
                  onReplyMessage(props.activeMessage)
                }}
              >
                  <FaReply />
                  <span>Reply</span> 
              </div>
              
              {isShowCopyForward() &&
                <div 
                  className="action-message-content action-message-forward" 
                  onClick={() => {
                    props.clearActiveMessage();
                    onForwardMessage(props.activeMessage);
                }}>
                    <FaReply />
                    <span>Forward</span> 
                </div>
              }

              {isShowDelete() &&
                <div 
                  className="action-message-content" 
                  onClick={() => {
                    props.clearActiveMessage();
                    deleteMessageAction(props.activeMessage);
                  }}
                >
                    <FiTrash />
                    <span>Delete</span> 
                </div>
              }
            </div>

            <div className="cancel-action-message" onClick={props.clearActiveMessage}>
              <b>Cancel</b>
            </div>
        </ModalBody>
      </Modal>
    )
  }

  return (
    <div className={`wrap-all-chatroom `}
      onDragEnter={() => {toggleDropFileHere()}}
      onDragLeave={() => {toggleDropFileHere()}}
      onPaste={(e) => {
        checkIsFileorMedia(e.clipboardData.files);
      }}
    >
      {generateViewDropFileHere()}

      {props.activeMessage &&
        <MediaQuery maxDeviceWidth={767}>
          {modalActionMessage()}
        </MediaQuery>
      }

      <ChatRoomSelectForward
        isOpen={isShowModalForward}
        toggle={toggleModalForward}
      />

      <div className={`chat-room-main-wrapper ${isNoLongerParticipant ? "hide-reply-forward" : ""}`}
           style={{maxHeight: `calc(100vh - ${isNoLongerParticipant ? '180' : '108'}px)`}}
          //  onScroll={() => setLastScroll(new Date())}
      >
          {Object.keys(myMentionCounter).length > 0 &&
            <div className="mention-counter" onClick={onClickMentionCounter}>
              <div className="mention-counter-badge">{Object.keys(myMentionCounter).length}</div>
              <b>@</b>
            </div>
          }

          {isShowLoadingBlocking &&
            <div className="chat-room-main-wrapper-loading-blocking">
                  <div className="lds-ring">
                    <div /><div /><div /><div />
                  </div>
            </div>
          }

          {showBlockingChatFirst &&
            <div className="chat-room-main-wrapper-firstchat-blocking">
                <div className="chat-room-main-wrapper-firstchat-blocking-content">
                    {taptalk.getTaptalkActiveUser() !== null && 
                      <div className="avatar-outer-wrapper">
                        <div className="avatar-content my-avatar">
                          {taptalk.getTaptalkActiveUser().imageURL.thumbnail === '' ?
                            <div className="avatar-abbreviation">
                                <b>{Helper.renderUserAvatarWord(taptalk.getTaptalkActiveUser().fullname, false)}</b>
                            </div>
                            :
                            <img src={taptalk.getTaptalkActiveUser().imageURL.thumbnail} alt="" />
                          }
                        </div>

                        <div className="avatar-content recipient-avatar">
                          {props.activeRoom.imageURL.thumbnail === '' ?
                            <div className="avatar-abbreviation">
                                <b>{Helper.renderUserAvatarWord(props.activeRoom.name, props.activeRoom.type === 2)}</b>
                            </div>
                            :
                            <img src={props.activeRoom.imageURL.thumbnail} alt="" />
                          }
                        </div>
                      </div>
                    }
                    
                    <p>
                      <b>Start a conversation with {props.activeRoom.name}</b>
                    </p>

                    <span>Say hi to {props.activeRoom.name} and start a conversation</span>
                </div>
            </div>
          }

          {roomIsDeleted && generateBubbleThisGroupUnavailable()}

          {/* <Scrollbars autoHide autoHideTimeout={500}
                  renderThumbVertical={props => <div {...props} style={style.scrollStyle} />}> */}
              
              <div className="chat-room-main-content" 
                    onScroll={() => onScrollListener()} ref={chatRoomMesageListRef}
                    // style={{maxHeight: `calc(100vh - ${isNoLongerParticipant ? '190' : '120'}px)`}}
              >
              {/* <Scrollbars autoHide autoHideTimeout={500}
                  renderThumbVertical={props => <div {...props} style={style.scrollStyle} />}> */}
                {isLoadingChat &&
                  <div className="loading-message-wrapper">
                    <div className="lds-ring">
                      <div />
                      <div />
                      <div />
                      <div />
                    </div>
                  </div>
                }

                {/* <div id="chat-room-data" data={JSON.stringify(chatDataRoomMain)} /> */}

                {chatDataRoomMain !== null &&
                  !roomIsDeleted &&
                    Object.keys(chatDataRoomMain).map((value, index) => {
                      if(!chatDataRoomMain[value].isHidden) {
                        return (
                          generateMessageBuble(chatDataRoomMain[value], index)
                        )
                      }

                      return null;
                    })
                }

                {/* </Scrollbars> */}
              </div>
          {/* </Scrollbars> */}
      </div>
      
      {(!roomIsDeleted && !isNoLongerParticipant) &&
        // <ChatRoomInputMessage 
        //     onInputNewMessageProps={onInputNewMessage}
        //     runningFileMessageProps={runningFileMessage}
        //     runningImageMessageProps={runningImageMessage}
        //     runningVideoMessageProps={runningVideoMessage}
        // />

        <ChatRoomInputMessage 
              onInputNewMessageProps={onInputNewMessage}
              runningFileMessageProps={runningFileMessage}
              runningImageMessageProps={runningImageMessage}
              runningVideoMessageProps={runningVideoMessage}
              parentProps={props.parentProps}
              lastDragAndDropFilesProps={lastDragAndDropFiles}
              setLastDragAndDropFilesProps={runSetLastDragAndDropFiles}
              hidedropFileHereProps={hidedropFileHere}
        />
      }

      {isNoLongerParticipant &&
        <div className="no-longer-participant">
          <p>
            <img src={iconClock} alt="" />
            <b>This is a chat History</b>
          </p>

          <p>
            You are no longer a participant in this group
          </p>

          <button className="red-button" onClick={() => props.deleteLocalChatRoomProps()}>
            <b>Delete Chat</b>
          </button>
        </div>
      }

      {/* {isNoLongerParticipant &&
        <div className="no-longer-participant">
          <p>
            <img src={iconClock} alt="" />
            <b>This is a chat History</b>
          </p>

          <p>
            This user is no longer available
          </p>

          <button className="red-button" onClick={() => props.deleteLocalChatRoomProps()}>
            <b>Delete Chat</b>
          </button>
        </div>
      } */}
    </div>
  );
}

const mapStateToProps = state => ({
  activeRoom: state.activeRoom,
  replyMessage: state.replyMessage,
  forwardMessage: state.forwardMessage,
  goToChatBubble: state.goToChatBubble,
  activeMessage: state.activeMessage
});

const mapDispatchToProps = {
  setActiveRoom,
  setReplyMessage,
  setForwardMessage,
  clearReplyMessage,
  clearForwardMessage,
  clearGoToChatBubble,
  clearActiveMessage
};

export default connect(mapStateToProps, mapDispatchToProps)(ChatRoomMain);
