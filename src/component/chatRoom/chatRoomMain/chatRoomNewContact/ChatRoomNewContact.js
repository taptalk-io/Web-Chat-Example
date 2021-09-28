import React, { useState } from 'react';
import './ChatRoomNewContact.scss';
import { IoIosClose } from 'react-icons/io';

var ChatRoomNewContact = () => {
  let [showNewContact, setShowNewContact] = useState(true);

  return (
    <div className={`chat-room-new-contact-wrapper ${showNewContact ? 'active-new-contact' : ''}`}>
        <div className="new-contact-action-wrapper block-user">
            <p>
                <b>Block user</b>
            </p>
        </div>

        <div className="new-contact-action-wrapper add-contact">
            <p>
                <b>Add to contacts</b>
            </p>
        </div>

        <div className="new-contact-close-wrapper">
            <div onClick={() => setShowNewContact(false)}>
                <IoIosClose />
            </div>
        </div>
    </div>
  );
}

export default ChatRoomNewContact;
