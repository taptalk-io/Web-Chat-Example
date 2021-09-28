import React, { useState, useEffect } from 'react';
import './ChatRoomMessageInFile.scss';
import { Dropdown, DropdownToggle, DropdownMenu, DropdownItem } from 'reactstrap';
import { FaReply } from 'react-icons/fa';
import { MdInsertDriveFile } from 'react-icons/md';
// import { MdClose } from 'react-icons/md';
import { FiDownload, FiMoreHorizontal } from 'react-icons/fi';
import HelperChat from '../../../../helper/HelperChat';
import { taptalk, tapCoreChatRoomManager } from '@taptalk.io/web-sdk';
import { CircularProgressbar } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import { setActiveMessage } from '../../../../redux/actions/reduxActionActiveMessage';
import { setUserClick } from '../../../../redux/actions/reduxActionUserClick';
import ChatRoomReplyInMessage from "../chatRoomReplyInMessage/chatRoomReplyInMessage/ChatRoomReplyInMessage";
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

var ChatRoomMessageInFile = (props) => {
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
        onReplyMessage,
        isBubbleOnViewPort
    } = props;
    let [openChatAction, setOpenChatAction] = useState(false);

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

    useEffect(() => {
        let splitFileName = singleChatDataProps.data.fileName ? singleChatDataProps.data.fileName.split('.') : singleChatDataProps.body.split('.');
        let isUnmounted = false;
        
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
        ]

        return (
            // <div className="message-action-wrapper message-action-right">
            //     <div className="message-action-button-wrapper reply-button" title="Reply" onClick={() => onClickReply()}>
            //         <FaReply />
            //     </div>

            //     {/* <div className="message-action-button-wrapper forward-button" title="Forward" onClick={() => onForwardMessage(message)}>
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
        <div className="chat-room-message-file-in-wrapper" id={`message-${singleChatDataProps.localID}`} onTouchStart={onTouchStartEvent} onTouchEnd={onTouchEndEvent}>
            {singleChatDataProps.room.type === 2 &&
                <div 
                    className="group-sender-avatar-wrapper"
                    style={{background: taptalk.getRandomColor(singleChatDataProps.user.fullname)}}
                    onClick={() => props.setUserClick(singleChatDataProps.user.username)}
                >
                    {singleChatDataProps.user.imageURL.thumbnail !== "" ? 
                        <img src={singleChatDataProps.user.imageURL.thumbnail} alt="" />
                        :
                        <b>{HelperChat.renderUserAvatarWord(singleChatDataProps.user.fullname)}</b>
                    }
                </div>
            }

            <div className="message-in-bubble"
            //     style={
            //         singleChatDataProps.replyTo.localID !== "" ? 
            //            (singleChatDataProps.replyTo.messageType === CHAT_TYPE.TAPChatMessageTypeText ?
            //                {paddingTop: "64px"} 
            //                :
            //                {paddingTop: "84px"}
            //            )
            //            : 
            //            {}
            //    }
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

                    {/* {props.forwarded &&
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
                    } */}

                    {singleChatDataProps.room.type === 2 &&
                        <p className="group-sender-name-wrapper">
                            <b>
                            {singleChatDataProps.user.fullname}
                            </b>
                        </p>
                    }

                    {singleChatDataProps.replyTo.localID !== "" &&
                        <ChatRoomReplyInMessage 
                            message={singleChatDataProps}
                            activeUserID={activeUserID}
                        />
                    }

                    <div className="file-inner-wrapper">
                        <div className="file-icon-wrapper">
                            {/* {props.status === 'onprogress' ?
                                <div className="onprocess-wrapper">
                                    <MdClose />
                                </div>

                                :

                                props.status === 'success' ?
                                    <MdInsertDriveFile />
                                    :
                                    <MdFileDownload />
                            } */}
                            {(!isFileExistInDB && !onFileDownloadProgress && !fileFromUrl) &&
                                <div className="icon-status-wrapper">
                                    <FiDownload onClick={() => downloadFile()} />
                                </div>
                            }

                            {onFileDownloadProgress && 
                                <div className="icon-status-wrapper">
                                    <div className="onprocess-wrapper">
                                        <CircularProgressbar value={percentageDownload} />
                                        {/* <MdClose onClick={() => console.log('cancel')} /> */}
                                        <FiDownload />
                                    </div>
                                </div>
                            }
                            
                            {(isFileExistInDB || fileFromUrl) &&
                                // <a href={fileSrc} target="_blank" rel="noopener noreferrer" download={singleChatDataProps.data.fileName}>
                                // <MdInsertDriveFile onClick={() => downloadFileToStorage(fileFromUrl ? singleChatDataProps.data.url : fileSrc, singleChatDataProps.data.fileName ? singleChatDataProps.data.fileName : singleChatDataProps.body)} />
                                <a href={fileSrc} target="_blank" rel="noopener noreferrer">
                                    <MdInsertDriveFile />
                                </a>
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
                            <div className={`file-size-and-extension ${onFileDownloadProgress ? 'file-size-and-extension-download-progress' : ''}`}>
                                {onFileDownloadProgress && `${bytesDownload} / `}{singleChatDataProps.data.size !== 0 && HelperChat.bytesToSize(singleChatDataProps.data.size)}{" "+fileExtension}
                            </div>
                        </div>
                    </div>

                    <p className="message-info">
                        {HelperChat.getDateMonthYear(singleChatDataProps.created)} <span className="centered-dot" /> {HelperChat.getHourMinute(singleChatDataProps.created)}
                    </p>

                </div>
                
                {messageActionView(singleChatDataProps)}
            </div>
        </div>
    );
}

const mapStateToProps = state => ({
    replyMessage: state.replyMessage
});

const mapDispatchToProps = {
  setActiveMessage,
  setUserClick
}

export default connect(mapStateToProps, mapDispatchToProps)(ChatRoomMessageInFile);
