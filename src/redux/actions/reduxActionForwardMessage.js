export const setForwardMessage = forwardMessage => {
    return { type: 'SET_FORWARD_MESSAGE', forwardMessage }
};

export const clearForwardMessage = () => {
    return { type: 'CLEAR_FORWARD_MESSAGE' }
};