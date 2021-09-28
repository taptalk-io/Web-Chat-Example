const INITIAL_STATE = [];

let reduxReducerParticipantList = (state = INITIAL_STATE, action) => {
    switch (action.type) {
      case 'SET_PARTICIPANT_LIST':
        return action.participantList;
      case 'CLEAR_PARTICIPANT_LIST':
        return INITIAL_STATE;
      default:
        return state;
    }
};

export default reduxReducerParticipantList;