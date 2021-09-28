const INITIAL_STATE = {
  message: false,
  setHeightChatRoom: false
};

let reducerReplyMessage = (state = INITIAL_STATE, action) => {
    switch (action.type) {
      case 'SET_REPLY_MESSAGE':
        return action.replyMessage;
      case 'CLEAR_REPLY_MESSAGE':
        return INITIAL_STATE;
      default:
        return state;
    }
};

export default reducerReplyMessage;