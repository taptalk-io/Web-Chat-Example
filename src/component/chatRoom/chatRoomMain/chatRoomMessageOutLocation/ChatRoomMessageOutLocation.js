import React, { useState } from 'react';
import GoogleMapReact from 'google-map-react';
import './ChatRoomMessageOutLocation.scss';
import FaForward from '../../../../assets/img/chatroom/icon-forward.svg';
import { Dropdown, DropdownToggle, DropdownMenu, DropdownItem } from 'reactstrap';
import CheckMarkDoubleWhite from '../../../../assets/img/chatroom/icon-double-check-white.svg';
import CheckMarkDoubleDark from '../../../../assets/img/chatroom/icon-double-check-dark.svg';
import CheckMarkDark from '../../../../assets/img/chatroom/icon-check-dark.svg';
import AirplaneDark from '../../../../assets/img/chatroom/icon-airplane-dark.svg';
import MarkerMap from '../../../../assets/img/marker-map.png';
// import MessageDelete from "../../../../assets/img/icon-notallowed.svg";
import MessageDeleteWhite from "../../../../assets/img/icon-notallowed-white.svg";
import { FaReply } from 'react-icons/fa';
// import { FiMoreHorizontal } from 'react-icons/fi';
import { FiCopy, FiTrash2, FiMoreHorizontal } from 'react-icons/fi';
// import { FiTrash2 } from 'react-icons/fi';
import Helper from '../../../../helper/HelperChat';
import { tapCoreMessageManager } from '@taptalk.io/web-sdk';
// import { MdInsertDriveFile } from 'react-icons/md';
import { setReplyMessage } from '../../../../redux/actions/reduxActionReplyMessage';
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

var ChatRoomMessageOutLocation = (props) => {
    let { 
        singleChatDataProps,
        activeUserID,
        onReplyMessage,
        onForwardMessage,
        scrollToReply,
        mentionList
    } = props;
    let [openChatAction, setOpenChatAction] = useState(false);

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
    
    let deleteMessageAction = (message) => {
        let messageIDs = [];
        messageIDs.push(message.messageID);
        tapCoreMessageManager.markMessageAsDeleted(message.room.roomID, messageIDs, true);
    }
    
    let messageActionView = (message) => {
        let onClickReply = () => {
            onReplyMessage(message)
        }

        let toggleChatAction = () => {
            setOpenChatAction(!openChatAction)
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
                action: () => Helper.copyToClipBoard(message.data.address),
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
                
            //     <div className="message-action-button-wrapper" title="Copy to clipboard" onClick={() => Helper.copyToClipBoard(message.data.address)}>
            //         <FiCopy />
            //     </div>

            //     <div className="message-action-button-wrapper" title="Delete" onClick={() => deleteMessageAction(message)}>
            //         <FiTrash2 />
            //     </div>
                


            //     {/*<div className="message-action-button-wrapper forward-message" title="Forward">
            //         <FaReply />
            //     </div> */}


            //     {/* <div className="message-action-button-wrapper" title="Delete" onClick={() => deleteMessageAction(message)}>
            //         <FiTrash2 />
            //     </div> */}
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
    
    let MarkerMapComponent = () => <div className="marker-map"><img src={MarkerMap} alt="" /></div>;
    
    return (
        <div className="chat-room-message-out-location-wrapper" id={`message-${singleChatDataProps.localID}`} onTouchStart={onTouchStartEvent} onTouchEnd={onTouchEndEvent}>
            {singleChatDataProps.isDeleted ?
                <div className="message-out-bubble deleted-bubble">
                    <React.Fragment>
                        <img src={MessageDeleteWhite} alt="" className="deleted-icon" />
                        This message was deleted.
                    </React.Fragment>
                </div>
                :

                <div className="message-out-bubble message-out-bubble-location" 
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

                    <div className="location-wrapper">
                        <a href={`http://maps.google.com?q=${singleChatDataProps.data.latitude} ${singleChatDataProps.data.longitude}`} target="_blank" rel="noopener noreferrer">
                            <div className="location-content"
                                //  style={{borderRadius: props.singleChatDataProps.forwardFrom.localID !== "" ? "0" : "16px 2px 0 0"}}
                            >
                                <GoogleMapReact
                                    bootstrapURLKeys={{ key: process.env.REACT_APP_GMAP_KEY}}
                                    defaultCenter={{
                                        lat: singleChatDataProps.data.latitude,
                                        lng: singleChatDataProps.data.longitude
                                    }}
                                    defaultZoom={16}
                                    draggable={false}
                                >
                                    <MarkerMapComponent
                                        lat={singleChatDataProps.data.latitude}
                                        lng={singleChatDataProps.data.longitude}
                                    />
                                </GoogleMapReact>
                            </div>
                        </a>
                    </div>

                    <span 
                        className="message-body" 
                        dangerouslySetInnerHTML={{
                            __html: mentionList ?
                                Helper.generateMentionSpan(Helper.lineBreakChatRoom(singleChatDataProps.data.address), mentionList)
                                :
                                Helper.lineBreakChatRoom(singleChatDataProps.data.address)
                        }}
                    />
                    
                    <p className="message-info">
                        {Helper.getDateMonthYear(singleChatDataProps.created)} <span className="centered-dot" /> {Helper.getHourMinute(singleChatDataProps.created)}
                    
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
  setReplyMessage,
  setActiveMessage
}

export default connect(mapStateToProps, mapDispatchToProps)(ChatRoomMessageOutLocation);
