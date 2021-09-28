import React, { useState, useEffect } from 'react';
import './RoomListChat.scss';
import RoomListNoChat from '../roomListNoChat/RoomListNoChat';
import groupBadge from "../../../assets/img/group-badge.svg";
import Helper from '../../../helper/Helper';
import HelperChat from '../../../helper/HelperChat';
import WebWorker from "../../../helper/HelperWebWorker";
import { taptalk, tapCoreRoomListManager } from '@taptalk.io/web-sdk';
import { connect } from 'react-redux';
import { FixedSizeList as List } from 'react-window';

const CONNECTING_STATUS = {
    disconnected: 1,
    loading: 2,
    connected: 3
};

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

//print room list
let isToday = (date) => {
    let today = new Date();
    let _date = new Date(date);
    return _date.getDate() === today.getDate() &&
        _date.getMonth() === today.getMonth() &&
        _date.getFullYear() === today.getFullYear()
}

let isYerterday = (date) => {
    let _date = new Date(date);
    let yesterday = new Date(new Date().setDate(new Date().getDate()-1));
    return _date.getDate() === yesterday.getDate() &&
        _date.getMonth() === yesterday.getMonth() &&
        _date.getFullYear() === yesterday.getFullYear() 
}

let ListRoomComponent = (props) => {
    let { dataLength, containerHeight, row, mainProps, chatData, mentionList } = props;
    
    return (
        <List
            className={``}
            height={containerHeight}
            itemCount={dataLength}
            itemSize={68}
            width={"100%"}
            // onScroll={onScrollRoomListListenerProps}
            // ref={refProps}
            itemData={{
                mainProps: mainProps,
                chatData: chatData,
                mentionList: mentionList
            }}
        >
            {row}
        </List>
    )
};

let printRowRoomList = ({ index, style, data }) => {
    // let _props = data.mainProps;
    let chatData = data.chatData[Object.keys(data.chatData)[index]];
    let mentionList = data.mentionList;

    // let onClickOpenCaseRoom = (room, caseData) => {
    //     _props.clearStartConversation();
    //     _props.clearStartConversationBa();
    //     _props.onClickRoomListProps(room, caseData)
    // }

    return (
        <div style={style}>
            <div className={`chat-list-wrapper ${data.mainProps.activeRoom === null ? "" : (data.mainProps.activeRoom.roomID === chatData.lastMessage.room.roomID ? "active-chat-list" : "")}`} 
                onClick={() => data.mainProps.onClickRoomListProps(chatData.lastMessage)}
            >   
                <div className="chat-avatar-wrapper">
                    {chatData.lastMessage.room.imageURL.thumbnail === "" ?
                        <div className="user-avatar-name" style={{background: taptalk.getRandomColor(chatData.lastMessage.room.name)}}>
                            <b>{Helper.renderUserAvatarWord(chatData.lastMessage.room.name, chatData.lastMessage.room.type === 2)}</b>
                        </div>
                        :
                        <img src={chatData.lastMessage.room.imageURL.thumbnail} alt="" />
                    }

                    {chatData.lastMessage.room.type === 2 && <img src={groupBadge} alt="" className="group-badge" />}
                </div>
                <div className="dialog-message-wrapper">
                    <div className="dialog-top">
                        <b>{chatData.lastMessage.room.name}</b>
                        <span className="dialog-date">
                            {isToday(chatData.lastMessage.created) ?
                                new Date(chatData.lastMessage.created).getHours()+":"+(new Date(chatData.lastMessage.created).getMinutes() < 10 ? "0" : "")+new Date(chatData.lastMessage.created).getMinutes()
                                :
                                isYerterday(chatData.lastMessage.created) ?
                                "Yesterday"
                                :
                                new Date(chatData.lastMessage.created).getDate()+"/"+(new Date(chatData.lastMessage.created).getMonth() + 1)+"/"+new Date(chatData.lastMessage.created).getFullYear()
                            }
                        </span>
                    </div>
                    <div className="dialog-bottom">
                        {/* {chatData.lastMessage.recipientID === '0' &&
                            <span>
                                {chatData.lastMessage.user.userID === taptalk.getTaptalkActiveUser().userID ?
                                    "You"
                                    :
                                    chatData.lastMessage.user.fullname
                                }
                            </span>
                        } */}

                        <p>
                            {HelperChat.generateLastMessage(chatData.lastMessage)}
                        </p>

                        <div className="message-status">
                            {mentionList[chatData.lastMessage.room.roomID] &&
                                (Object.keys(mentionList[chatData.lastMessage.room.roomID]).length > 0 &&
                                    <div className="mention-badge">
                                        @
                                    </div>
                                )
                            }

                            {(chatData.lastMessage.user.userID !== taptalk.getTaptalkActiveUser().userID) && (chatData.unreadCount > 0) &&
                                // unread badge
                                <div className="unread-count-wrapper">
                                    <b>{chatData.unreadCount > 99 ? "99+" : chatData.unreadCount}</b>
                                </div>
                                // unread badge
                            }

                            {(chatData.lastMessage.user.userID === taptalk.getTaptalkActiveUser().userID && chatData.lastMessage.type !== 9001) &&
                                //message status badge
                                <img src={HelperChat.renderChatStatus(chatData.lastMessage, data.mainProps.activeRoom)} alt="" />
                                //message status badge
                            }
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
};
//print room list

var RoomListChat = (props) => {
    let [chatData, setChatData] = useState(null);
    let [isRoomListLoadingFinish, setIsRoomListLoadingFinish] = useState(false);
    let [roomListHeight, setRoomListHeight] = useState(window.innerHeight - 53);
    let [lastWindowResize, setLastWindowResize] = useState(false);
    let [webWorkerMentionList, setWebWorkerMentionList] = useState(null);
    let [mentionList, setMentionList] = useState({});
    let [chatRoom, setChatRoom] = useState(false);

    //set webworker
    useEffect(() => {
        setWebWorkerMentionList(
            new WebWorker(() => {
                // eslint-disable-next-line no-restricted-globals
                self.addEventListener('message', function(e) {
                    let { chatRoom, chatType, activeUser } = e.data;
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
                    
                    Object.keys(chatRoom).map((val) => {
                        hashmap[val] = {};
                        Object.keys(chatRoom[val].messages).map((_val) => {
                            let localID = chatRoom[val].messages[_val].localID;
                            let result = isActiveUserMentioned(chatRoom[val].messages[_val]);
                            
                            if(result) {
                                hashmap[val][localID] = chatRoom[val].messages[_val];
                            }

                            return null;
                        })

                        return null;
                    })
                    
                    // eslint-disable-next-line no-restricted-globals
                    self.postMessage({
                        data: {
                            mentionList: hashmap
                        }
                    })
                })
            })
        )
        //mentionList
    // eslint-disable-next-line react-hooks/exhaustive-deps
}, [])

    useEffect(() => {
        if(webWorkerMentionList !== null) {
            webWorkerMentionList.addEventListener('message', (e) => {
                let { data } = e.data;
                setMentionList(data.mentionList);
            })
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
}, [webWorkerMentionList])
    //set webworker

    useEffect(() => {
        if(chatRoom && webWorkerMentionList !== null) {
            webWorkerMentionList.postMessage({
                chatRoom: chatRoom.list,
                chatType: CHAT_TYPE,
                activeUser: taptalk.getTaptalkActiveUser()
            })
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
}, [chatRoom])

    useEffect(() => {
        if(lastWindowResize) {
            runSetRoomListHeight();
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
}, [lastWindowResize])

    useEffect(() => {
        getUpdatedRoomList();
        setIsRoomListLoadingFinish(false);
        window.addEventListener("resize", () => {
            setLastWindowResize(new Date())
        })

        let onlineCallbackOpenCase = () => {
            getUpdatedRoomList();
        }

        window.addEventListener('online', onlineCallbackOpenCase);
    // eslint-disable-next-line react-hooks/exhaustive-deps
}, []);

    useEffect(() => {
        let _connectStatus = props.connectingStatusProps;
        let elRoomList = document.querySelectorAll(".room-list-chat-container")[0];

        if (elRoomList) {
            if (_connectStatus === CONNECTING_STATUS.disconnected || _connectStatus === CONNECTING_STATUS.loading) {
                // elRoomList.style.height = "calc(100vh - 135px)";
                elRoomList.style.height = "calc(100% - 79px)";
            } else {
                // elRoomList.style.height = "calc(100vh - 109px)";
                elRoomList.style.height = "calc(100% - 53px)";
            }
            
            setLastWindowResize(new Date())
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
}, [props.connectingStatusProps])

    useEffect(() => {
        if (props.newEmitMessageProps !== null) {
            if (isRoomListLoadingFinish) {
                // actionUpdateRoomList(props.newEmitMessageProps);
                getUpdatedRoomList();
            }
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
}, [props.newEmitMessageProps])

    useEffect(() => {
        if(props.messageListenerNewMessageProps !== null && isRoomListLoadingFinish) {
            let myAccount = taptalk.getTaptalkActiveUser().userID;
            getUpdatedRoomList();
            if ('Notification' in window) {
                if(!props.messageListenerNewMessageProps.isHidden && props.messageListenerNewMessageProps.user.userID !== myAccount) {
                    HelperChat.showNotificationMessage(props.messageListenerNewMessageProps);
                
                }
            }
        }

    // eslint-disable-next-line react-hooks/exhaustive-deps
}, [props.messageListenerNewMessageProps]);

    useEffect(() => {
        if(props.messageListenerUpdateMessageProps !== null && isRoomListLoadingFinish) {
            getUpdatedRoomList();
        }

    // eslint-disable-next-line react-hooks/exhaustive-deps
}, [props.messageListenerUpdateMessageProps]);

    useEffect(() => {
        if(props.forceRefreshRoomProps) {
            getUpdatedRoomList();
            props.undoForceRefreshRoomProps();
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
}, [props.forceRefreshRoomProps]);

    let getUpdatedRoomList = function() {
        tapCoreRoomListManager.getUpdatedRoomList({
            onSuccess: (roomLists, chatRooms) => {
                setChatRoom({
                    list: chatRooms,
                    time: new Date()
                });

                setIsRoomListLoadingFinish(true);
                setChatData(roomLists);
            },
            onError: (errorCode, errorMessage) => {
                setIsRoomListLoadingFinish(true);
                console.log(errorCode, errorMessage);
            }
        });
    };

    let runSetRoomListHeight = () => {
        let elRoomListWrapper = document.querySelectorAll(".room-list-container")[0];
        let min = props.connectingStatusProps === CONNECTING_STATUS.connected ? 53 : 79;
        let defaultHeight = elRoomListWrapper.offsetHeight - min;
        setRoomListHeight(defaultHeight);
    }

    return (
        <div className="room-list-chat-container" style={props.style}>
                {/* <RoomListNoChat /> */}
                {!isRoomListLoadingFinish ?
                    <div className="room-list-loading-wrapper"> 
                        <div className="lds-ring">
                            <div /><div /><div /><div />
                        </div>
                        <br />
                        <b>Loading Room List</b>
                    </div>

                    :
                
                    chatData !== null &&
                        Object.keys(chatData).length > 0 ?
                            <ListRoomComponent
                                chatData={chatData}
                                row={printRowRoomList}
                                dataLength={Object.keys(chatData).length}
                                containerHeight={roomListHeight}
                                mainProps={props}
                                listNameProps={"list-room"}
                                mentionList={mentionList}
                            />
                            :
                            <RoomListNoChat />
                }
        </div>
    );
}

const mapStateToProps = state => ({
    activeRoom: state.activeRoom
});
  
const mapDispatchToProps = {
    
};
  
export default connect(mapStateToProps, mapDispatchToProps)(RoomListChat);
  
