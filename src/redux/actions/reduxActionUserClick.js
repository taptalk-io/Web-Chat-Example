export const setUserClick = userClick => {
    return { type: 'SET_USER_CLICK', userClick }
};

export const clearUserClick = () => {
    return { type: 'CLEAR_USER_CLICK' }
};