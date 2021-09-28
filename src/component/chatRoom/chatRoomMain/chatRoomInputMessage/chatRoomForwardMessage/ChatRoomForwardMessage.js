import React, { useEffect, useState } from 'react';
import "./ChatRoomForwardMessage.scss";
import { taptalk } from "@taptalk.io/web-sdk";
import { connect } from 'react-redux';
import { FiX, FiFile } from 'react-icons/fi';
import { setForwardMessage, clearForwardMessage } from '../../../../../redux/actions/reduxActionForwardMessage';
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

let ChatRoomForwardMessage = (props) => {
    let [myAccountData, setMyAccountAccountData] = useState(false);

    useEffect(() => {
        if(props.forwardMessage.message) {  
            let myAccountData = taptalk.getTaptalkActiveUser();
            setMyAccountAccountData(myAccountData)
        }else {
            setMyAccountAccountData(false);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
}, [props.forwardMessage])

    return (
        myAccountData &&
            <div className="chat-room-forward-message-wrapper">
                <div className="chat-room-forward-message-wrapper-inner">
                    <FiX 
                        className="cancel-forward-button" 
                        onClick={() => {
                            // HelperChat.resetHeightClearReply(props.forwardMessage);
                            HelperChat.resetChatRoomHeightAndInputText();
                            props.clearForwardMessage();
                        }} 
                    />

                    <div className={`forward-content-outer-wrapper 
                                     ${(
                                         props.forwardMessage.message.type === CHAT_TYPE.TAPChatMessageTypeText ||
                                         props.forwardMessage.message.type === CHAT_TYPE.TAPChatMessageTypeLocation ||
                                         props.forwardMessage.message.type === CHAT_TYPE.MessageTypeBroadcastText ||
                                         props.forwardMessage.message.type === CHAT_TYPE.MessageTypeWhatsAppBATemplateText
                                         
                                       ) ? 
                                        "with-border" 
                                        : 
                                        ""
                                     }
                    `}>
                        {(props.forwardMessage.message.type !== CHAT_TYPE.TAPChatMessageTypeText &&
                         props.forwardMessage.message.type !== CHAT_TYPE.TAPChatMessageTypeLocation &&
                         props.forwardMessage.message.type !== CHAT_TYPE.MessageTypeBroadcastText &&
                         props.forwardMessage.message.type !== CHAT_TYPE.MessageTypeWhatsAppBATemplateText
                        ) &&
                            <div className="forward-file-media-wrapper">
                                {props.forwardMessage.message.type === CHAT_TYPE.TAPChatMessageTypeImage &&
                                    <img 
                                        src={props.forwardMessage.message.data.url ? props.forwardMessage.message.data.url: props.forwardMessage.message.data.fileURL}
                                        alt="reply" 
                                        className="forward-message-image"
                                    />
                                }

                                {props.forwardMessage.message.type === CHAT_TYPE.MessageTypeBroadcastImage &&
                                    <img 
                                        src={props.forwardMessage.message.data.url ? props.forwardMessage.message.data.url: props.forwardMessage.message.data.fileURL}
                                        alt="reply" 
                                        className="forward-message-image"
                                    />
                                }

                                {props.forwardMessage.message.type === CHAT_TYPE.MessageTypeWhatsAppBATemplateImage &&
                                    <img 
                                        src={props.forwardMessage.message.data.url ? props.forwardMessage.message.data.url: props.forwardMessage.message.data.fileURL}
                                        alt="reply" 
                                        className="forward-message-image"
                                    />
                                }

                                {props.forwardMessage.message.type === CHAT_TYPE.TAPChatMessageTypeVideo &&
                                    <video
                                        src={props.forwardMessage.message.data.url ? props.forwardMessage.message.data.url : props.forwardMessage.message.data.fileURL}
                                        className="forward-message-video"
                                    />
                                }

                                {props.forwardMessage.message.type === CHAT_TYPE.TAPChatMessageTypeFile &&
                                    <div className="forward-message-file">
                                        <FiFile />
                                    </div>
                                }
                            </div>
                        }
                        
                        <div className="forward-name-text-wrapper with-image-or-video-or-file">
                            <p className="forward-name">
                                <b>
                                    {props.forwardMessage.message.type === CHAT_TYPE.TAPChatMessageTypeFile ?
                                        `${props.forwardMessage.message.data.fileName.split(".")[0]}`
                                        :
                                        props.forwardMessage.message.user.userID === myAccountData.userID ?
                                            "You"
                                            :
                                            props.forwardMessage.message.user.fullname
                                    }
                                </b>
                            </p>

                            <p className="forward-text">
                                {props.forwardMessage.message.type === CHAT_TYPE.TAPChatMessageTypeFile ?
                                    `${HelperChat.bytesToSize(props.forwardMessage.message.data.size)} ${props.forwardMessage.message.data.fileName.split(".")[props.forwardMessage.message.data.fileName.split(".").length - 1].toUpperCase()}`
                                    :
                                    props.forwardMessage.message.body
                                }
                            </p>
                        </div>
                    </div>
                </div>
            </div>
    )
}

const mapStateToProps = state => ({
    forwardMessage: state.forwardMessage,
    activeRoom: state.activeRoom
});

const mapDispatchToProps = {
    setForwardMessage,
    clearForwardMessage
}

export default connect(mapStateToProps, mapDispatchToProps)(ChatRoomForwardMessage);