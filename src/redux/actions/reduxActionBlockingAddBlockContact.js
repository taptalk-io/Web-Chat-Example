export const setBlockingAddBlockContact = blockingAddBlockContact => {
    return { type: 'SET_BLOCKING_ADD_BLOCK_CONTACT', blockingAddBlockContact }
};

export const clearBlockingAddBlockContact = () => {
    return { type: 'CLEAR_BLOCKING_ADD_BLOCK_CONTACT' }
};