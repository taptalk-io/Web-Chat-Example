import { taptalk } from "@taptalk.io/web-sdk";

import MessageSending from "../assets/img/icon-airplane-dark.svg";
import MessageSendingWhite from "../assets/img/icon-airplane-white.svg";
import MessageSent from "../assets/img/icon-checkmark-grey-1.svg";
import MessageSentWhite from "../assets/img/icon-checkmark-grey-1-white-room-list.svg";
import MessageReceive from "../assets/img/icon-checkmark-grey-2.svg";
import MessageReceiveWhite from "../assets/img/icon-checkmark-grey-2-white.svg";
import MessageRead from "../assets/img/icon-checkmark-green-2.svg";
import MessageDelete from "../assets/img/icon-notallowed.svg";
import MessageDeleteWhite from "../assets/img/icon-notallowed-white.svg";
import MessageFail from "../assets/img/icon-alertexclamation.svg";
import MessageFailWhite from "../assets/img/icon-alertexclamation-white.svg";

const CHAT_TYPE = {
    TAPChatMessageTypeText : 1001,
    TAPChatMessageTypeImage : 1002,
    TAPChatMessageTypeVideo : 1003,
    TAPChatMessageTypeFile : 1004,
    TAPChatMessageTypeLocation : 1005,
    TAPChatMessageTypeContact : 1006,
    TAPChatMessageTypeSticker : 1007,
    TAPChatMessageTypeSystemMessage : 9001,
    TAPChatMessageTypeUnreadMessageIdentifier : 9002
  }

var HelperChat = {
    renderUserAvatarWord: (text, isGroup) => {
        let userAvatarWord = "";
        let nameSplit = text.split(" ");
        let secondName = nameSplit.length > 1 ? nameSplit[1] : '';

        if(isGroup) {
            userAvatarWord = nameSplit[0].substr(0, 1);
        }else {
            userAvatarWord = nameSplit[0].substr(0, 1);
            userAvatarWord += secondName.substr(0, 1);
        }

        return userAvatarWord.toUpperCase();
    },

    getHourMinute: (timestamp) => {
        var time = new Date(timestamp);
        return time.getHours()+":"+(time.getMinutes() < 10 ? ("0" + time.getMinutes()) : time.getMinutes())
    },

    getDateMonthYear: (timestamp) => {
        var time = new Date(timestamp);
        let date = time.getDate();
        let month = time.getMonth() + 1;

        return (date < 10 ? "0"+date : date)+"/"+(month < 10 ? "0"+month : month)+"/"+time.getFullYear();
    },

    copyToClipBoard: (str) => {
        var el = document.createElement('textarea');
        // Set value (string to be copied)
        el.value = str;
        // Set non-editable to avoid focus and move outside of view
        el.setAttribute('readonly', '');
        el.style = {position: 'absolute', left: '-9999px'};
        document.body.appendChild(el);
        // Select text inside element
        el.select();
        // Copy text to clipboard
        document.execCommand('copy');
        // Remove temporary element
        document.body.removeChild(el);
    },

    bytesToSize : (bytes) => {
        var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        if (bytes === 0) return '0 Byte';
        var i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
        return (bytes / Math.pow(1024, i)).toFixed(2).replace('.00', '') + ' ' + sizes[i];
    },

    msToTime(duration) {
        // var milliseconds = parseInt((duration % 1000) / 100),
        var seconds = Math.floor((duration / 1000) % 60),
            minutes = Math.floor((duration / (1000 * 60)) % 60),
            hours = Math.floor((duration / (1000 * 60 * 60)) % 24);

        hours = (hours < 10) ? "0" + hours : hours;
        minutes = (minutes < 10) ? "0" + minutes : minutes;
        seconds = (seconds < 10) ? "0" + seconds : seconds;

        return hours + ":" + minutes + ":" + seconds;
    },

    lineBreakRoomList(message) {
        let _message = message;

        if(_message !== null) {
            let lineBreakSplit = _message.trim().split("\n");

            if(lineBreakSplit.length > 1) {
                return lineBreakSplit[0] + "...";
            }
        }

        return _message;
    },

    replaceTagHTML(str) {
        var tagsToReplace = {
            '<': '&lt;',
            '>': '&gt;'
        };
        
        let replaceTag = (tag) => {
            return tagsToReplace[tag] || tag;
        }
        
        return str.replace(/[&<>]/g, replaceTag); 
    },

    convertUrl(inputText) {
        let regQuestingMark = /(\?)+$/;
        // let takeOutQuestionMark = "";
        // takeOutQuestionMark = inputText.match(regQuestingMark) !== null ? inputText.match(regQuestingMark) : "";
        // inputText = inputText.replace(regQuestingMark, "");

        let isHttp = (text) => {
            return text.substring(0, 7) === "http://";
        }

        let isHttps = (text) => {
            return text.substring(0, 8) === "https://";
        }

        let isW3 = (text) => {
            return text.substring(0, 4) === "www.";
        }

        let urlify = (text) => {
            let urlRegex = /((?:(?:http?|ftp)[s]*:\/\/)?[a-z0-9-%\/\&=?\.]+\.[a-z]{2,4}\/?([^\s<>\#%"\,\{\}\\|\\\^\[\]`]+)?)/gi;
            let startingWithoutSpecialChar = /^[A-Za-z0-9]/;
            
            return text.replace(urlRegex, function(url) {
                let returnValue = url;
                let _url = url;
                let rep = "";
                let c = (t) => {
                    if(startingWithoutSpecialChar.test(t)) {
                        runConvert();
                    }
                }

                let runConvert = () => {
                    if(!isHttps(url)) {
                        if(!isHttp(url)) {
                            _url = "http://"+url;
                        }
                    }

                    let _urlQuestionMark = _url.match(regQuestingMark) !== null ? url.match(regQuestingMark) : "";

                    url = url.replace(regQuestingMark, "");
                    _url = _url.replace(regQuestingMark, "");
                    // returnValue = `<a class="tap-hyperlink" target="_blank" href="${_url}">${url}</a>${takeOutQuestionMark !== "" ? takeOutQuestionMark[0] : ""}`;
                    returnValue = `<a class="tap-hyperlink" target="_blank" href="${_url}">${url}</a>${_urlQuestionMark === "" ? "" : _urlQuestionMark[0] }`;
                }

                if(startingWithoutSpecialChar.test(url)) {
                    if(isW3(url)) {
                        rep = url.replace("www.", "");
                        c(rep);
                    }else if(isHttp(url)) {
                        rep = url.replace("http://", "");
                        c(rep);
                    }else if (isHttps(url)) {
                        rep = url.replace("https://", "");
                        c(rep);
                    }else {
                        runConvert();
                    }
                }

                return returnValue;
            })
        }

        return urlify(inputText)
    },

    lineBreakChatRoom(_message) {
        return _message !== null ? this.convertUrl(_message.trim().replace(new RegExp("\n", "g"), "<br />")) : _message;
    },

    lineBreakWithoutTrim(message) {
        let _message = this.replaceTagHTML(message);
        return _message !== null ? _message.replace(new RegExp("\n", "g"), "<br />") : _message;
    },

    generateLastMessage(message) {
        let _message;
        
        let lastChatFrom = taptalk.getTaptalkActiveUser().fullname === message.user.fullname ? 'You: ' : (message.room.type === 2 ? message.user.fullname.split(" ")[0] + ": " : "");

        if(message.isDeleted) {
            if(taptalk.getTaptalkActiveUser().userID === message.user.userID) {
                _message = "You deleted this message.";
            }else {
                _message = "This deleted this message.";
            }
        }else {
            switch(message.type) {
                case 1002: //type image
                    _message = lastChatFrom + HelperChat.lineBreakRoomList(message.body);
                    break;
                case 1003: //type video
                    _message = lastChatFrom + HelperChat.lineBreakRoomList(message.body);
                    break;
                case 1004: //type file
                    _message = lastChatFrom + HelperChat.lineBreakRoomList(message.body);
                    break;
                case 9001: //type system message
                    let sender, target;

                    if(message.user.userID === taptalk.getTaptalkActiveUser().userID) {
                        sender = "You";
                    }else {
                        sender = message.user.fullname;
                    }

                    if(message.target.targetID === taptalk.getTaptalkActiveUser().userID) {
                        target = "you";
                    }else {
                        target = message.target.targetName;
                    }

                    _message =  this.lineBreakRoomList(message.body).replace("{{sender}}", sender).replace("{{target}}", target);
                    break;
                case 3021: //type waba template
                    _message = lastChatFrom + this.convertFormatTextWhatsapp(this.lineBreakRoomList(message.body));
                    break;
                default:
                    _message = lastChatFrom + this.lineBreakRoomList(message.body);
            }
        }

        return this.replaceTagHTML(_message);
    },

    renderChatStatus(message, activeRoom) {
        let messageStatus;
        let isWhite = false;

        if((activeRoom !== null) && message.room.roomID === activeRoom.roomID) {
            isWhite = true;
        }

        if(message.type !== 9001) {
            if(message.isSending) {
                messageStatus = "sending";
            }

            if(!message.isSending && !message.isDelivered) {
                messageStatus = "sent";
            }

            if(!message.isSending && message.isDelivered && !message.isRead) {
                messageStatus = "receive";
            }

            if(message.isRead) {
                messageStatus = "read";
            }

            if(message.isDeleted) {
                messageStatus = "deleted";
            }

            switch(messageStatus) {
                case "sending":
                    return isWhite ? MessageSendingWhite : MessageSending;
                case "sent":
                    return isWhite ? MessageSentWhite : MessageSent;
                case "receive":
                    return isWhite ? MessageReceiveWhite : MessageReceive;
                case "deleted":
                    return isWhite ? MessageDeleteWhite : MessageDelete;
                case "read":
                    return MessageRead;
                case "not delivered":
                    return isWhite ? MessageSentWhite : MessageSent;
                default:
                    return isWhite ? MessageFailWhite : MessageFail;
            }
        }

        return MessageFail;
    },

    resetChatRoomHeightAndInputText() {
        let elTextInput = document.getElementsByClassName("main-textarea-input")[0];
        let elChatRoomMain = document.getElementsByClassName("chat-room-main-wrapper")[0];

        if(elChatRoomMain) {
            elChatRoomMain.removeAttribute("style");
        }

        if(elTextInput) {
            elTextInput.value = "";
            elTextInput.removeAttribute("style");
        }
    },

    actionSetRoomListLastMessage(message, hashmapOfMessages, sortBy, callback, action = null) {
        const SORT_MESSAGE_BY = {
            LAST_MESSAGE: "last_message",
            CREATED_TIME: "created_time"
        }

        var user = taptalk.getTaptalkActiveUser().userID;

        let unreadCounter = () => {
            if(hashmapOfMessages[message.room.roomID]) {
                let count = hashmapOfMessages[message.room.roomID].tapTalkRoom.unreadCount;

                if(!message.isRead) {
                    if((user !== message.user.userID)) {
                        // if(!tapTalkRoom[message.room.roomID][message.localID]) {
                            count = count + 1;

                            hashmapOfMessages[message.room.roomID].tapTalkRoom.unreadCount = count;
                        // }
                    }
                }else {
                    if(count !== 0) {
                        // if(!tapTalkRooms[message.room.roomID][message.localID]) {
                            count = 0;
                            hashmapOfMessages[message.room.roomID].tapTalkRoom.unreadCount = count;
                        // }
                    }
                }
            }
        }

        //new emit action
        if(action === 'new emit') {
            unreadCounter();
            let temporaryRoomList = {};
            temporaryRoomList[message.room.roomID] = hashmapOfMessages[message.room.roomID];

            if((temporaryRoomList[message.room.roomID].tapTalkRoom.lastMessage.created !== message.created)) {
                temporaryRoomList[message.room.roomID].tapTalkRoom.lastMessage = message;
            }

            if(sortBy === SORT_MESSAGE_BY.LAST_MESSAGE) {
                delete hashmapOfMessages[message.room.roomID];

                hashmapOfMessages = Object.assign(temporaryRoomList, hashmapOfMessages);
            }
        }
        //new emit action

        //update emit action
        if(action === 'update emit') {
            if((hashmapOfMessages[message.room.roomID].tapTalkRoom.lastMessage.localID === message.localID)) {
                hashmapOfMessages[message.room.roomID].tapTalkRoom.lastMessage = message;
            }else {
                if(hashmapOfMessages[message.room.roomID].tapTalkRoom.lastMessage.created < message.created) {
                    hashmapOfMessages[message.room.roomID].tapTalkRoom.lastMessage = message;
                }
            }

            if(message.isRead) {
                unreadCounter();
            }
        }
        //update emit action

        callback(hashmapOfMessages);
    },

    setRoomListLastMessage(message, hashmapOfMessage, sortBy, isUpdate, callback) {
        let _hashmapOfMessage = {...hashmapOfMessage};

        if(!message.isHidden) {
            this.actionSetRoomListLastMessage(message, _hashmapOfMessage, sortBy, callback, isUpdate ? "update emit" : "new emit");
        }
    },

    showNotificationMessage(message) {
        try {
            const notification = new Notification(message.user.fullname, {
                body: message.body,
                icon: 'https://storage.googleapis.com/f8a350-taplive-prd-public/static/launcher/web/v0.0/image/taptalk-icon.jpg'
            });
            
            notification.onclick = function () {
                window.focus();
            };
        }catch(e) {
            console.log(e)
        }
    },

    resetHeightClearReply(replyMessage) {
        let elChatRoomMain = document.getElementsByClassName("chat-room-main-wrapper")[0];

        if(elChatRoomMain && replyMessage.message) {
            let chatRoomContainerHeight = elChatRoomMain.style.maxHeight === "" ? 158 : parseInt(elChatRoomMain.style.maxHeight.split("-")[1].replace("px", ""));
            let heightNew = 0;
            
            let setNewHeight = (height, isSet) => {
                heightNew = height;
                elChatRoomMain.style.setProperty("max-height", "calc(100vh - " + heightNew + "px)", "important");
            }

            setNewHeight(chatRoomContainerHeight - 68)
        }
    },
    
    is_aplhanumeric(c) {
        var x = c.charCodeAt();
        return ((x>=65&&x<=90)||(x>=97&&x<=122)||(x>=48&&x<=57))?true:false;
    },
    
    whatsappStyles(format,wildcard, opTag, clTag) {
        var indices = [];
        let a = "";
        for(var i = 0; i < format.length; i++) {
            if (format[i] === wildcard) {
                if(indices.length%2) {
                    if(format[i-1] === " ") {
                        a = null;
                    }else if(typeof(format[i+1])=="undefined") {
                        indices.push(i);
                    } else if(this.is_aplhanumeric(format[i+1])) {
                        a = null;
                    } else {
                        indices.push(i);
                    }
                } else {
                    if(typeof(format[i+1]) === "undefined") {
                        a = null;
                    } else if(format[i+1] === " ") {
                        a = null;
                    } else if(typeof(format[i-1]) === "undefined") {
                        indices.push(i);
                    } else if(this.is_aplhanumeric(format[i-1])) {
                        a = null;
                    } else {
                        indices.push(i);
                    }
                }
            }
            else{
                if(format[i].charCodeAt()===10 && indices.length % 2) {
                    indices.pop()
                }
            }
        }

        if(indices.length % 2) {
            indices.pop()
        }
            
        var e=0;
        
        indices.forEach(function(v,i){
            var t=(i%2)?clTag:opTag;
            v+=e;
            format=format.substr(0,v)+t+format.substr(v+1);
            e+=(t.length-1);
        });
        return format;
    },

    convertFormatTextWhatsapp(message) {
        var html = message;
        html = this.whatsappStyles(html,'_', '<i>', '</i>');
        html = this.whatsappStyles(html,'*', '<b>', '</b>');
        html = this.whatsappStyles(html,'~', '<s>', '</s>');
        html = this.whatsappStyles(html,'```', '<mono>', '</mono>');
        html = html.replace(/\n/gi,"<br>");
        // var bold = /\*(.*?)\*/gm;
        // var italic = /\_(.*?)\_/gm;
        // var strikethrough = /\~(.*?)\~/gm;
        var monospace = /\```(.*?)\```/gm;
        html = html.replace(monospace, '<mono>$1</mono>');            
        return html;
    },

    hightlightSearchKeyword(sentence, search) {
        var regex = new RegExp(search, 'gi'); 
        var result = sentence.replace(regex, (str) => {
            return '<span class="orange-text">' + str + '</span>'
        });
        
        return result;
    },

    updateMessageMentionIndexes(message, activeRoom) {
        // vm.getmentionList().remove(message.getLocalID());
        // if (TapUI.getInstance(instanceKey).isMentionUsernameDisabled() || vm.getRoom().getRoomType() == TYPE_PERSONAL) {
        //     return;
        // }
        let originalText;
        if (message.type === CHAT_TYPE.TAPChatMessageTypeText) {
            originalText = message.body;
        } else if ((message.type === CHAT_TYPE.TAPChatMessageTypeImage || message.type === CHAT_TYPE.TAPChatMessageTypeVideo) && null !== message.data) {
            originalText = message.data.caption;
        } else if (message.type === CHAT_TYPE.TAPChatMessageTypeLocation && null !== message.data) {
            originalText = message.data.address;
        } else {
            return false;
        }
        if (null == originalText) {
            return false;
        }
        let mentionIndexes = [];
        
        if (originalText.includes("@")) {
            let length = originalText.length;
            let startIndex = -1;
            for (let i = 0; i < length; i++) {
                if (originalText.charAt(i) === '@' && startIndex === -1) {
                    // Set index of @ (mention start index)
                    startIndex = i;
                } else {
                    let endOfMention = originalText.charAt(i) === ' ' || originalText.charAt(i) === '\n';

                    if (i === (length - 1) && startIndex !== -1) {
                        let endIndex = endOfMention ? i : (i + 1);
                        if (endIndex > (startIndex + 1)) {
                            mentionIndexes.push(startIndex);
                            mentionIndexes.push(endIndex);
                        }
                        startIndex = -1;
                    } else if (endOfMention && startIndex !== -1) {
                        // End index for mentioned username
                        //String username = originalText.substring(startIndex + 1, i);
                        //if (vm.getRoomParticipantsByUsername().containsKey(username)) {
                        if (i > (startIndex + 1)) {
                            mentionIndexes.push(startIndex);
                            mentionIndexes.push(i);
                        }
                        //}
                        startIndex = -1;
                    }
                }
            }
            if (mentionIndexes.length > 0) {
                return {
                    localID: [message.localID],
                    mentionIndex: mentionIndexes
                }
            }else {
                return false;
            }
        }
    },

    generateMentionSpan(body, mentionList) {
        let joinNewText = [];
        let span = body;
        
        // String.prototype.replaceBetween = function(start, end, what) {
        //     return span.substring(0, start) + what + span.substring(end);
        // };
        let indexes = mentionList;

        if (!indexes) {
            return false;
        }
        let i = 1;
        while (i < indexes.length) {
            let username = body.substring(indexes[(i - 1)] + 1, indexes[i]);
            let startIndex = i === 1 ? 0 : indexes[i - 2] + 1;
            let endIndex = i === 1 ? indexes[i - 1] : indexes[i - 1];
            
            joinNewText.push(span.substring(startIndex, endIndex));
            joinNewText.push(`<span class="tap-hyperlink" data-user="${username}" onclick="clickMention('${username}')">@${username}</span> `);
            i += 2;

            if(i > mentionList.length) {
                joinNewText.push(
                    span.length - 1 > mentionList[i - 3] + (username.length + 2) ? 
                        span.substring((mentionList[i - 3] + (username.length + 2)) , span.length)
                        : 
                        span.substring((mentionList[i - 3] + (username.length + 2)))
                );
            }
        }
        
        return joinNewText.join("");
    }
}

export default HelperChat;
