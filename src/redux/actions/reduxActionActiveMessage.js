export const setActiveMessage = activeMessage => {
    return { type: 'SET_ACTIVE_MESSAGE', activeMessage }
};

export const clearActiveMessage = () => {
    return { type: 'CLEAR_ACTIVE_MESSAGE' }
};