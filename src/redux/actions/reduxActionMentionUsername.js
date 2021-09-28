export const setMentionUsername = mentionUsername => {
    return { type: 'SET_MENTION_USERNAME', mentionUsername }
};

export const clearMentionUsername = () => {
    return { type: 'CLEAR_MENTION_USERNAME' }
};