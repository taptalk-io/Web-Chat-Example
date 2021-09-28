// import { createStore } from 'redux';
// import rootReducer from '../reducers';

// let store = createStore(rootReducer);

// export default store;


import { createStore } from 'redux';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';

import autoMergeLevel2 from 'redux-persist/lib/stateReconciler/autoMergeLevel2';
import rootReducer from '../reducers';

const persistConfig = {
    key: 'root',
    storage: storage,
    blacklist: [
        'activeRoom',
        'replyMessage',
        // 'forwardMessage',
        'goToChatBubble',
        'previewImageOrVideo',
        // 'userContacts',
        'userContactsNoGroup',
        'mentionUsername',
        'activeMessage',
        'userClick',
        'blockingAddBlockContact'
    ],
    stateReconciler: autoMergeLevel2 // see "Merge Process" section for details.
};


const pReducer = persistReducer(persistConfig, rootReducer);

const store = createStore(pReducer);
export const persistor = persistStore(store);

export default store;