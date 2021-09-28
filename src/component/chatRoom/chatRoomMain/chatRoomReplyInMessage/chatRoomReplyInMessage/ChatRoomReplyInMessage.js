import React, { useState, useEffect } from "react";
import "./ChatRoomReplyInMessage.scss";
import { FiFile } from "react-icons/fi";
import { tapCoreChatRoomManager } from '@taptalk.io/web-sdk';
import { connect } from 'react-redux';

const CHAT_TYPE = {
    TAPChatMessageTypeText : 1001,
    TAPChatMessageTypeImage : 1002,
    TAPChatMessageTypeVideo : 1003,
    TAPChatMessageTypeFile : 1004,
    TAPChatMessageTypeLocation : 1005,
    TAPChatMessageTypeContact : 1006,
    TAPChatMessageTypeSticker : 1007,
    TAPChatMessageTypeSystemMessage : 9001,
    TAPChatMessageTypeUnreadMessageIdentifier : 9002,
    TAPChatMessageTypeCaseClosed : 3001,
    TAPChatMessageTypeLeaveReview: 3003,
    TAPChatMessageTypeLeaveReviewDisabled: 3004,
    TAPMessageTypeBroadcastText : 3011,
    TAPMessageTypeBroadcastImage : 3012,
    TAPMessageTypeBroadcastVideo : 3013,
    TAPMessageTypeBroadcastFile : 3014,
    TAPMessageTypeWhatsAppBATemplateText : 3021,
    TAPMessageTypeWhatsAppBATemplateImage : 3022,
    TAPMessageTypeWhatsAppBATemplateVideo : 3023,
    TAPMessageTypeWhatsAppBATemplateFile : 3024
}

let ChatRoomReplyInMessage = (props) => {
    let {
        message,
        activeUserID,
        scrollToReply
    } = props;

    let [replyToSrc, setReplyToSrc] = useState('');
    let [isFileInDB, setIsFileInDB] = useState(false);

    useEffect(() => {
        let fetchFromDB = () => {
            tapCoreChatRoomManager.getFileFromDB(message.quote.fileID, function(data) {
                if(data) {
                    setReplyToSrc(data.file);
                    setIsFileInDB(true);
                }else {
                    downloadFile();
                }
            })
        }

        let downloadFile = () => {
            let data = {
                room: {
                    roomID: props.activeRoom.roomID
                },
                data: {
                    fileID: message.quote.fileID
                }
            }

            tapCoreChatRoomManager.downloadMessageFile(data, {
                onSuccess: (data) => {
                    setReplyToSrc(data.base64);
                    setIsFileInDB(true);
                },
    
                onProgress: (message, percentage, bytes) => {
                    // setPercentageDownload(percentage);
                },
    
                onError: (errorCode, errorMessage) => {
                    // setOnImageDownloadProgress(false);
                    console.log(errorCode, errorMessage);
                }
            })
        }

        if(message.replyTo.messageType === CHAT_TYPE.TAPChatMessageTypeImage ||
           message.replyTo.messageType === CHAT_TYPE.TAPMessageTypeBroadcastImage ||
           message.replyTo.messageType === CHAT_TYPE.TAPMessageTypeWhatsAppBATemplateImage
        ) {
            if(!message.quote.imageURL || message.quote.imageURL === "") {
                fetchFromDB();
            }else {
                setReplyToSrc(message.quote.imageURL);
            }
        }

        if(message.replyTo.messageType === CHAT_TYPE.TAPChatMessageTypeVideo) {
            if(!message.quote.videoURL || message.quote.videoURL === "") {
                fetchFromDB();
            }else {
                setReplyToSrc(message.quote.videoURL);
            }
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
}, [message])

    // let scrollToReply = (localID) => {
    //     let targetScroll = document.querySelectorAll(".chat-room-main-content")[0];
    //     let targetLocalID = document.querySelector(`#message-${localID}`);

    //     if(targetLocalID !== null) {
    //         targetScroll.scrollTop = targetLocalID.offsetTop;
    
    //         // targetScroll.scrollTo({
    //         //     top: targetLocalID.offsetTop,
    //         //     behavior: 'smooth',
    //         // });
            
    //         targetLocalID.classList.add("highlight-chat-bubble");
    
    //         setTimeout(() => {
    //             targetLocalID.classList.remove("highlight-chat-bubble");
    //         }, 2000);
    //     }
    // }

    return (
        <div 
            className={`reply-message-in-bubble 
                        ${(
                            message.replyTo.messageType !== CHAT_TYPE.TAPChatMessageTypeText &&
                            message.replyTo.messageType !== CHAT_TYPE.TAPMessageTypeBroadcastText &&
                            message.replyTo.messageType !== CHAT_TYPE.TAPMessageTypeWhatsAppBATemplateText &&
                            message.replyTo.messageType !== CHAT_TYPE.TAPChatMessageTypeLocation
                        ) ?
                            "with-media-or-file"
                            : 
                            "" 
                        }
            `}
            onClick={() => scrollToReply(message.replyTo.localID)}
        >
            <div className={`reply-message-in-bubble-name-text-wrapper with-border 
                             ${(
                                message.replyTo.messageType !== CHAT_TYPE.TAPChatMessageTypeText &&
                                message.replyTo.messageType !== CHAT_TYPE.TAPMessageTypeBroadcastText &&
                                message.replyTo.messageType !== CHAT_TYPE.TAPMessageTypeWhatsAppBATemplateText &&
                                message.replyTo.messageType !== CHAT_TYPE.TAPChatMessageTypeLocation
                             ) ? 
                                "with-media-file" 
                                : 
                                ""}
            `}>
                {(
                    message.replyTo.messageType !== CHAT_TYPE.TAPChatMessageTypeText &&
                    message.replyTo.messageType !== CHAT_TYPE.TAPMessageTypeBroadcastText &&
                    message.replyTo.messageType !== CHAT_TYPE.TAPMessageTypeWhatsAppBATemplateText &&
                    message.replyTo.messageType !== CHAT_TYPE.TAPChatMessageTypeLocation
                ) &&
                    <div className="reply-file-media-wrapper">
                        {message.replyTo.messageType === CHAT_TYPE.TAPChatMessageTypeImage &&
                            (replyToSrc !== "" &&
                                <img 
                                    src={isFileInDB ? `data:image/png;base64, ${replyToSrc}` : replyToSrc}
                                    // src={"https://engine-dev.taptalk.io/v1/public/110/chat/file/image/3b9aec82-5e81-4fef-bb85-292ce06db4cf-1609917478?token=7fb1914db446f81691877141aa717502"}
                                    alt="reply"  
                                    className="reply-message-image"
                                />
                            )
                        }

                        {message.replyTo.messageType === CHAT_TYPE.TAPMessageTypeBroadcastImage &&
                            (replyToSrc !== "" &&
                                <img 
                                    src={isFileInDB ? `data:image/png;base64, ${replyToSrc}` : replyToSrc}
                                    // src={"https://engine-dev.taptalk.io/v1/public/110/chat/file/image/3b9aec82-5e81-4fef-bb85-292ce06db4cf-1609917478?token=7fb1914db446f81691877141aa717502"}
                                    alt="reply"  
                                    className="reply-message-image"
                                />
                            )
                        }

                        {message.replyTo.messageType === CHAT_TYPE.TAPMessageTypeWhatsAppBATemplateImage &&
                            (replyToSrc !== "" &&
                                <img 
                                    src={isFileInDB ? `data:image/png;base64, ${replyToSrc}` : replyToSrc}
                                    // src={"https://engine-dev.taptalk.io/v1/public/110/chat/file/image/3b9aec82-5e81-4fef-bb85-292ce06db4cf-1609917478?token=7fb1914db446f81691877141aa717502"}
                                    alt="reply"  
                                    className="reply-message-image"
                                />
                            )
                        }

                        {message.replyTo.messageType === CHAT_TYPE.TAPChatMessageTypeVideo &&
                            (replyToSrc !== "" &&
                                <video
                                    src={isFileInDB ? `data:video/mp4;base64, ${replyToSrc}` : replyToSrc}
                                    // src={"https://engine-dev.taptalk.io/v1/public/110/chat/file/video/b254bc0a-d786-493a-805c-7633f3ddbffc-1610093877?token=e1fc355cac5f9f28393b9391efcebcb1"}
                                    className="reply-message-video"
                                />
                            )
                        }

                        {message.replyTo.messageType === CHAT_TYPE.TAPChatMessageTypeFile &&
                            <div className="reply-message-file">
                                <FiFile />
                            </div>
                        }
                    </div>
                }

                <div className="reply-message-in-bubble-reply-name-wrapper">
                    <p className="reply-message-in-bubble-reply-name">
                        <b>{message.replyTo.userID === activeUserID ? "You" : message.quote.title}</b>
                    </p>

                    <p className="reply-message-in-bubble-reply-text">
                        {message.quote.content}
                    </p>
                </div>
            </div>
        </div>
    )
}

const mapStateToProps = state => ({
    activeRoom: state.activeRoom
});
  
const mapDispatchToProps = {
    
};
  
export default connect(mapStateToProps, mapDispatchToProps)(ChatRoomReplyInMessage);