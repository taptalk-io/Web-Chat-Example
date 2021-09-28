const INITIAL_STATE = false;

let reduxReducerActiveMessage = (state = INITIAL_STATE, action) => {
    switch (action.type) {
      case 'SET_ACTIVE_MESSAGE':
        return action.activeMessage;
      case 'CLEAR_ACTIVE_MESSAGE':
        return INITIAL_STATE;
      default:
        return state;
    }
};

export default reduxReducerActiveMessage;