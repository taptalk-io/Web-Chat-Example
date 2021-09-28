import React, { useEffect, useState } from 'react';
import "./ChatRoomReplyMessage.scss";
import { taptalk } from "@taptalk.io/web-sdk";
import { connect } from 'react-redux';
import { FiX, FiFile } from 'react-icons/fi';
import { setReplyMessage, clearReplyMessage } from '../../../../../redux/actions/reduxActionReplyMessage';
import HelperChat from '../../../../../helper/HelperChat';

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
    MessageTypeBroadcastText: 3011,
    MessageTypeBroadcastImage: 3012,
    MessageTypeWhatsAppBATemplateText: 3021,
    MessageTypeWhatsAppBATemplateImage: 3022
}

let ChatRoomReplyMessage = (props) => {
    let [myAccountData, setMyAccountAccountData] = useState(false);

    useEffect(() => {
        if(props.replyMessage.message) {  
            let myAccountData = taptalk.getTaptalkActiveUser();
            setMyAccountAccountData(myAccountData)
        }else {
            setMyAccountAccountData(false);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
}, [props.replyMessage])

    return (
        myAccountData &&
            <div className="chat-room-reply-message-wrapper">
                <div className="chat-room-reply-message-wrapper-inner">
                    <FiX 
                        className="cancel-reply-button" 
                        onClick={() => {
                            // HelperChat.resetHeightClearReply(props.replyMessage);
                            HelperChat.resetChatRoomHeightAndInputText();
                            props.clearReplyMessage();
                        }} 
                    />

                    <div className={`reply-content-outer-wrapper 
                                     ${(
                                         props.replyMessage.message.type === CHAT_TYPE.TAPChatMessageTypeText ||
                                         props.replyMessage.message.type === CHAT_TYPE.TAPChatMessageTypeLocation ||
                                         props.replyMessage.message.type === CHAT_TYPE.MessageTypeBroadcastText ||
                                         props.replyMessage.message.type === CHAT_TYPE.MessageTypeWhatsAppBATemplateText
                                         
                                       ) ? 
                                        "with-border" 
                                        : 
                                        ""
                                     }
                    `}>
                        {(props.replyMessage.message.type !== CHAT_TYPE.TAPChatMessageTypeText &&
                         props.replyMessage.message.type !== CHAT_TYPE.TAPChatMessageTypeLocation &&
                         props.replyMessage.message.type !== CHAT_TYPE.MessageTypeBroadcastText &&
                         props.replyMessage.message.type !== CHAT_TYPE.MessageTypeWhatsAppBATemplateText
                        ) &&
                            <div className="reply-file-media-wrapper">
                                {props.replyMessage.message.type === CHAT_TYPE.TAPChatMessageTypeImage &&
                                    <img 
                                        src={props.replyMessage.message.data.url ? props.replyMessage.message.data.url: props.replyMessage.message.data.fileURL}
                                        alt="reply" 
                                        className="reply-message-image"
                                    />
                                }

                                {props.replyMessage.message.type === CHAT_TYPE.MessageTypeBroadcastImage &&
                                    <img 
                                        src={props.replyMessage.message.data.url ? props.replyMessage.message.data.url: props.replyMessage.message.data.fileURL}
                                        alt="reply" 
                                        className="reply-message-image"
                                    />
                                }

                                {props.replyMessage.message.type === CHAT_TYPE.MessageTypeWhatsAppBATemplateImage &&
                                    <img 
                                        src={props.replyMessage.message.data.url ? props.replyMessage.message.data.url: props.replyMessage.message.data.fileURL}
                                        alt="reply" 
                                        className="reply-message-image"
                                    />
                                }

                                {props.replyMessage.message.type === CHAT_TYPE.TAPChatMessageTypeVideo &&
                                    <video
                                        src={props.replyMessage.message.data.url ? props.replyMessage.message.data.url : props.replyMessage.message.data.fileURL}
                                        className="reply-message-video"
                                    />
                                }

                                {props.replyMessage.message.type === CHAT_TYPE.TAPChatMessageTypeFile &&
                                    <div className="reply-message-file">
                                        <FiFile />
                                    </div>
                                }
                            </div>
                        }
                        
                        <div className="reply-name-text-wrapper with-image-or-video-or-file">
                            <p className="reply-name">
                                <b>
                                    {props.replyMessage.message.type === CHAT_TYPE.TAPChatMessageTypeFile ?
                                        `${props.replyMessage.message.data.fileName.split(".")[0]}`
                                        :
                                        props.replyMessage.message.user.userID === myAccountData.userID ?
                                            "You"
                                            :
                                            props.replyMessage.message.user.fullname
                                    }
                                </b>
                            </p>

                            <p className="reply-text">
                                {props.replyMessage.message.type === CHAT_TYPE.TAPChatMessageTypeFile ?
                                    `${HelperChat.bytesToSize(props.replyMessage.message.data.size)} ${props.replyMessage.message.data.fileName.split(".")[props.replyMessage.message.data.fileName.split(".").length - 1].toUpperCase()}`
                                    :
                                    props.replyMessage.message.body
                                }
                            </p>
                        </div>
                    </div>
                </div>
            </div>
    )
}

const mapStateToProps = state => ({
    replyMessage: state.replyMessage,
    activeRoom: state.activeRoom
});

const mapDispatchToProps = {
    setReplyMessage,
    clearReplyMessage
}

export default connect(mapStateToProps, mapDispatchToProps)(ChatRoomReplyMessage);