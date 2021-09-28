const INITIAL_STATE = [];

let reduxReducerUserContactNoGroup = (state = INITIAL_STATE, action) => {
    switch (action.type) {
      case 'SET_USER_CONTACTS_NO_GROUP':
        return action.userContactsNoGroup;
      case 'CLEAR_USER_CONTACTS_NO_GROUP':
        return INITIAL_STATE;
      default:
        return state;
    }
};

export default reduxReducerUserContactNoGroup;