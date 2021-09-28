import React, { useState, useEffect } from 'react';
import './RoomListNewChat.scss'
import { Modal, ModalBody } from 'reactstrap';
import RoomListNewChatMain from './roomListNewChatMain/RoomListNewChatMain';
import RoomListNewContact from './roomListNewContact/RoomListNewContact';
import RoomListNewGroup from './roomListNewGroup/RoomListNewGroup';

const ACTIVE_NEW_CHAT_VIEW = {
    main: 1,
    contact: 2,
    group: 3
};

var RoomListNewChat = (props) => {    
    let [activeNewChatView, setActiveNewChatView] = useState(ACTIVE_NEW_CHAT_VIEW.main);
    let [contactLists, setContactLists] = useState(null);

    let setActiveNewChatViewAction = (view) => {
        setActiveNewChatView(view);
    };

    let setContactListAction = (contact) => {
        setContactLists(contact);
    }
    
    useEffect(() => {
        setActiveNewChatView(ACTIVE_NEW_CHAT_VIEW.main);
    // eslint-disable-next-line react-hooks/exhaustive-deps
}, [props.newChatModal])

    return (
        <Modal isOpen={props.newChatModal} className="new-chat-modal" toggle={() => props.toggleNewChatModal()} >
                <ModalBody>
                  <RoomListNewChatMain toggleNewChatModal={props.toggleNewChatModal} 
                                       active={activeNewChatView === ACTIVE_NEW_CHAT_VIEW.main}
                                       setActiveNewChatView={setActiveNewChatViewAction}
                                       setContactListProps={setContactListAction}

                  />

                  <RoomListNewContact active={activeNewChatView === ACTIVE_NEW_CHAT_VIEW.contact}
                                      setActiveNewChatView={setActiveNewChatViewAction}
                                      toggleNewChatModal={props.toggleNewChatModal}
                                      contactListsProps={contactLists}
                  />

                  <RoomListNewGroup active={activeNewChatView === ACTIVE_NEW_CHAT_VIEW.group}
                                      setActiveNewChatView={setActiveNewChatViewAction}
                                      toggleNewChatModal={props.toggleNewChatModal} 
                  />
                </ModalBody>
        </Modal>
    );
}

export default RoomListNewChat;
