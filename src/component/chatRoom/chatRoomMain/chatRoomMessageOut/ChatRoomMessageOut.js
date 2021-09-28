import React, { useState } from 'react';
import { Dropdown, DropdownToggle, DropdownMenu, DropdownItem } from 'reactstrap';
import './ChatRoomMessageOut.scss';
import CheckMarkDoubleWhite from '../../../../assets/img/chatroom/icon-double-check-white.svg';
import CheckMarkDoubleDark from '../../../../assets/img/chatroom/icon-double-check-dark.svg';
import CheckMarkDark from '../../../../assets/img/chatroom/icon-check-dark.svg';
import AirplaneDark from '../../../../assets/img/chatroom/icon-airplane-dark.svg';
import FaForward from '../../../../assets/img/chatroom/icon-forward.svg';
// import MessageDelete from "../../../../assets/img/icon-notallowed.svg";
import MessageDeleteWhite from "../../../../assets/img/icon-notallowed-white.svg";
import { FaReply } from 'react-icons/fa';
// import { FiMoreHorizontal } from 'react-icons/fi';
import { FiCopy, FiTrash2, FiMoreHorizontal } from 'react-icons/fi';
// import { FiTrash2 } from 'react-icons/fi';
import HelperChat from '../../../../helper/HelperChat';
// import useLongPress from '../../../../helper/HelperLongPress';
import { tapCoreMessageManager } from '@taptalk.io/web-sdk';
// import { MdInsertDriveFile } from 'react-icons/md';
import { setActiveMessage } from '../../../../redux/actions/reduxActionActiveMessage';
import { connect } from 'react-redux';
import ChatRoomReplyOutMessage from "../chatRoomReplyOutMessage/chatRoomReplyOutMessage/ChatRoomReplyOutMessage";

const LONG_PRESS = 700;

// const CHAT_TYPE = {
//     TAPChatMessageTypeText : 1001,
//     TAPChatMessageTypeImage : 1002,
//     TAPChatMessageTypeVideo : 1003,
//     TAPChatMessageTypeFile : 1004,
//     TAPChatMessageTypeLocation : 1005,
//     TAPChatMessageTypeContact : 1006,
//     TAPChatMessageTypeSticker : 1007,
//     TAPChatMessageTypeSystemMessage : 9001,
//     TAPChatMessageTypeUnreadMessageIdentifier : 9002,
//     TAPChatMessageTypeCaseClosed : 3001,
//     TAPChatMessageTypeLeaveReview: 3003,
//     TAPChatMessageTypeLeaveReviewDisabled: 3004
// }

var ChatRoomMessageOut = (props) => {
    let deleteMessageAction = (message) => {
        let messageIDs = [];
        messageIDs.push(message.messageID);
        tapCoreMessageManager.markMessageAsDeleted(message.room.roomID, messageIDs, true);
    }

    let { 
        singleChatDataProps,
        activeUserID,
        onReplyMessage,
        onForwardMessage,
        scrollToReply,
        mentionList,
    } = props;
    let [openChatAction, setOpenChatAction] = useState(false);

    let toggleChatAction = () => {
        setOpenChatAction(!openChatAction)
    }

    // const onLongPress = () => {
    //     if(!singleChatDataProps.isDeleted) {
    //         props.setActiveMessage(singleChatDataProps)
    //     }
    // };
  
    // const onClick = () => {
    //  return null;
    // };
    
    // const defaultOptions = {
    //     shouldPreventDefault: true,
    //     delay: 500,
    // };
  
    // const longPressEvent = useLongPress(onLongPress, onClick, defaultOptions);

    let messageActionView = (message) => {
        let onClickReply = () => {
            onReplyMessage(message)
        }

        let messageAction = [
            {
                text: "Reply",
                action: onClickReply,
                icon: {
                    type: "svg",
                    src: <FaReply />
                }
            },
            {
                
                text: "Forward",
                action: () => onForwardMessage(message),
                icon: {
                    type: "img",
                    src: FaForward
                }
            },
            {
                text: "Copy",
                action: () => HelperChat.copyToClipBoard(message.body),
                icon: {
                    type: "svg",
                    src: <FiCopy className="icon-delete" />
                }
            },
            {
                text: "Delete Message",
                action: () => deleteMessageAction(message),
                icon: {
                    type: "svg",
                    src: <FiTrash2 />
                }
            },
        ]

        return (
            // <div className="message-action-wrapper">
            //     <div className="message-action-button-wrapper reply-button" title="Reply" onClick={onClickReply}>
            //         <FaReply />
            //     </div>
                

            //     <div className="message-action-button-wrapper forward-button" title="Forward" onClick={() => onForwardMessage(message)}>
            //         <FaReply />
            //     </div>
                
                
            //     <div className="message-action-button-wrapper" title="Copy to clipboard" onClick={() => HelperChat.copyToClipBoard(message.body)}>
            //         <FiCopy />
            //     </div>
                
            //     <div className="message-action-button-wrapper" title="Delete" onClick={() => deleteMessageAction(message)}>
            //         <FiTrash2 />
            //     </div>
            // </div>

            <div className="message-action-wrapper-new">
                <Dropdown isOpen={openChatAction} toggle={toggleChatAction}>
                    <DropdownToggle>
                        <FiMoreHorizontal />
                    </DropdownToggle>
                    <DropdownMenu>
                        {messageAction.map((val, idx) => {
                            return (
                                <DropdownItem onClick={val.action} key={`action-${idx}`}>
                                    {val.icon.type === "img" ?
                                        <img src={val.icon.src} alt="" />
                                        :
                                        val.icon.src
                                    }
                                    {val.text}
                                </DropdownItem>
                            )
                        })}
                        
                    </DropdownMenu>
                </Dropdown>
            </div>
        )
    }

    let delay;

    let onTouchStartEvent = () => {
        if(!singleChatDataProps.isDeleted) {
            delay = setTimeout(() => {
                props.setActiveMessage(singleChatDataProps)
            }, LONG_PRESS)
        }
    }

    let onTouchEndEvent = () => {
        clearTimeout(delay);
    }

    return (
        <div className="chat-room-message-out-wrapper" id={`message-${singleChatDataProps.localID}`} onTouchStart={onTouchStartEvent} onTouchEnd={onTouchEndEvent}>
            {singleChatDataProps.isDeleted ?
                <div className="message-out-bubble deleted-bubble">
                    <React.Fragment>
                        <img src={MessageDeleteWhite} alt="" className="deleted-icon" />
                        This message was deleted.
                    </React.Fragment>
                </div>
                :

                <div className="message-out-bubble" 
                    // style={
                    //         singleChatDataProps.replyTo.localID !== "" ? 
                    //             (singleChatDataProps.replyTo.messageType === CHAT_TYPE.TAPChatMessageTypeText ?
                    //                 {paddingTop: "64px"} 
                    //                 :
                    //                 {paddingTop: "84px"}
                    //             )
                    //             : 
                    //             {}
                    // }
                >
                    {singleChatDataProps.forwardFrom.localID !== "" &&
                        <div className="forwarded-message">
                            <b>Forwarded</b>
                            
                            <p>
                                From: <b>{singleChatDataProps.forwardFrom.fullname}</b>
                            </p>
                        </div>
                    }
                   

                    {singleChatDataProps.replyTo.localID !== "" &&
                        <ChatRoomReplyOutMessage 
                            message={singleChatDataProps}
                            activeUserID={activeUserID}
                            scrollToReply={scrollToReply}
                        />
                    }
    

                    <span 
                        className="message-body" 
                        dangerouslySetInnerHTML={{
                            __html: mentionList ?
                                HelperChat.lineBreakChatRoom(HelperChat.generateMentionSpan(HelperChat.replaceTagHTML(singleChatDataProps.body), mentionList))
                                :
                                HelperChat.lineBreakChatRoom(HelperChat.replaceTagHTML(singleChatDataProps.body))
                        }} 
                    />

                    <p className="message-info">
                        {HelperChat.getDateMonthYear(singleChatDataProps.created)} <span className="centered-dot" /> {HelperChat.getHourMinute(singleChatDataProps.created)}
                    
                        {(singleChatDataProps.isSending && !singleChatDataProps.isRead) &&
                            <img src={AirplaneDark} alt="" />
                        }

                        {(!singleChatDataProps.isSending && !singleChatDataProps.isDelivered && !singleChatDataProps.isRead) &&
                            <img src={CheckMarkDark} alt="" />
                        }

                        {(!singleChatDataProps.isSending && singleChatDataProps.isDelivered && !singleChatDataProps.isRead) &&
                            <img src={CheckMarkDoubleDark} alt="" />
                        }

                        {singleChatDataProps.isRead &&
                            <img src={CheckMarkDoubleWhite} alt="" />
                        }

                        {/* {!singleChatDataProps.isDelivered &&
                            <img src={CheckMarkDark} alt="" />
                        } */}
        
                    </p>
                    {messageActionView(singleChatDataProps)}
                </div>
            }
        </div>
    );
}

const mapStateToProps = state => ({
    replyMessage: state.replyMessage
});

const mapDispatchToProps = {
  setActiveMessage
}

export default connect(mapStateToProps, mapDispatchToProps)(ChatRoomMessageOut);
