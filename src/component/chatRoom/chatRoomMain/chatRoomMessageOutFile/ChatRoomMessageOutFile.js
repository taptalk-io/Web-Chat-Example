import React, { useState, useEffect } from 'react';
import './ChatRoomMessageOutFile.scss';
import { Dropdown, DropdownToggle, DropdownMenu, DropdownItem } from 'reactstrap';
import CheckMarkDoubleWhite from '../../../../assets/img/chatroom/icon-double-check-white.svg';
import CheckMarkDoubleDark from '../../../../assets/img/chatroom/icon-double-check-dark.svg';
import CheckMarkDark from '../../../../assets/img/chatroom/icon-check-dark.svg';
import AirplaneDark from '../../../../assets/img/chatroom/icon-airplane-dark.svg';
// import { FiTrash2 } from 'react-icons/fi';
import { MdInsertDriveFile } from 'react-icons/md';
// import { MdRefresh } from 'react-icons/md';
// import { MdClose } from 'react-icons/md';
import { FiDownload, FiUpload, FiTrash2, FiMoreHorizontal } from 'react-icons/fi';
import { FaReply } from 'react-icons/fa';
import HelperChat from '../../../../helper/HelperChat';
import { setActiveMessage } from '../../../../redux/actions/reduxActionActiveMessage';
import { tapCoreChatRoomManager, tapCoreMessageManager } from '@taptalk.io/web-sdk';
import { CircularProgressbar } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
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

var ChatRoomMessageOutFile = (props) => {
    let [percentageDownload, setPercentageDownload] = useState(0);
    let [bytesDownload, setBytesDownload] = useState(0);
    let [fileSrc, setFileSrc] = useState('');
    let [isFileExistInDB, setIsFileExistInDB] = useState(false);
    let [onFileDownloadProgress, setOnFileDownloadProgress] = useState(false);
    let [fileExtension, setFileExtension] = useState("");
    let [fileFromUrl, setFileFromUrl] = useState(false);

    let { 
        singleChatDataProps,
        activeUserID,
        status,
        onReplyMessage
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
        let isUnmounted = false;
        let splitFileName = singleChatDataProps.data.fileName ? singleChatDataProps.data.fileName.split(".") : singleChatDataProps.body.split('.');

        if(singleChatDataProps.data.url) {
            setFileFromUrl(true);
            setFileSrc(singleChatDataProps.data.url);
        }else if(singleChatDataProps.data.fileURL) {
            if(singleChatDataProps.data.fileURL !== "") {
                setFileFromUrl(true);
                setFileSrc(singleChatDataProps.data.fileURL);
            }else {
                setFileFromUrl(false);
                tapCoreChatRoomManager.getFileFromDB(singleChatDataProps.data.fileID, function(data) {
                    if(data) {
                        if(!isUnmounted) {
                            setFileSrc(`data:${data.type};base64,${data.file}`);
                            setIsFileExistInDB(true);
                        }
                    }else {
                        if(!isUnmounted) {
                            setIsFileExistInDB(false);
                        }
                    }
                })
            }
        }
        
        if(!isUnmounted) {
            setFileExtension(splitFileName[splitFileName.length - 1].toUpperCase());
        }

        return () => {
            isUnmounted = true;
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
}, [singleChatDataProps])

    let downloadFile = () => {
        setOnFileDownloadProgress(true);

        tapCoreChatRoomManager.downloadMessageFile(singleChatDataProps, {
            onSuccess: (data) => {
                setOnFileDownloadProgress(false);
                setFileSrc(`data:${data.contentType};base64,${data.base64}`);
                setIsFileExistInDB(true);
            },

            onProgress: (message, percentage, bytes) => {
                setPercentageDownload(percentage);
                setBytesDownload(HelperChat.bytesToSize(bytes));
            },

            onError: (errorCode, errorMessage) => {
                setOnFileDownloadProgress(false);
                console.log(errorCode, errorMessage);
            }
        })
    }

    // let getFileBase64 = () => {
    //     tapCoreChatRoomManager.getFileFromDB(singleChatDataProps.data.fileID, function(data) {
    //         if(data) {
    //             setFileSrc(`data:${data.type};base64,${data.file}`);
    //             setIsFileExistInDB(true);
    //         }else {
    //             setIsFileExistInDB(false);
    //         }
    //     })
    // }

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

    // let downloadFileToStorage = (file, fileName) => {
    //     fetch(file)
    //         .then(resp => resp.blob())
    //         .then(blob => {
    //             const url = window.URL.createObjectURL(blob);
    //             const a = document.createElement('a');
    //             const fileID = `file-${new Date().valueOf()}`;

    //             a.style.display = 'none';
    //             a.href = url;
    //             a.id = fileID;

    //             // the filename you want
    //             a.download = fileName;

    //             document.body.appendChild(a);
    //             a.click();
    //             window.URL.revokeObjectURL(url);
    //             a.remove();
    //         });
    // }

    let clickBubble = () => {
        if(isFileExistInDB || fileFromUrl) {
            window.open(fileSrc, "_blank")
        }
    }

    return (
        <div className="chat-room-message-file-out-wrapper" id={`message-${singleChatDataProps.localID}`} onTouchStart={onTouchStartEvent} onTouchEnd={onTouchEndEvent}>
            <div className="message-out-bubble"
                // style={
                //     singleChatDataProps.replyTo.localID !== "" ? 
                //         (singleChatDataProps.replyTo.messageType === CHAT_TYPE.TAPChatMessageTypeText ?
                //             {paddingTop: "64px"} 
                //             :
                //             {paddingTop: "84px"}
                //         )
                //         : 
                //         {}
                // }
            >
                <div className="click-area-file" onClick={clickBubble}>
                    {singleChatDataProps.forwardFrom.localID !== "" &&
                        <div className="forwarded-message">
                            <b>Forwarded</b>
                            
                            <p>
                                From: <b>{singleChatDataProps.forwardFrom.fullname}</b>
                            </p>
                        </div>
                    }
                    {/* <div className="replied-file-message">
                        <div className="file-icon-wrapper">
                            <MdInsertDriveFile />
                        </div>

                        <div className="file-detail-wrapper">
                            <div className="filename-wrapper">
                                <b>file.docx</b>
                            </div>
                            285 KB
                        </div>
                    </div> */}

                    {/* {forwarded &&
                        <div className="forwarded-message">
                            <b>Forwarded</b>
                            <br />
                            From: <b>Keju Manis</b>
                        </div>
                    } */}

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
                    }  */}
                    
                    {singleChatDataProps.replyTo.localID !== "" &&
                        <ChatRoomReplyOutMessage 
                            message={singleChatDataProps}
                            activeUserID={activeUserID}
                        />
                    }
                    
                    <div className="file-inner-wrapper">
                        <div className="file-icon-wrapper">
                            {/* {status === 'onprogress' ?
                                <div className="onprocess-wrapper">
                                    <MdClose />
                                </div>

                                :

                                status === 'success' ?
                                    <MdInsertDriveFile />
                                    :
                                    <MdRefresh />
                            }   */}

                            {((!isFileExistInDB && !onFileDownloadProgress && !fileFromUrl) && singleChatDataProps.percentageUpload === undefined) &&
                                <div className="icon-status-wrapper">
                                    <FiDownload onClick={() => downloadFile()} />
                                </div>
                            }

                            {(onFileDownloadProgress) && 
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
                            
                            {(isFileExistInDB || fileFromUrl) &&
                                // <a href={fileSrc} target="_blank" download={singleChatDataProps.data.fileName}>
                                // <MdInsertDriveFile onClick={() => downloadFileToStorage(fileFromUrl ? singleChatDataProps.data.url : fileSrc, singleChatDataProps.data.fileName ? singleChatDataProps.data.fileName : singleChatDataProps.body)} /> 
                                
                                // <a href={fileSrc} target="_blank" rel="noopener noreferrer">
                                    <MdInsertDriveFile />
                                // </a>
                            }
                        </div>

                        <div className="message-bubble-file-wrapper">
                            <p>
                                <b>
                                    {singleChatDataProps.data.fileName ? 
                                        singleChatDataProps.data.fileName.replace(fileExtension.toLowerCase(), '').replace('.', '')
                                        :
                                        singleChatDataProps.body.replace(fileExtension.toLowerCase(), '').replace('.', '')
                                    }
                                </b>
                            </p>

                            <div className={`file-size-and-extension ${(onFileDownloadProgress || singleChatDataProps.bytesUpload) ? 'file-size-and-extension-download-progress' : ''}`}>
                                {onFileDownloadProgress && `${bytesDownload} / `}

                                {singleChatDataProps.bytesUpload !== undefined && `${HelperChat.bytesToSize(singleChatDataProps.bytesUpload)} / `}{singleChatDataProps.data.size !== 0 && HelperChat.bytesToSize(singleChatDataProps.data.size)}{" "+fileExtension}
                            </div>
                        </div>
                    </div>

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
                    </p>

                </div>
                
                {messageActionView(singleChatDataProps)}

                {status === 'fail' &&
                    <React.Fragment>
                        <br />
                        <b className="failed-sending-file-warning">Failed to send tap to retry</b>
                    </React.Fragment>
                }
            </div>
        </div>
    );
}

const mapStateToProps = state => ({
    replyMessage: state.replyMessage
});

const mapDispatchToProps = {
  setActiveMessage
}

export default connect(mapStateToProps, mapDispatchToProps)(ChatRoomMessageOutFile);