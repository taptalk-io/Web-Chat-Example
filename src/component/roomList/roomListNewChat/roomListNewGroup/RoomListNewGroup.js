import React, { useState } from 'react';
import './RoomListNewGroup.scss'
import RoomListNewGroupInvite from './roomListNewGroupInvite/RoomListNewGroupInvite';
import RoomListNewGroupSubject from './roomListNewGroupSubject/RoomListNewGroupSubject';

const NEW_GROUP_VIEW = {
    invite: 1,
    subject: 2,
};

var RoomListNewGroup = (props) => {
    let [newGroupView, setNewGroupView] = useState(1);
    let [arrayOfGroupMember, setArrayOfGroupMember] = useState([]);

    let setNewGroupViewAction = (view) => {
        setNewGroupView(view);
    };

    let setNewGroupMember = (arrayOfMember) => {
        setArrayOfGroupMember(arrayOfMember);
    }
    
    return (
        <div className={`new-group-content ${props.active ? 'active-new-chat-view' : ''}`}>
           <RoomListNewGroupInvite setActiveNewChatView={props.setActiveNewChatView}
                                   style={{display: newGroupView === NEW_GROUP_VIEW.invite? 'block' : 'none'}}
                                   setNewGroupViewAction={setNewGroupViewAction}
                                   activeNewGroupView={newGroupView}
                                   setNewGroupMemberProps={setNewGroupMember}
           />

           <RoomListNewGroupSubject style={{display: newGroupView === NEW_GROUP_VIEW.subject? 'block' : 'none'}} 
                                    setNewGroupViewAction={setNewGroupViewAction}
                                    activeNewGroupView={newGroupView}
                                    arrayOfGroupMemberProps={arrayOfGroupMember}
                                    toggleNewChatModal={props.toggleNewChatModal}
           />
        </div>
    );
}

export default RoomListNewGroup;
