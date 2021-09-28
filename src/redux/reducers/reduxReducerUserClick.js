const INITIAL_STATE = false;

let reduxReducerUserClick = (state = INITIAL_STATE, action) => {
    switch (action.type) {
      case 'SET_USER_CLICK':
        return action.userClick;
      case 'CLEAR_USER_CLICK':
        return INITIAL_STATE;
      default:
        return state;
    }
};

export default reduxReducerUserClick;