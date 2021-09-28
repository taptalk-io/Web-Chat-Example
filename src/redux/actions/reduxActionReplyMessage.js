export const setReplyMessage = replyMessage => {
    return { type: 'SET_REPLY_MESSAGE', replyMessage }
};

export const clearReplyMessage = () => {
    return { type: 'CLEAR_REPLY_MESSAGE' }
};