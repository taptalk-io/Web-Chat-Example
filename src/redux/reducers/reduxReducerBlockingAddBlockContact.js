const INITIAL_STATE = {
    isShow: false,
    user: false,
    dismiss: {}
};

let reduxReducerBlockingAddBlockContact = (state = INITIAL_STATE, action) => {
    switch (action.type) {
      case 'SET_BLOCKING_ADD_BLOCK_CONTACT':
        return action.blockingAddBlockContact;
      case 'CLEAR_BLOCKING_ADD_BLOCK_CONTACT':
        return INITIAL_STATE;
      default:
        return state;
    }
};

export default reduxReducerBlockingAddBlockContact;