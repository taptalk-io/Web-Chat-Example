export const setAppData = appData => {
    return { type: 'SET_APP_DATA', appData }
};

export const clearAppData = () => {
    return { type: 'CLEAR_APP_DATA' }
};