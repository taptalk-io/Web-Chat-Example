import React, { useEffect, useState } from 'react';
import GoogleMapReact from 'google-map-react';
import FaForward from '../../../../assets/img/chatroom/icon-forward.svg';
import { Dropdown, DropdownToggle, DropdownMenu, DropdownItem } from 'reactstrap';
import './ChatRoomMessageInLocation.scss';
import { FiCopy, FiMoreHorizontal } from 'react-icons/fi';
import { FaReply } from 'react-icons/fa';
import Helper from '../../../../helper/HelperChat';
import MessageDeleteGrey from "../../../../assets/img/icon-notallowed-grey.svg";
import MarkerMap from '../../../../assets/img/marker-map.png';
import { taptalk } from '@taptalk.io/web-sdk';
// import { MdInsertDriveFile } from 'react-icons/md';
import ChatRoomReplyInMessage from "../chatRoomReplyInMessage/chatRoomReplyInMessage/ChatRoomReplyInMessage";
import { setReplyMessage } from '../../../../redux/actions/reduxActionReplyMessage';
import { setActiveMessage } from '../../../../redux/actions/reduxActionActiveMessage';
import { setUserClick } from '../../../../redux/actions/reduxActionUserClick';
import { connect } from 'react-redux';

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

var ChatRoomMessageInLocation = (props) => {
  let { 
      singleChatDataProps,
      activeUserID,
      onReplyMessage,
      onForwardMessage,
      scrollToReply,
      mentionList,
      isBubbleOnViewPort,
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
    
    useEffect(() => {
        let el = document.querySelectorAll('.chat-room-main-content')[0];
        let element = document.querySelector(`#message-${singleChatDataProps.localID}`);
        
        let domRect = element.getBoundingClientRect();

        let logit = async () => {
            if(!singleChatDataProps.isRead && 
            (domRect.y > 0 || domRect.y < window.innerHeight) && 
            singleChatDataProps.user.userID !== taptalk.getTaptalkActiveUser().userID
            ) {
                isBubbleOnViewPort(singleChatDataProps);
            }
        }

        let watchScroll = () => {
            el.addEventListener("scroll", logit);        
        }

        watchScroll();

        return () => {
        el.removeEventListener("scroll", logit);
        };
    });

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
    ]

      return (
        //   <div className="message-action-wrapper message-action-right">  
        //         <div className="message-action-button-wrapper reply-button" title="Reply"  onClick={() => onClickReply()}>
        //             <FaReply />
        //         </div>

        //         <div className="message-action-button-wrapper forward-button" title="Forward" onClick={() => onForwardMessage(message)}>
        //             <FaReply />
        //         </div>

        //         <div className="message-action-button-wrapper" title="Copy to clipboard" onClick={() => Helper.copyToClipBoard(message.data.address)}>
        //             <FiCopy />
        //         </div>
        //    </div>
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
    <div className="chat-room-message-in-location-wrapper" id={`message-${singleChatDataProps.localID}`} onTouchStart={onTouchStartEvent} onTouchEnd={onTouchEndEvent}>
        {/* {singleChatDataProps.room.type === 2 && */}
            <div 
                className="group-sender-avatar-wrapper" 
                style={{background: taptalk.getRandomColor(singleChatDataProps.user.fullname)}} 
                onClick={() => props.setUserClick(singleChatDataProps.user.username)}
            >
                {singleChatDataProps.user.imageURL.thumbnail !== "" ? 
                    <img src={singleChatDataProps.user.imageURL.thumbnail} alt="" />
                    :
                    <b>{Helper.renderUserAvatarWord(singleChatDataProps.user.fullname)}</b>
                }
             </div>
        {/* } */}
        
        {singleChatDataProps.isDeleted ?
            <div className={`message-in-bubble deleted-bubble ${singleChatDataProps.isDeleted ? 'deleted-group-in' : ''}`}>
                <React.Fragment>
                    {singleChatDataProps.room.type === 2 &&
                        <p className="group-sender-name-wrapper">
                            <b>{singleChatDataProps.user.fullname}</b>
                        </p>
                    }

                    <img src={MessageDeleteGrey} alt="" className="deleted-icon" />
                    This message was deleted.
                </React.Fragment>
            </div> 
            :
            
            <React.Fragment>
                <div className="message-in-bubble message-in-bubble-location"
                    //  style={
                    //      singleChatDataProps.replyTo.localID !== "" ? 
                    //         (singleChatDataProps.replyTo.messageType === CHAT_TYPE.TAPChatMessageTypeText ?
                    //             {paddingTop: "64px"} 
                    //             :
                    //             {paddingTop: "84px"}
                    //         )
                    //         : 
                    //         {}
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
                    
                   <p className="group-sender-name-wrapper">
                        <b>
                           {singleChatDataProps.user.fullname}
                        </b>
                    </p>

                    {singleChatDataProps.replyTo.localID !== "" &&
                        <ChatRoomReplyInMessage 
                            message={singleChatDataProps}
                            activeUserID={activeUserID}
                            scrollToReply={scrollToReply}
                        />
                    }
                    
                    {/* {singleChatDataProps.forwardFrom.localID !== "" &&
                        <div className="forwarded-message">
                            <b>Forwarded</b>
                            <br />
                            From: <b>{singleChatDataProps.forwardFrom.fullname}</b>
                        </div>
                    } */}

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
                    </p>
                    
                    {messageActionView(singleChatDataProps)}
                </div>
            </React.Fragment>
        }
    </div>
  );
}


const mapStateToProps = state => ({
    replyMessage: state.replyMessage
});

const mapDispatchToProps = {
  setReplyMessage,
  setActiveMessage,
  setUserClick
}

export default connect(mapStateToProps, mapDispatchToProps)(ChatRoomMessageInLocation);
