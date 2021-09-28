export const setParticipantList = participantList => {
    return { type: 'SET_PARTICIPANT_LIST', participantList }
};

export const clearParticipantList = () => {
    return { type: 'CLEAR_PARTICIPANT_LIST' }
};