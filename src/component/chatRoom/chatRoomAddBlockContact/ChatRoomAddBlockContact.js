import React, { useState } from 'react';
import './ChatRoomAddBlockContact.scss';
import { FiX } from "react-icons/fi";
import { tapCoreContactManager, taptalk } from '@taptalk.io/web-sdk';
import Helper from '../../../helper/Helper';
import { setUserContacts } from '../../../redux/actions/reduxActionUserContacts';
import { setUserContactsNoGroup } from '../../../redux/actions/reduxActionUserContactsNoGroup';
import { setBlockingAddBlockContact } from '../../../redux/actions/reduxActionBlockingAddBlockContact';
import { connect } from 'react-redux';


let ChatRoomAddBlockContact = (props) => {
    let [loadingAddContact, setLoadingAddContact] = useState(false)

    let onClickAddToContact = () => {
        setLoadingAddContact(true);
        let _blockingAddBlockContact = {...props.blockingAddBlockContact};
        let myAccountID = taptalk.getTaptalkActiveUser().userID;
        let participantIndex = props.roomData.participants.findIndex(val => val.userID !== myAccountID);
        let otherParticipant = props.roomData.participants[participantIndex];
        let firstName = otherParticipant.fullname.substr(0, 1).toUpperCase();
    
        tapCoreContactManager.addToTapTalkContactsWithUserID(otherParticipant.userID, {
            onSuccess : (response) => {
                setLoadingAddContact(false);

                let _userContacts = {...props.userContacts};
                let _userContactsNoGroup = props.userContactsNoGroup.slice();

                if(!_userContacts[firstName]) {
                    _userContacts[firstName] = [];
                }

                _userContacts[firstName].push({user: response});
                _userContactsNoGroup.push({user: response});

                props.setUserContacts(_userContacts);
                props.setUserContactsNoGroup(_userContactsNoGroup);

                _blockingAddBlockContact.isShow = false;
                _blockingAddBlockContact.user = false;

                props.setBlockingAddBlockContact(_blockingAddBlockContact)
                Helper.doToast("Successfully added to contact")
            },

            onError : (errorCode, errorMessage) => {
                setLoadingAddContact(false);
                console.log(errorCode, errorMessage);
            }
        })
    }

    let onClickDismiss = () => {
        let _blockingAddBlockContact = {...props.blockingAddBlockContact};
        let myAccountID = taptalk.getTaptalkActiveUser().userID;
        let participantIndex = props.roomData.participants.findIndex(val => val.userID !== myAccountID);
        let otherParticipant = props.roomData.participants[participantIndex];
        _blockingAddBlockContact.isShow = false;
        _blockingAddBlockContact.dismiss[otherParticipant.userID] = otherParticipant;
        props.setBlockingAddBlockContact(_blockingAddBlockContact);
    }
    
    return (
        <div className="add-to-contact-wrapper">
            {/* <div className="add-to-contact-button block-user">
                <b>Block user</b>
            </div> */}

            <div className="add-to-contact-button add-to-contacts" onClick={onClickAddToContact}>
                {loadingAddContact &&
                    <div className="lds-ring">
                        <div /><div /><div /><div />
                    </div>
                }

                <b>Add to contacts</b>
            </div>

            <div className="close-add-to-contact">
                <FiX onClick={onClickDismiss} />
            </div>
        </div>
    )
}

const mapStateToProps = state => ({
    activeRoom: state.activeRoom,
    userContacts: state.userContacts,
    userContactsNoGroup: state.userContactsNoGroup,
    blockingAddBlockContact: state.blockingAddBlockContact
});
  
const mapDispatchToProps = {
    setUserContacts,
    setUserContactsNoGroup,
    setBlockingAddBlockContact
};
  
export default connect(mapStateToProps, mapDispatchToProps)(ChatRoomAddBlockContact);