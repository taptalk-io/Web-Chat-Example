import { combineReducers } from "redux";
import appData from "./reduxReducerAppData";
import activeRoom from "./reduxReducerActiveRoom";
import previewImageOrVideo from "./reduxReducerPreviewImageOrVideo";
import replyMessage from "./reduxReducerReplyMessage";
import forwardMessage from "./reduxReducerForwardMessage";
import userContacts from "./reduxReducerUserContacts";
import userContactsNoGroup from "./reduxReducerUserContactsNoGroup";
import goToChatBubble from "./reduxReducerGoToChatBubble";
import participantList from "./reduxReducerParticipantList";
import mentionUsername from "./reduxReducerMentionUsername";
import activeMessage from "./reduxReducerActiveMessage";
import userClick from "./reduxReducerUserClick";
import blockingAddBlockContact from "./reduxReducerBlockingAddBlockContact";

const appReducer = combineReducers({
  appData,
  activeRoom,
  previewImageOrVideo,
  replyMessage,
  forwardMessage,
  userContacts,
  userContactsNoGroup,
  goToChatBubble,
  participantList,
  mentionUsername,
  activeMessage,
  userClick,
  blockingAddBlockContact
})
  
const rootReducer = (state, action) => {  
    return appReducer(state, action)
}

export default rootReducer;