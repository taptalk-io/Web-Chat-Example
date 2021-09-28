import React, { useState, useEffect } from 'react';
import './RoomListSetupModal.scss'
import { Modal, ModalBody } from 'reactstrap';
import ChatGreen from '../../../assets/img/roomlist/icon-chat-buble-green.svg';
import ChatRed from '../../../assets/img/roomlist/icon-chat-buble-red.svg';
import ChatGrey from '../../../assets/img/roomlist/icon-chat-buble-grey.svg';
import { MdRefresh } from 'react-icons/md';

const SETUP_ROOM_MODAL_STATUS = {
    loading: 1,
    success: 3,
    fail: 4
}

var RoomListSetupModal = (props) => {
  let [modalSetupRoomList, setModalSetupRoomList] = useState(true);

  useEffect(() => {
    if(props.setupModal === SETUP_ROOM_MODAL_STATUS.success) {
        setTimeout(() => {
            setModalSetupRoomList(false)
        }, 1000);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [props.setupModal]);
  
  let setupOnProgressModal = () => {
    return (
        <div className="setup-main-content">
            <div className="setup-image-content">
                <div className="lds-ring">
                    <div />
                    <div />
                    <div />
                    <div />
                </div>

                <img src={ChatGrey} alt="" />
            </div>
            <br />
            <b>
                Setting up your chatroom
            </b>
            <p>
                Make sure you have a stable conection
            </p>
        </div>
    )
  }

  let setupSuccessModal = () => {
    return (
        <div className="setup-main-content">
            <div className="setup-image-content setup-success">
                <img src={ChatGreen} alt="" />
            </div>
            <br />
            <b>
                Setup successful
            </b>
            <p>
                You are all set and ready to go!
            </p>
        </div>
    )
  }

  let retrySetupAction = () => {
    window.location.reload();
  }

  let setupFailModal = () => {
    return (
        <div className="setup-main-content">
            <div className="setup-image-content setup-fail">
                <img src={ChatRed} alt="" />
            </div>
            <br />
            <b>
                Setup failed
            </b>
            <p className="retry-setup" onClick={() => retrySetupAction()}>
                <b><MdRefresh />Retry setup</b>
            </p>
        </div>
    )
  }

  return (
    <Modal isOpen={modalSetupRoomList} className="setup-room-list-modal">
        <ModalBody>
            {props.setupModal === SETUP_ROOM_MODAL_STATUS.loading ?
                setupOnProgressModal()
                :
                props.setupModal === SETUP_ROOM_MODAL_STATUS.success ?
                    setupSuccessModal()
                    :
                    setupFailModal()
            }
        </ModalBody>
    </Modal>
  );
}

export default RoomListSetupModal;
