const INITIAL_STATE = {
    localID: false,
    roomID: false
};

let reduxReducerGoToChatBubble = (state = INITIAL_STATE, action) => {
    switch (action.type) {
      case 'SET_GO_TO_CHAT_BUBBLE':
        return action.goToChatBubble;
      case 'CLEAR_GO_TO_CHAT_BUBBLE':
        return INITIAL_STATE;
      default:
        return state;
    }
};

export default reduxReducerGoToChatBubble;