import React, { useState, useEffect } from 'react';
import { Modal, ModalBody, Dropdown, DropdownToggle, DropdownMenu, DropdownItem } from 'reactstrap';
import './ChatRoomMessageOutImage.scss';
// import { FaReply } from 'react-icons/fa';
// import { FiTrash2 } from 'react-icons/fi';
// import { MdRefresh } from 'react-icons/md';
// import { MdClose } from 'react-icons/md';
import { IoIosClose } from "react-icons/io";
import Helper from '../../../../helper/Helper';
import HelperChat from '../../../../helper/HelperChat';
import { FiDownload, FiUpload, FiTrash2, FiMoreHorizontal } from 'react-icons/fi';
import { FaReply } from 'react-icons/fa';
import CheckMarkDoubleWhite from '../../../../assets/img/chatroom/icon-double-check-white.svg';
import CheckMarkDoubleDark from '../../../../assets/img/chatroom/icon-double-check-dark.svg';
import CheckMarkDark from '../../../../assets/img/chatroom/icon-check-dark.svg';
import AirplaneDark from '../../../../assets/img/chatroom/icon-airplane-dark.svg';
import CheckMarkDoubleLight from '../../../../assets/img/chatroom/icon-double-check-light.svg';
import CheckMarkLight from '../../../../assets/img/chatroom/icon-check-light.svg';
import AirplaneLight from '../../../../assets/img/chatroom/icon-airplane-light.svg';
// import { MdInsertDriveFile } from 'react-icons/md';
import { taptalk, tapCoreChatRoomManager, tapCoreMessageManager } from '@taptalk.io/web-sdk';
import { CircularProgressbar } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import { setActiveMessage } from '../../../../redux/actions/reduxActionActiveMessage';
import ChatRoomReplyOutMessage from "../chatRoomReplyOutMessage/chatRoomReplyOutMessage/ChatRoomReplyOutMessage";
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

var ChatRoomMessageOutImage = (props) => {
    let [percentageDownload, setPercentageDownload] = useState(0);
    let [imageSrc, setImageSrc] = useState('');
    let [isImageExistInDB, setIsImageExistInDB] = useState(false);
    let [onDownloadImageProgress, setOnImageDownloadProgress] = useState(false);
    let [imageFromUrl, setImageFromUrl] = useState(false);
    let [isShowModalImage, setIsShowModalImage] = useState(false);
    let [openChatAction, setOpenChatAction] = useState(false);

    let { 
        singleChatDataProps,
        activeUserID,
        onReplyMessage,
        mentionList
    } = props;

    let delay;

    let onTouchStartEvent = () => {
        if(!singleChatDataProps.isDeleted && !isShowModalImage) {
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
                        setImageSrc(data.file);
                        setIsImageExistInDB(true);
                    }
                }else {
                    if(!isUnmounted) {
                        setImageSrc(singleChatDataProps.data.thumbnail);
                        setIsImageExistInDB(false);
                    }
                }
            })
        } 

        if(singleChatDataProps.data.url) {
            setImageFromUrl(true);
            setImageSrc(singleChatDataProps.data.url);
        }else if(singleChatDataProps.data.fileURL) {
            if(singleChatDataProps.data.fileURL !== "") {
                setImageFromUrl(true);
                setImageSrc(singleChatDataProps.data.fileURL);
            }else {
                setImageFromUrl(false);
                fetchFromDB();
            }
        }else {
            fetchFromDB();
        }

        return () => {
            isUnmounted = true;
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
}, [singleChatDataProps])

    let downloadFile = () => {
        setOnImageDownloadProgress(true);

        tapCoreChatRoomManager.downloadMessageFile(singleChatDataProps, {
            onSuccess: (data) => {
                setOnImageDownloadProgress(false);
                setImageSrc(data.base64);
                setIsImageExistInDB(true);
            },

            onProgress: (message, percentage, bytes) => {
                setPercentageDownload(percentage);
            },

            onError: (errorCode, errorMessage) => {
                setOnImageDownloadProgress(false);
                console.log(errorCode, errorMessage);
            }
        })
    }

    // let getImageBase64 = () => {
    //     tapCoreChatRoomManager.getFileFromDB(singleChatDataProps.data.fileID, function(data) {
    //         if(data) {
    //             setImageSrc(data.file);
    //             setIsImageExistInDB(true);
    //         }else {
    //             setImageSrc(singleChatDataProps.data.thumbnail);
    //             setIsImageExistInDB(false);
    //         }
    //     })
    // }

    let deleteMessageAction = (message) => {
        let messageIDs = [];
        messageIDs.push(message.messageID);
        tapCoreMessageManager.markMessageAsDeleted(message.room.roomID, messageIDs, true);
    }

    let toggleModalImage = () => {
        if(isImageExistInDB || imageFromUrl) {
            setIsShowModalImage(!isShowModalImage);
        }
    }

    let generateModalImage = () => {
        let zoomImage = (e) => {
            var zoomer = e.currentTarget;
            zoomer.style.backgroundSize = '200%';
            var offsetX = e.nativeEvent.offsetX;
            var offsetY = e.nativeEvent.offsetY;
            
            var x = offsetX/zoomer.offsetWidth*100
            var y = offsetY/zoomer.offsetHeight*100
            zoomer.style.backgroundPosition = x + '% ' + y + '%';
        }

        let zoomImageOut = (e) => {
            var zoomer = e.currentTarget;
            zoomer.style.backgroundSize = '0%';
        }
        
        return (
            <div>
              <Modal isOpen={isShowModalImage} className={'modal-image'}>
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
                            <a className="modal-preview-action-button" href={isImageExistInDB ? `data:image/png;base64, ${imageSrc}` : imageSrc} download={`taptalk_image_${new Date().valueOf()}`}>
                                <FiDownload />
                                <b>Download</b>
                            </a>
                        </div>

                        <div className="close-modal-preview-wrapper">
                            <IoIosClose className="close-modal-image" onClick={() => toggleModalImage()} />
                        </div>
                    </div>
                    
                    <div className="image-wrapper">
                        <figure 
                            className="zoom" 
                            style={{"backgroundImage": `url("${isImageExistInDB ? `data:image/png;base64, ${imageSrc}` : imageSrc}")`}} 
                            onMouseMove={(e) => zoomImage(e, imageSrc)}
                            onMouseLeave={(e) => zoomImageOut(e)}
                        >
                            <img 
                                src={isImageExistInDB ? `data:image/png;base64, ${imageSrc}` : imageSrc} 
                                alt="" 
                                className="image-preview-val"
                            />
                        </figure>
                    </div>
                </ModalBody>
              </Modal>
            </div>
        );
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
    <div className="chat-room-message-image-out-wrapper" id={`message-${singleChatDataProps.localID}`} onTouchStart={onTouchStartEvent} onTouchEnd={onTouchEndEvent}>
        <div className={`message-out-bubble ${props.status !== 'uploaded' ? 'not-sent-message-bubble' : ''}`}
            //  style={
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
            <div className={`
                bubble-image-wrapper 
                ${singleChatDataProps.data.caption !== "" ? "bubble-wrapper-with-caption" : ""}
            `}>
                {singleChatDataProps.replyTo.localID !== "" &&
                    <ChatRoomReplyOutMessage 
                        message={singleChatDataProps}
                        activeUserID={activeUserID}
                    />
                }

                {imageFromUrl ?
                    <React.Fragment>
                        <img src={imageSrc} className={`image-val image-from-url`} alt="" onClick={() => {toggleModalImage()}} />
                    </React.Fragment>
                    :
                    <React.Fragment>
                        {isImageExistInDB ? 
                            <React.Fragment>
                                <img src={'data:image/png;base64, '+imageSrc} alt="" className="image-val main-image-message" onClick={() => {toggleModalImage()}} />
                            </React.Fragment>
                            :
                            <React.Fragment>
                                <img src={'data:image/png;base64, '+imageSrc} alt="" className="thumbnail-image-message" />
                            </React.Fragment>
                        }
                        
                        {((!isImageExistInDB && !onDownloadImageProgress) && singleChatDataProps.percentageUpload === undefined && !imageFromUrl) &&
                            <div className="icon-status-wrapper">
                                <FiDownload onClick={() => downloadFile()} />
                            </div>
                        }
                            
                        {onDownloadImageProgress && 
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
                    </React.Fragment>
                }
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

            {/* <div className="dark-cover">
                {(!isImageExistInDB && !onDownloadImageProgress) &&
                    <div className="icon-status-wrapper">
                        <MdFileDownload onClick={() => downloadFile()} />
                    </div>
                }
                    
                {onDownloadImageProgress && 
                    <div className="icon-status-wrapper">
                        <div className="onprocess-wrapper">
                            <CircularProgressbar value={percentageDownload} />
                            <MdClose onClick={() => console.log('cancel')} />
                        </div>
                    </div>
                }
            </div> */}

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

        {props.status === 'fail' &&
            <React.Fragment>
                <br />
                <b className="failed-sending-file-warning">Failed to send tap to retry</b>
            </React.Fragment>
        }

        {(isImageExistInDB || imageFromUrl) && generateModalImage()}
    </div>
  );
}

const mapStateToProps = state => ({
    replyMessage: state.replyMessage
});

const mapDispatchToProps = {
  setActiveMessage
}

export default connect(mapStateToProps, mapDispatchToProps)(ChatRoomMessageOutImage);