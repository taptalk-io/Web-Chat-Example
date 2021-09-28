import React, { useState, useEffect } from 'react';
import './RoomListMyAccount.scss'
import { Modal, ModalHeader, ModalBody } from 'reactstrap';
import { FiX } from 'react-icons/fi';
import IconEdit from '../../../assets/img/icon-edit.svg';
import { Scrollbars } from 'react-custom-scrollbars';
// import { IoIosArrowForward } from "react-icons/io";
import { taptalk, tapCoreRoomListManager } from '@taptalk.io/web-sdk';
import Helper from "../../../helper/Helper";
import { connect } from 'react-redux';
import { clearActiveRoom } from '../../../redux/actions/reduxActionActiveRoom';
import iconLogout from '../../../assets/img/logout.svg';

var style = {
    scrollStyle: {
      position: "relative",
      backgroundColor: "#ff7d00",
      right: "-5px",
      width: "3px",
      borderRadius: "8px"
    }
};

var RoomListMyAccount = (props) => {
  let [newAvatar, setNewAvatar] = useState(false);
  let [waitresponseLogout, setWaitresponseLogout] = useState(false);
  let [valAvatarImage, setValAvatarImage] = useState("");
//   let [modalUnableToUpload, setModalUnableToUpload] = useState(false);
//   let [modalCancelUpload, setModalCancelUpload] = useState(false);
  let [valFullName, setValFullName] = useState('');
  let [valUsername, setValUsername] = useState('');
  let [valPhone, setValPhone] = useState('');
  let [valEmail, setValEmail] = useState('');

  useEffect(() => {
    getMyAccountData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [props.myAccountModal]);

  let getMyAccountData = () => {
      tapCoreRoomListManager.getUserByIdFromApi(taptalk.getTaptalkActiveUser().userID, {
        onSuccess: (response) => {
            setValFullName(response.user.fullname);
            setValUsername(response.user.username);
            setValPhone(response.user.phone);
            setValEmail(response.user.email);
            setValAvatarImage(response.user.imageURL.thumbnail);
        },

        onError: (errorCode, errorMessage) => {
            console.log(errorCode, errorMessage);
        }
      })
  }

  let onClickLogout = () => {
    setWaitresponseLogout(true);
    
    taptalk.logoutAndClearAllTapTalkData({
        onSuccess: (successMessage) => {
            setWaitresponseLogout(false);
            props.clearActiveRoom();
            window.location.href = "/login";
        },
        onError: (errorCode, errorMessage) => {
            setWaitresponseLogout(false);
            props.clearActiveRoom();
            window.location.href = "/login";
        }
    })
  };

//   let cancelUploadClick = () => {
//     setNewAvatar(false);
//   };

  let onChangeAvatarAction = (e) => {
    let fileType = ["image/png", "image/jpg", "image/jpeg"];
    let reader = new FileReader();

    if(fileType.includes(e.target.files[0].type)) {
        reader.onload = function(e) {
            document.getElementById("my-account-avatar-image").src = e.target.result;
        }

        reader.readAsDataURL(e.target.files[0]);

        setNewAvatar(true);
        setValAvatarImage(e.target.files[0]);

        taptalk.uploadUserPhoto(e.target.files[0], {
            onSuccess: (message) => {
                Helper.doToast(message);
                setNewAvatar(false);
            },
            onError: (errorCode, errorMessage) => {
                Helper.doToast(errorMessage, "fail")
            }
        })
    }
  }

  let generateModalUnableToUpload = () => {
      //   modalUnableToUpload
      return (
        <Modal isOpen={false} className="modal-upload-avatar" toggle={() => props.toggleMyAccountModal()} >
            <ModalBody>
                <b>Unable to upload</b>
                <p>
                    An error occurred while uploading your profile picture, would you like to try again?
                </p>

                <div className="modal-upload-avatar-button-wrapper">
                    <button className="button-cancel smaller-hover">
                        <b>Cancel</b>
                    </button>

                    <button className="button-retry smaller-hover">
                        <b>Retry</b>
                    </button>
                </div>
            </ModalBody>
        </Modal>
      )
  }

//   let toggleModalUnableToUpload = () => {

//   }

  let generateModalCancelUpload = () => {
    return (
      // modalCancelUpload
      <Modal isOpen={false} className="modal-upload-avatar" toggle={() => props.toggleMyAccountModal()} >
          <ModalBody>
              <b>Cancel Upload?</b>
              <p>
                You are uploading a picture to change your avatar. Are you sure you want to cancel this progress?
              </p>

              <div className="modal-upload-avatar-button-wrapper">
                  <button className="button-cancel smaller-hover">
                      <b>Continue</b>
                  </button>

                  <button className="button-cancel-red smaller-hover">
                      <b>Cancel Upload</b>
                  </button>
              </div>
          </ModalBody>
      </Modal>
    )
  }

//   let toggleModalCancelUpload = () => {
      
//   }

  return (
    <React.Fragment>
        <Modal isOpen={props.myAccountModal} className="my-account-modal" toggle={() => props.toggleMyAccountModal()} >
            <Scrollbars autoHide autoHideTimeout={500}
                    renderThumbVertical={props => <div {...props} style={style.scrollStyle} />}>
                <ModalHeader>
                    <div className="circle-top-background">
                        <FiX className="close-my-account" onClick={() => props.toggleMyAccountModal()} />
                        <b className="my-account-title">My Account</b>
                        <br />
                        <div className="my-account-avatar-wrapper">
                            <div className="my-account-avatar">
                                {valAvatarImage !== "" ?
                                    <img src={valAvatarImage} alt="" id="my-account-avatar-image" />
                                    :
                                    <div>
                                        {Helper.renderUserAvatarWord(valFullName, false)}
                                    </div>
                                }
                            </div>
                            
                            {/* {newAvatar &&
                                <div className="upload-avatar-progress-wrapper">
                                    <div className="upload-progress-border">
                                        <IoIosClose onClick={() => cancelUploadClick()} />
                                    </div>
                                </div>
                            } */}
                        </div>
                        
                        {!newAvatar ?
                            <label className="change-avatar-button" htmlFor="change-avatar-input">
                                <img src={IconEdit} alt="" />
                                <b>Change Avatar</b>
                                <span className="my-profile-optional">(optional)</span>
                            </label>
                            :
                            <div className="avatar-uploading-wrapper">
                                <div className="lds-ring">
                                    <div />
                                    <div />
                                    <div />
                                    <div />
                                </div>
                                <b>Uploading</b>
                            </div>
                        }

                        <input type="file" id="change-avatar-input" onChange={(e) => onChangeAvatarAction(e)} accept="image/jpeg, image/jpg, image/png" />
                    </div>
                </ModalHeader>

                <ModalBody>
                    <div className="input-my-account">
                        <label>
                            <b>Full Name</b>
                        </label>
                        <input type="text" alt="" value={valFullName} onChange={() => console.log("change")} disabled />
                    </div>

                    <div className="input-my-account">
                        <label>
                            <b>Username</b>
                        </label>
                        <input type="text" alt="" value={valUsername} onChange={() => console.log("change")} disabled />
                        <div style={{marginTop: '10px'}} />
                        <span className="username-rule">Username is always required.</span>
                        <span className="username-rule">Must be between 4-32 characters.</span>
                        <span className="username-rule">Can Only contain a-z, 0-9, underscores and dot.</span>
                        <span className="username-rule">Can't start with number or underscore or dot.</span>
                        <span className="username-rule">Can't end with underscore or dot.</span>
                        <span className="username-rule">Can't contain consecutive underscores, consecutive dot.</span>
                        <span className="username-rule">Underscore followed with dot, and otherwise.</span>
                    </div>

                    <div className="input-my-account">
                        <div className="phone-input-wrapper">
                            <label><b>Code</b></label>
                            <input type="text" className="phone-input" value={"+62"} onChange={() => console.log("change")} disabled/>
                        </div>

                        <div className="phone-input-wrapper">
                            <label><b>Phone Number</b></label>
                            <input type="text" className="phone-input" value={valPhone} onChange={() => console.log("change")} disabled />
                        </div>
                    </div>

                    <div className="input-my-account">
                        <label>
                            <b>Email Address</b> <span style={{fontSize: "13px", color: "#848484"}}>(Optional)</span>
                        </label>
                        <input type="text" alt="" value={valEmail} onChange={() => console.log("change")} disabled placeholder="e.g examole@work.com"/>
                    </div>

                    {/* <div className="input-my-account">
                        <label>
                            <b>Password</b> <span style={{fontSize: "13px", color: "#848484"}}>(Optional)</span>
                            <div className="my-accout-action-button change-password">
                                <b>Change Password</b>
                                <IoIosArrowForward />
                            </div>
                        </label>
                    </div> */}

                    <div className="input-my-account">
                        <label>
                            {waitresponseLogout ?
                                <div className="my-accout-action-button logout">
                                    <b>Logout</b>
                                    <div className="lds-ring">
                                        <div />
                                        <div />
                                        <div />
                                        <div />
                                    </div>
                                </div>
                                :
                                <div className="my-accout-action-button logout"  onClick={() => onClickLogout()}>
                                    <b>Logout</b>
                                    <img src={iconLogout} alt="" />
                                </div>
                            }
                        </label>
                    </div>
                </ModalBody>
                
                {/* <ModalFooter> */}
                    {/* <button className="orange-button">
                        Update
                    </button> */}
                {/* </ModalFooter> */}
            </Scrollbars>
        </Modal>

        {generateModalUnableToUpload()}
        {generateModalCancelUpload()}
    </React.Fragment>
  );
}

const mapDispatchToProps = {
  clearActiveRoom,
};

export default connect(null, mapDispatchToProps)(RoomListMyAccount);
