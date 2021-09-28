const INITIAL_STATE = null;

let reduxReducerActiveRoom = (state = INITIAL_STATE, action) => {
    switch (action.type) {
      case 'SET_ACTIVE_ROOM':
        return action.activeRoom;
      case 'CLEAR_ACTIVE_ROOM':
        return INITIAL_STATE;
      default:
        return state;
    }
};

export default reduxReducerActiveRoom;