export const setActiveRoom = activeRoom => {
    return { type: 'SET_ACTIVE_ROOM', activeRoom }
};

export const clearActiveRoom = () => {
    return { type: 'CLEAR_ACTIVE_ROOM' }
};