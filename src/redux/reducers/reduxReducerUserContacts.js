const INITIAL_STATE = {};

let reduxReducerUserContact = (state = INITIAL_STATE, action) => {
    switch (action.type) {
      case 'SET_USER_CONTACTS':
        return action.userContacts;
      case 'CLEAR_USER_CONTACTS':
        return INITIAL_STATE;
      default:
        return state;
    }
};

export default reduxReducerUserContact;