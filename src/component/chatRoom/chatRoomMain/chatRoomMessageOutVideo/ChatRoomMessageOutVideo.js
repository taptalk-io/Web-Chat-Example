import React, { useState, useEffect } from 'react';
import { Modal, ModalBody, Dropdown, DropdownToggle, DropdownMenu, DropdownItem } from 'reactstrap';
import './ChatRoomMessageOutVideo.scss';
// import { FaReply } from 'react-icons/fa';
import { FiTrash2, FiMoreHorizontal } from 'react-icons/fi';
import { FaPlay, FaReply } from 'react-icons/fa';
// import { MdClose } from 'react-icons/md';
// import { MdRefresh } from 'react-icons/md';
import Helper from '../../../../helper/Helper';
import HelperChat from '../../../../helper/HelperChat';
import CheckMarkDoubleWhite from '../../../../assets/img/chatroom/icon-double-check-white.svg';
import CheckMarkDoubleDark from '../../../../assets/img/chatroom/icon-double-check-dark.svg';
import CheckMarkDark from '../../../../assets/img/chatroom/icon-check-dark.svg';
import AirplaneDark from '../../../../assets/img/chatroom/icon-airplane-dark.svg';
import CheckMarkDoubleLight from '../../../../assets/img/chatroom/icon-double-check-light.svg';
import CheckMarkLight from '../../../../assets/img/chatroom/icon-check-light.svg';
import AirplaneLight from '../../../../assets/img/chatroom/icon-airplane-light.svg';
// import { MdInsertDriveFile } from 'react-icons/md';
import { FiDownload, FiUpload } from 'react-icons/fi';
import { IoIosClose } from "react-icons/io";
import { taptalk, tapCoreChatRoomManager, tapCoreMessageManager } from '@taptalk.io/web-sdk';
import { CircularProgressbar } from 'react-circular-progressbar';
import { setActiveMessage } from '../../../../redux/actions/reduxActionActiveMessage';
import 'react-circular-progressbar/dist/styles.css';
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

var ChatRoomMessageOutVideo = (props) => {
    let [percentageDownload, setPercentageDownload] = useState(0);
    let [bytesDownload, setBytesDownload] = useState(0);
    let [videoSrc, setVideoSrc] = useState('');
    let [isVideoExistInDB, setIsVideoExistInDB] = useState(false);
    let [onDownloadVideoProgress, setOnVideoDownloadProgress] = useState(false);
    let [videoFromUrl, setVideoFromUrl] = useState(false);
    let [isShowModalVideo, setIsShowModalVideo] = useState(false);
    let [openChatAction, setOpenChatAction] = useState(false);

    let { 
        singleChatDataProps,
        activeUserID,
        onReplyMessage,
        mentionList
    } = props;

    let delay;

    let onTouchStartEvent = () => {
        if(!singleChatDataProps.isDeleted && !isShowModalVideo) {
            delay = setTimeout(() => {
                props.setActiveMessage(singleChatDataProps)
            }, LONG_PRESS)
        }
    }

    let onTouchEndEvent = () => {
        clearTimeout(delay);
    }

    useEffect(() => {
        let isUnmounted = false;
        let fetchFromDB = () => {
            tapCoreChatRoomManager.getFileFromDB(singleChatDataProps.data.fileID, function(data) {
                if(data) {
                    if(!isUnmounted) {
                        setVideoSrc(data);
                        setIsVideoExistInDB(true);
                    }
                    
                }else {
                    if(!isUnmounted) {
                        setVideoSrc(singleChatDataProps.data.thumbnail);
                        setIsVideoExistInDB(false);
                    }
                }
            })
        }

        if(singleChatDataProps.data.url) {
            setVideoFromUrl(true);
            setVideoSrc(singleChatDataProps.data.url);
        }else if(singleChatDataProps.data.fileURL) {
            if(singleChatDataProps.data.fileURL !== "") {
                setVideoFromUrl(true);
                setVideoSrc(singleChatDataProps.data.fileURL);
            }else {
                setVideoFromUrl(false);
                fetchFromDB();
            }
        }else {
            fetchFromDB();
        }

        return () => {
            isUnmounted = true;
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
}, [singleChatDataProps]);

    let downloadFile = () => {
        setOnVideoDownloadProgress(true);
        
        tapCoreChatRoomManager.downloadMessageFile(singleChatDataProps, {
            onSuccess: (data) => {
                setOnVideoDownloadProgress(false);
                getVideoBase64();
                setIsVideoExistInDB(true);
            },

            onProgress: (message, percentage, bytes) => {
                setPercentageDownload(percentage);
                setBytesDownload(HelperChat.bytesToSize(bytes));
            },

            onError: (errorCode, errorMessage) => {
                setOnVideoDownloadProgress(false);
                console.log(errorCode, errorMessage);
            }
        })
    }

    let getVideoBase64 = () => {
        tapCoreChatRoomManager.getFileFromDB(singleChatDataProps.data.fileID, function(data) {
            if(data) {
                setVideoSrc(data);
                setIsVideoExistInDB(true);
            }else {
                setVideoSrc(singleChatDataProps.data.thumbnail);
                setIsVideoExistInDB(false);
            }
        })
    }

    let toggleModalVideo = () => {
        if(isVideoExistInDB || videoFromUrl) {
            setIsShowModalVideo(!isShowModalVideo);
        }
    }
    
    let generateModalVideo = () => {
        return (
            <div>
              <Modal isOpen={isShowModalVideo} className={'modal-video'}>
                <ModalBody>
                    <div className="header-modal-preview">
                        <div className="message-info-wrapper">
                            {singleChatDataProps.user.imageURL.thumbnail === "" ?
                                <div className="user-avatar-name" 
                                    style={{background: taptalk.getRandomColor(singleChatDataProps.user.fullname, singleChatDataProps.room.type === 2)}}
                                >
                                    <b>{Helper.renderUserAvatarWord(singleChatDataProps.user.fullname, singleChatDataProps.room.type === 2)}</b>
                                </div>
                                :
                                <img className="user-avatar-image" src={singleChatDataProps.user.imageURL.thumbnail} alt="" />
                            }
                            <p className="fullname-text">
                                <b>{singleChatDataProps.user.fullname}</b>
                            </p>

                            <p className="timestamp-text">
                                <b>Sent <span className="centered-dot" /> {HelperChat.getDateMonthYear(singleChatDataProps.created)} {HelperChat.getHourMinute(singleChatDataProps.created)}</b>
                            </p>
                        </div>

                        <div className="modal-preview-action-button-wrapper">
                            <a className="modal-preview-action-button" href={!videoFromUrl ? `data:${videoSrc.type};base64, ${videoSrc.file}` : videoSrc} download={`taptalk_video__${new Date().valueOf()}`}>
                                <FiDownload />
                                <b>Download</b>
                            </a>
                        </div>

                        <div className="close-modal-preview-wrapper">
                            <IoIosClose className="close-modal-image" onClick={() => toggleModalVideo()} />
                        </div>
                    </div>

                    <div className="video-wrapper">
                        {videoFromUrl ?
                            <video controls>
                                <source src={videoSrc} type="video/mp4" />
                                <source src={videoSrc} type="video/ogg" />
                            </video>
                            :
                            <video controls>
                                <source src={`data:${videoSrc.type};base64, ${videoSrc.file}`} type="video/mp4" />
                                <source src={`data:${videoSrc.type}, ${videoSrc.file}`} type="video/ogg" />
                            </video>
                        }
                    </div>
                    
                </ModalBody>
              </Modal>
            </div>
        );
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
            //     {/* <div className="message-action-button-wrapper" title="Copy to clipboard" onClick={() => HelperChat.copyToClipBoard(message.body)}>
            //         <FiCopy />
            //     </div> */}

            //     <div className="message-action-button-wrapper reply-button" title="Reply" onClick={onClickReply}>
            //         <FaReply />
            //     </div>

            //     {/* <div className="message-action-button-wrapper forward-button" title="Forward" onClick={() => onForwardMessage(message)}>
            //         <FaReply />
            //     </div> */}
                
            //     <div className="message-action-button-wrapper" title="Delete" onClick={() => deleteMessageAction(message)}>
            //         <FiTrash2 />
            //     </div>
                

            //     {/*<div className="message-action-button-wrapper forward-message" title="Forward">
            //         <FaReply />
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

    //   let renderChatStatus = (message) => {
    //     let messageStatus;
        
    //     if(message.isSending) {
    //         messageStatus = "sending";
    //     }

    //     if(!message.isSending && message.isDelivered) {
    //         messageStatus = "sent";
    //     }

    //     if(!message.isSending && message.isDelivered && !message.isRead) {
    //         messageStatus = "receive";
    //     }

    //     if(message.isRead) {
    //         messageStatus = "read";
    //     }

    //     if(!message.isDelivered) {
    //         messageStatus = "not delivered";
    //     }
        
    //     switch(messageStatus) {
    //         case "sending":
    //             return AirplaneDark;
    //         case "sent":
    //             return CheckMarkDark;
    //         case "receive":
    //             return CheckMarkDoubleDark;
    //         case "read":
    //             return CheckMarkDoubleWhite;
    //         case "not delivered":
    //             return CheckMarkDark;
    //     }
    //   }
    
    return (
        <div className="chat-room-message-video-out-wrapper" id={`message-${singleChatDataProps.localID}`} onTouchStart={onTouchStartEvent} onTouchEnd={onTouchEndEvent}>
            <div className={`message-out-bubble ${props.status !== 'uploaded' ? 'not-sent-message-bubble' : ''}`}
                // style={
                //     singleChatDataProps.replyTo.localID !== "" ? 
                //         (singleChatDataProps.replyTo.messageType === CHAT_TYPE.TAPChatMessageTypeText ?
                //             {paddingTop: "60px"} 
                //             :
                //             {paddingTop: "80px"}
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
                {/* {singleChatDataProps.replyTo.localID !== "" &&
                    <div className="reply-message reply-file">
                        {singleChatDataProps.quote.fileType !== "" &&  
                            <div className="reply-file-thumbnail">
                                {singleChatDataProps.quote.fileType === "file" ? 
                                    <MdInsertDriveFile />
                                    :
                                    <img src={''} alt="" />
                                }
                            </div>
                        }
    
                        <div className="reply-text-wrapper">
                            <p className="reply-from">
                                <b> 
                                    {singleChatDataProps.replyTo.userID === taptalk.getTaptalkActiveUser().userID ?
                                        "You"
                                        :
                                        singleChatDataProps.replyTo.fullname
                                    }
                                </b>
                            </p>
                            <p className="reply-text">{singleChatDataProps.quote.content}</p>
                        </div>
                    </div>
                } */}

                {/* ${singleChatDataProps.data.caption !== "" && singleChatDataProps.replyTo.localID !== "" ? "with-reply-caption" : ""}
                ${singleChatDataProps.data.caption === "" && singleChatDataProps.replyTo.localID !== "" ? "with-reply-no-caption" : ""}
                ${singleChatDataProps.data.caption === "" ? "bubble-wrapper-without-caption" : ""} */}
                <div 
                    className={`
                        bubble-image-wrapper 
                        ${singleChatDataProps.data.caption !== "" ? "bubble-wrapper-with-caption" : ""}
                    `}
                >
                {   singleChatDataProps.replyTo.localID !== "" &&
                        <ChatRoomReplyOutMessage 
                            message={singleChatDataProps}
                            activeUserID={activeUserID}
                        />
                    }

                    <div className={`video-inner-wrapper`}>
                        {!videoFromUrl &&
                            <span className="timer-filesize-wrapper">
                                {(singleChatDataProps.percentageUpload === undefined ?
                                    isVideoExistInDB ?
                                            HelperChat.msToTime(singleChatDataProps.data.duration)
                                            :
                                            !onDownloadVideoProgress ?
                                                HelperChat.bytesToSize(singleChatDataProps.data.size) + " - " + HelperChat.msToTime(singleChatDataProps.data.duration)
                                                :
                                                bytesDownload + " / " + HelperChat.bytesToSize(singleChatDataProps.data.size)
                                    :
                                    HelperChat.bytesToSize(singleChatDataProps.bytesUpload) + " / " + HelperChat.bytesToSize(singleChatDataProps.data.size)
                                )}
                            </span>
                        }
                        
                        {videoFromUrl ?
                            <video src={videoSrc} className="video-thumbnail" />
                            :
                            isVideoExistInDB ?
                                <video src={`data:${videoSrc.type};base64, ${videoSrc.file}`} className="video-thumbnail" />
                                :
                                <img src={'data:image/png;base64, '+singleChatDataProps.data.thumbnail} alt="" className="main-image-message" />
                        }

                        {((!isVideoExistInDB && !onDownloadVideoProgress && !videoFromUrl) && singleChatDataProps.percentageUpload === undefined) &&
                            <div className="icon-status-wrapper">
                                <FiDownload onClick={() => downloadFile()} />
                            </div>
                        }
                            
                        {onDownloadVideoProgress && 
                            <div className="icon-status-wrapper">
                                <div className="onprocess-wrapper">
                                    <CircularProgressbar value={percentageDownload} />
                                    {/* <MdClose onClick={() => console.log('cancel download')} /> */}
                                    <FiDownload />
                                </div>
                            </div>
                        }

                        {singleChatDataProps.bytesUpload !== undefined && 
                            <div className="icon-status-wrapper">
                                <div className="onprocess-wrapper">
                                    <CircularProgressbar value={singleChatDataProps.percentageUpload} />
                                    {/* <MdClose onClick={() => console.log('cancel upload')} /> */}
                                    <FiUpload />
                                </div>
                            </div>
                        }

                        {(isVideoExistInDB || videoFromUrl) &&
                            <div className="icon-status-wrapper">
                                <FaPlay onClick={() => toggleModalVideo()} />
                            </div>
                        }
                    </div>
                </div>
                
                {singleChatDataProps.data.caption !== '' && 
                    <p 
                        className="caption-text" 
                        dangerouslySetInnerHTML={{
                            __html: mentionList ?
                                HelperChat.lineBreakChatRoom(HelperChat.generateMentionSpan(HelperChat.replaceTagHTML(singleChatDataProps.data.caption), mentionList))
                                :
                                HelperChat.lineBreakChatRoom(HelperChat.replaceTagHTML(singleChatDataProps.data.caption))
                        }} 
                    />
                }

                {singleChatDataProps.data.caption === '' ?
                    <p className={`message-info message-info-dark`}>
                        {HelperChat.getDateMonthYear(singleChatDataProps.created)} <span className="centered-dot" /> {HelperChat.getHourMinute(singleChatDataProps.created)}
                
                        {(singleChatDataProps.isSending && !singleChatDataProps.isRead) &&
                            <img src={AirplaneLight} alt="" />
                        }

                        {(!singleChatDataProps.isSending && !singleChatDataProps.isDelivered && !singleChatDataProps.isRead && singleChatDataProps.data.caption === '') &&
                            <img src={CheckMarkLight} alt="" />
                        }

                        {(!singleChatDataProps.isSending && singleChatDataProps.isDelivered && !singleChatDataProps.isRead && singleChatDataProps.data.caption === '') &&
                            <img src={CheckMarkDoubleLight} alt="" />
                        }

                        {singleChatDataProps.isRead &&
                            <img src={CheckMarkDoubleWhite} alt="" />
                        }
                    </p>
                    :
                    <p className={`message-info`}>
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
                    </p>
                }

                {messageActionView(singleChatDataProps)}
            </div>

            {(isVideoExistInDB || videoFromUrl) && generateModalVideo()}
        </div>
    );
}

const mapStateToProps = state => ({
    replyMessage: state.replyMessage
});

const mapDispatchToProps = {
  setActiveMessage
}

export default connect(mapStateToProps, mapDispatchToProps)(ChatRoomMessageOutVideo);
