const INITIAL_STATE = {
  message: false,
  target: false,
  setHeightChatRoom: false
};

let reducerForwardMessage = (state = INITIAL_STATE, action) => {
    switch (action.type) {
      case 'SET_FORWARD_MESSAGE':
        return action.forwardMessage;
      case 'CLEAR_FORWARD_MESSAGE':
        return INITIAL_STATE;
      default:
        return state;
    }
};

export default reducerForwardMessage;