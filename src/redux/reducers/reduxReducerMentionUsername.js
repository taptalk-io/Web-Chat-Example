const INITIAL_STATE = {
  username: false,
  userData: false
};

let reduxReducerMentionUsername = (state = INITIAL_STATE, action) => {
    switch (action.type) {
      case 'SET_MENTION_USERNAME':
        return action.mentionUsername;
      case 'CLEAR_MENTION_USERNAME':
        return INITIAL_STATE;
      default:
        return state;
    }
};

export default reduxReducerMentionUsername;