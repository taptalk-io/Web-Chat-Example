export const setUserContacts = userContacts => {
    return { type: 'SET_USER_CONTACTS', userContacts }
};

export const clearUserContacts = () => {
    return { type: 'CLEAR_USER_CONTACTS' }
};