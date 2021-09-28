import React, { useState, useEffect } from 'react';
import './ChatRoomHeaderInfoModal.scss';
import iconEdit from '../../../../assets/img/iconEdit.svg';
import iconAvatar from '../../../../assets/img/iconAvatar.svg';
import iconLogout from '../../../../assets/img/logout.svg';
import iconRemove from '../../../../assets/img/icon-trash.svg';
import iconRemoveX from '../../../../assets/img/icon-remove.png';

import iconPlus from '../../../../assets/img/icon-plus.svg';
import iconMinus from '../../../../assets/img/icon-minus.svg';
import iconStar from '../../../../assets/img/icon-star.svg';
import iconChat from '../../../../assets/img/icon-chat.svg';

import Helper from '../../../../helper/Helper';
import { IoIosArrowBack } from 'react-icons/io';
import { FiPlusCircle } from 'react-icons/fi';
import { FiX } from "react-icons/fi";
import { Modal, ModalHeader, ModalBody } from 'reactstrap';
import ChatRoomHeaderInfoImage from './chatRoomHeaderInfoImage/ChatRoomHeaderInfoImage';
import ChatRoomHeaderInfoVideo from './chatRoomHeaderInfoVideo/ChatRoomHeaderInfoVideo';
import { Scrollbars } from 'react-custom-scrollbars';
import { MdChevronRight } from 'react-icons/md';
import { taptalk, tapCoreChatRoomManager, tapCoreContactManager } from '@taptalk.io/web-sdk';
import SearchBox from '../../../reuseableComponent/searchBox/SearchBox';
import { CircularProgressbar } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import { connect } from 'react-redux';
import { setActiveRoom } from '../../../../redux/actions/reduxActionActiveRoom';
import { setUserContacts } from '../../../../redux/actions/reduxActionUserContacts';
import { clearMentionUsername } from '../../../../redux/actions/reduxActionMentionUsername';

const ACTIVE_ROOM_INFO_MODAL = {
    main: 1,
    memberList: 2,
    memberDetail: 3,
    editGroup: 4,
    addMember: 5
}

var style = {
    scrollStyle: {
      position: "relative",
      backgroundColor: "#ff7d00",
      right: "-5px",
      width: "3px",
      borderRadius: "8px"
    }
};

var ChatRoomHeaderInfoModal = (props) => {
  let [roomData, setRoomData] = useState(null);
  let [roomDataOriginal, setRoomDataOriginal] = useState(null);

  let [modalFile, setModalFile] = useState(null);
  let [isModalFileShow, setIsModalFileShow] = useState(false);

  let [activeModalRoomInfo, setActiveModalRoomInfo] = useState(ACTIVE_ROOM_INFO_MODAL.main);

  let [selectedMemberArray, setSelectedMemberArray] = useState([]);

  let [groupNameVal, setGroupNameVal] = useState('');

  let [progressUploadGroupImage, setProgressUploadGroupImage] = useState(0);
  let [onProgressUploadGroupAvatar, setOnProgressUploadGroupAvatar] = useState(false);

  let [errorEditGroup, setErrorEditGroup] = useState('');
  let [onProgressEditGroup, setOnProgressEditGroup] = useState(false);

  let [onProgressDeleteMember, setOnProgressDeleteMember] = useState(false);

  let [memberDetail, setMemberDetail] = useState(null);

  let [isLoadingContact, setIsLoadingContact] = useState(false);
//   let [contactList, setContactList] = useState(null);

  let [errorMemberDetail, setErrorMemberDetail] = useState('');

  let [isLoadingPromoteDemote, setIsLoadingPromoteDemote] = useState(false);
  
  let [isMemberAdmin, setIsMemberAdmin] = useState(false);

  let [modalDeleteGroupOpen, setModalDeleteGroupOpen] = useState(false);
  let [isLoadingDeleteGroup, setIsLoadingDeleteGroup] = useState(false);
  let [errorDeleteGroup, setErrorDeleteGroup] = useState('');

  let [modalLeaveGroupOpen, setModalLeaveGroupOpen] = useState(false);
  let [isLoadingLeaveGroup, setIsLoadingLeaveGroup] = useState(false);
  let [errorLeaveGroup, setErrorLeaveGroup] = useState('');
  
  let [modalRemoveMemberOpen, setModalRemoveMemberOpen] = useState(false);
  let [isLoadingRemoveMember, setIsLoadingRemoveMember] = useState(false);
  let [errorRemoveMember, setErrorRemoveMember] = useState('');

  let [selectedAddMember, setSelectedAddMember] = useState([]);
  let [isLoadingAddMember, setIsLoadingAddMember] = useState(false);
  let [onSearchUserContactAddMember, setOnSearchUserContactAddMember] = useState(false);
  let [contactListAddMember, setContactListAddMember] = useState([]);
  let [contactListAddMemberTemp, setContactListAddMemberTemp] = useState(false);
  let [searchMember, setSearchMember] = useState("");
  let [searchContactValue, setSearchContactValue] = useState("");

  useEffect(() => {
    if(contactListAddMemberTemp) {
        setContactListAddMember(contactListAddMemberTemp.contact)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [contactListAddMemberTemp])

  useEffect(() => {
    if(roomDataOriginal !== null) {
        let result = [];
        let _roomData = {...roomDataOriginal};
        
        if(_roomData.participants.length > 0) {
            for(let i in _roomData.participants) {
                let objectKey = Object.keys(_roomData.participants[i]);
    
                for(let j in objectKey) {
                    let isString = typeof _roomData.participants[i][objectKey[j]] === "string";
                    if(_roomData.participants[i][objectKey[j]].toString().toLowerCase().includes(searchMember) && isString) {
                        result.push(_roomData.participants[i])
                        break;
                    }
                }
            }
        }
        
        _roomData.participants = result;
    
        setRoomData(_roomData);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [searchMember])

  useEffect(() => {
    if(searchContactValue.length > 0) {
        tapCoreContactManager.getFilterUserContacts(searchContactValue, {
            onContactFound: (contact) => {
                let newContactGroupSearch = {};

                contact.map((value) => {
                    let alphabetGroupName = value.user.fullname[0].toUpperCase();
                    if(newContactGroupSearch[alphabetGroupName] === undefined) {
                        newContactGroupSearch[alphabetGroupName] = [];
                        newContactGroupSearch[alphabetGroupName].push(value);
                    }else {
                        newContactGroupSearch[alphabetGroupName].push(value);
                    }
                    // setContactListAddMember(newContactGroupSearch);
                    setContactListAddMemberTemp({
                        contact: newContactGroupSearch,
                        time: new Date()
                    })
                    
                    setOnSearchUserContactAddMember(true);
                    return null;
                })
            }, 

            onContactNotFound: () => {
                setContactListAddMember([]);
                // setContactListAddMemberTemp(
                setOnSearchUserContactAddMember(true);
            }
        })
    }else {
        // setContactListAddMember(props.userContacts);
        setContactListAddMemberTemp({
            contact: props.userContacts,
            time: new Date()
        })
        setOnSearchUserContactAddMember(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [searchContactValue])

  useEffect(() => {
    if(props.activeRoom !== null) {
        setActiveModalRoomInfo(ACTIVE_ROOM_INFO_MODAL.main);
        setSelectedMemberArray([]);
        setErrorEditGroup("");
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [props.activeRoom])

  useEffect(() => {
    if(props.mentionUsername.username) {
        let memberIndex = props.participantList.findIndex(val => val.username === props.mentionUsername.username);
        
        if(memberIndex !== -1) {
            onClickViewMemberDetail(props.participantList[memberIndex]);
        }else {
            onClickViewMemberDetail(props.mentionUsername.userData);
        }
    }

  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [props.mentionUsername])

  useEffect(() => {
    if(props.roomDataProps !== null) {
        setGroupNameVal(props.roomDataProps.room.name);
    }

    setRoomData(props.roomDataProps);
    setRoomDataOriginal(props.roomDataProps);
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [props.roomDataProps])

  let searchMemberRoomInfo = (e) => {
   setSearchMember(e.target.value);
  }

  let generateModalVideoImage = () => {
    return (
        <div>
          <Modal isOpen={isModalFileShow} className={'modal-video-image'}>
            <ModalBody onClick={() => (toggleModalFile)}>
                <FiX className="close-modal-video" onClick={() => toggleModalFile()} />
                <div className="video-image-wrapper">
                    {modalFile.type ?
                        <video controls>
                            <source src={`data:${modalFile.type};base64, ${modalFile.file}`} type="video/mp4" />
                            <source src={`data:${modalFile.type};base64, ${modalFile.file}`} type="video/ogg" />
                        </video>
                        :
                        <img src={`data:image/png;base64, ${modalFile}`} alt="" />
                        // <div className="image-wrapper">
                        //     <figure 
                        //         className="zoom" 
                        //         style={{"backgroundImage": `url("${isImageExistInDB ? `data:image/png;base64, ${imageSrc}` : imageSrc}")`}} 
                        //         onMouseMove={(e) => zoomImage(e, imageSrc)}
                        //         onMouseLeave={(e) => zoomImageOut(e)}
                        //     >
                        //         <img 
                        //             src={isImageExistInDB ? `data:image/png;base64, ${imageSrc}` : imageSrc} 
                        //             alt="" 
                        //             className="image-preview-val"
                        //         />
                        //     </figure>
                        // </div>
                    }
                </div>
                
            </ModalBody>
          </Modal>
        </div>
    );
  }

  let toggleModalFile = (file = null) => {
    setIsModalFileShow(!isModalFileShow);
    setModalFile(file);
  }

  let toogleModalRoomInfo = () => {
    setActiveModalRoomInfo(ACTIVE_ROOM_INFO_MODAL.main);
    props.toggleRoomInfoModalActionprops();
  }

  let generateModalInfoMain = () => {
      let submitDeleteGroup = () => {
          setIsLoadingDeleteGroup(true);
          setErrorDeleteGroup("");
        
          tapCoreChatRoomManager.deleteGroupChatRoom(roomData.room.roomID, {
              onSuccess : (message) => {
                    setIsLoadingDeleteGroup(false);
                    props.setActiveRoom(null);
                    toogleModalRoomInfo();
              },

              onError : (errorCode, errorMessage) => {
                    setIsLoadingDeleteGroup(false);
                    setErrorDeleteGroup(errorMessage);
              }
          })
      }

      let generateModalDeleteGroup = () => {
            return (
                <Modal className="modal-info-confirmation" isOpen={modalDeleteGroupOpen}>
                    <ModalBody>
                        <b className="modal-info-confirmation-title">Delete Group</b>

                        <p className="modal-info-confirmation-desc">
                            Are you sure you want to delete this group?
                        </p>

                        {errorDeleteGroup.length > 0 &&
                            <p className="modal-info-confirmation-error"> 
                                {errorDeleteGroup}
                            </p>
                        }

                        <div className="modal-info-confirmation-button-wrapper">
                            <button onClick={() => setModalDeleteGroupOpen(false)}>
                                <b>Cancel</b>
                            </button>
                            
                            {isLoadingDeleteGroup ?
                                <button className="red-button">
                                    <div className="lds-ring">
                                        <div /><div /><div />
                                    </div>
                                </button>
                                :
                                <button className="red-button" onClick={() => submitDeleteGroup()}>
                                    <b>Delete</b>
                                </button>
                            }
                        </div>
                    </ModalBody>
                </Modal>
            )
      }

      let onClickLeaveGroup = () => {
        setModalLeaveGroupOpen(true);
        setErrorLeaveGroup('');
      }
      
      let onClickDeleteGroup = () => {
        setModalDeleteGroupOpen(true);
        setErrorDeleteGroup('');
      }

      let submitLeaveGroup = () => {
        setIsLoadingLeaveGroup(true);
        setErrorLeaveGroup("");
      
        tapCoreChatRoomManager.leaveGroupChatRoom(roomData.room.roomID, {
            onSuccess : (success, message) => {
                  setIsLoadingLeaveGroup(false);

                  if(!success) {
                    setErrorLeaveGroup(message);
                  }else {
                    props.setActiveRoom(null);
                    toogleModalRoomInfo();
                  }
            },

            onError : (errorCode, errorMessage) => {
                  setIsLoadingLeaveGroup(false);
                  setErrorLeaveGroup(errorMessage);
            }
        })
      }

      let generateModalLeaveGroup = () => {
        return (
            <Modal className="modal-info-confirmation" isOpen={modalLeaveGroupOpen}>
                <ModalBody>
                    <b className="modal-info-confirmation-title">Leave Group</b>

                    <p className="modal-info-confirmation-desc">
                        Are you sure you want to leave this group?
                    </p>

                    {errorLeaveGroup.length > 0 &&
                        <p className="modal-info-confirmation-error"> 
                            {errorLeaveGroup}
                        </p>
                    }

                    <div className="modal-info-confirmation-button-wrapper">
                        <button onClick={() => setModalLeaveGroupOpen(false)}>
                            <b>Cancel</b>
                        </button>
                        
                        {isLoadingLeaveGroup ?
                            <button className="red-button">
                                <div className="lds-ring">
                                    <div /><div /><div />
                                </div>
                            </button>
                            :
                            <button className="red-button" onClick={() => submitLeaveGroup()}>
                                <b>Leave</b>
                            </button>
                        }
                    </div>
                </ModalBody>
            </Modal>
        )
      }

      return (
            <React.Fragment>
                <ModalHeader>
                    <div className={`circle-top-background modal-room-info-content ${activeModalRoomInfo === ACTIVE_ROOM_INFO_MODAL.main ? "active-circle-modal-room-info" : ""}`}>
                        <FiX className="header-room-info-button close-room-info" onClick={() => toogleModalRoomInfo()} />
                        <b className="room-info-title">Room Info</b>
                        <br />
                        <div className="room-info-avatar-wrapper">
                            <div className="room-info-name-avatar">
                                <div className="room-info-avatar">
                                    {roomData.room.imageURL.thumbnail !== "" ?
                                        <img src={roomData.room.imageURL.thumbnail} alt="" id="room-info-avatar-image" />
                                        :
                                        <div style={{background: taptalk.getRandomColor(roomData.room.name)}}>
                                            {Helper.renderUserAvatarWord(roomData.room.name, roomData.room.type === 2)}
                                        </div>
                                    }
                                </div>
                                <br />
                                <div className="room-info-name-wrapper">
                                    <div className="room-info-name-content">
                                        <p><b>{roomData.room.name}</b></p>
                                        {roomData.room.type === 2 && <p className="p2">{roomData.participants.length} member{roomData.participants.length > 1 ? 's' : ''}</p>}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </ModalHeader>

                <ModalBody>
                    <div className="view-member-wrapper">
                        <Scrollbars autoHide autoHideTimeout={500}
                                renderThumbVertical={props => <div {...props} style={style.scrollStyle} />}
                        >
                            <div className={`modal-room-info-content ${activeModalRoomInfo === ACTIVE_ROOM_INFO_MODAL.main ? "active-modal-room-info-content" : ""}`}>
                                {roomData.room.type === 2 &&
                                    <React.Fragment>
                                        <div className="top-action-wrapper action-wrapper">
                                            <ul>
                                                <li onClick={() => {
                                                    setSelectedMemberArray([]);
                                                    setRoomData(roomDataOriginal);
                                                    setActiveModalRoomInfo(ACTIVE_ROOM_INFO_MODAL.memberList)
                                                }}>
                                                    <img src={iconAvatar} alt="" />
                                                    View Member
                                                    <MdChevronRight />
                                                </li>
                                                <li onClick={() => setActiveModalRoomInfo(ACTIVE_ROOM_INFO_MODAL.editGroup)}>
                                                    <img src={iconEdit} alt="" />
                                                    Edit Group
                                                    <MdChevronRight />
                                                </li>
                                            </ul>
                                        </div>

                                        <div className="bottom-action-wrapper action-wrapper">
                                            <ul>
                                                {roomDataOriginal.participants.length > 1 &&
                                                    <li onClick={() => onClickLeaveGroup()} className="action-red">
                                                        <img src={iconLogout} alt="" />
                                                        Leave Group
                                                    </li>
                                                }
                                                
                                                {roomDataOriginal.participants.length === 1 &&
                                                    <li onClick={() => onClickDeleteGroup()} className="action-red">
                                                        <img src={iconRemove} alt="" />
                                                        Delete Group
                                                    </li>
                                                }
                                            </ul>
                                        </div>
                                    </React.Fragment>
                                }

                                
                                <div className="shared-media-info">
                                    <b className="shared-media-title">SHARED MEDIA</b>
                                    <div className="shared-media-list-wrapper">
                                        {props.chatRoomDataForHeader !== null &&
                                            Object.keys(props.chatRoomDataForHeader).map((value, index) => {
                                                return (
                                                    !props.chatRoomDataForHeader[value].isDeleted && 
                                                        <React.Fragment key={`shared-media-${index}`}>
                                                            {props.chatRoomDataForHeader[value].type === 1002 &&
                                                                // console.log(value.data)
                                                                <ChatRoomHeaderInfoImage 
                                                                    mediaData={props.chatRoomDataForHeader[value]}
                                                                    toggleModalFileProps={toggleModalFile} 
                                                                />
                                                            }

                                                            {props.chatRoomDataForHeader[value].type === 1003 &&
                                                                <ChatRoomHeaderInfoVideo 
                                                                    mediaData={props.chatRoomDataForHeader[value]}
                                                                    toggleModalFileProps={toggleModalFile}
                                                                />
                                                            }
                                                        </React.Fragment>
                                                )
                                            })
                                        }
                                    </div>
                                </div>
                            </div>
                        </Scrollbars>
                    </div>
                </ModalBody>

                {generateModalDeleteGroup()}
                {generateModalLeaveGroup()}
            </React.Fragment>
      )
  }

  let onClickViewMemberDetail = (member) => {
    setActiveModalRoomInfo(ACTIVE_ROOM_INFO_MODAL.memberDetail);
    setMemberDetail(member);
    setErrorMemberDetail('');
    setIsLoadingContact(true);
    let findIndexAdmin = roomData.adminUserIDs.findIndex(value => value === member.userID);

    setIsMemberAdmin(findIndexAdmin === -1 ? false : true);
  }

  let generateModalMemberList = () => {
      let onClickCheckBoxMember = (e, userID) => {
          if(e.target.checked) {
              setSelectedMemberArray(selectedMemberArray => [...selectedMemberArray, userID])
          }else {
              let selectedMemberSlice = selectedMemberArray.slice();
              let selectedMemberFindIndex = selectedMemberSlice.findIndex(value => value === userID);
              selectedMemberSlice.splice(selectedMemberFindIndex, 1);
              setSelectedMemberArray(selectedMemberSlice)
          }
      }

      let onClickDeleteMember = () => {
          setOnProgressDeleteMember(true);
          
          tapCoreChatRoomManager.removeGroupChatMembers(roomData.room.roomID, selectedMemberArray, {
              onSuccess: (response) => {
                setOnProgressDeleteMember(false);
                setSelectedMemberArray([]);
              },

              onError: (errorCode, errorMessage) => {
                setOnProgressDeleteMember(false);
                setSelectedMemberArray([]);
                console.log(errorCode, errorMessage);
              }
          })
      }

      let addMemberClick = () => {
          setOnSearchUserContactAddMember(false);
          setActiveModalRoomInfo(ACTIVE_ROOM_INFO_MODAL.addMember);
          setIsLoadingContact(true);
          setSelectedAddMember([]);
          let newContactGroup = {};

          tapCoreContactManager.getAllUserContacts({
            onSuccess: (response) => {
                response.map((value) => {
                    let alphabetGroupName = value.user.fullname[0].toUpperCase();
                    
                    if(newContactGroup[alphabetGroupName] === undefined) {
                        newContactGroup[alphabetGroupName] = [];
                        newContactGroup[alphabetGroupName].push(value);
                    }else {
                        newContactGroup[alphabetGroupName].push(value);
                    }

                    // setContactList(newContactGroup);
                    props.setUserContacts(newContactGroup);
                    setContactListAddMember(newContactGroup);
                    return null;
                })

                setIsLoadingContact(false);
            },
    
            onError: (errorCode, errorMessage) => {
                setIsLoadingContact(false);
                console.log(errorCode, errorMessage);
            }
          });
      }

      return (
        <React.Fragment>
            <ModalHeader className={`member-list-header room-info-member-list ${activeModalRoomInfo === ACTIVE_ROOM_INFO_MODAL.memberList ? "active-room-info-member-list" : ""}`}> 
                <IoIosArrowBack 
                    className="header-room-info-button back-arrow-modal" 
                    onClick={() => {
                        setSearchMember("");
                        setActiveModalRoomInfo(ACTIVE_ROOM_INFO_MODAL.main);
                    }}
                />

                {selectedMemberArray.length > 0 &&
                    <span 
                        className="clear-selected-member" 
                        onClick={() => {
                            setSelectedMemberArray([]);
                        }}
                    >
                        Clear
                    </span>
                }

                <b className="room-info-title">View Members</b>
                
                <br />
                
                <SearchBox 
                    placeholder="Search Members" 
                    style={{marginTop: '32px', width: '100%'}} 
                    onChangeInputSearch={searchMemberRoomInfo} 
                    value={searchMember}
                    clearSearchingProps={() => setSearchMember("")}
                />
            </ModalHeader>

            <ModalBody className={`room-info-member-list ${activeModalRoomInfo === ACTIVE_ROOM_INFO_MODAL.memberList ? "active-room-info-member-list" : ""}`}>
                <Scrollbars autoHide autoHideTimeout={500}
                            renderThumbVertical={props => <div {...props} style={style.scrollStyle} />}
                >
                    {/* setprops.chatRoomDataForHeader */}
                    {roomData.participants.length !== 0 &&
                        <ul className="member-lists custom-checkbox">
                            {roomData.participants.map((value,index) => {
                                return (
                                    <li key={`member-list-${index}`}>
                                        <div 
                                            className="click-member-area" 
                                            onClick={() => {
                                                value.userID !== taptalk.getTaptalkActiveUser().userID && onClickViewMemberDetail(value)
                                            }}
                                        />
                                        
                                        <div className="member-list-avatar">
                                            {value.imageURL.thumbnail !== "" ?
                                                <img src={value.imageURL.thumbnail} alt="" id="room-info-avatar-image" />
                                                :
                                                <div style={{background: taptalk.getRandomColor(value.fullname)}}>
                                                    <b>{Helper.renderUserAvatarWord(value.fullname, false)}</b>
                                                </div>
                                            }
                                        </div>
                                        
                                        <div className="member-list-name-wrapper">
                                            <div className="member-list-name-content">
                                                <p><b>{value.fullname}</b></p>
                                                <span>
                                                    {roomData.adminUserIDs.findIndex((_value) => _value === value.userID) !== -1 && 'admin'}
                                                </span>
                                            </div>
                                        </div>

                                        {value.userID !== taptalk.getTaptalkActiveUser().userID &&
                                        roomData.adminUserIDs.findIndex(value => value === taptalk.getTaptalkActiveUser().userID) !== -1 &&
                                            <React.Fragment>
                                                <input type="checkbox" 
                                                    id={value.userID} 
                                                    onChange={(e) => onClickCheckBoxMember(e, value.userID)} 
                                                    checked={
                                                        selectedMemberArray.findIndex(_value => _value === value.userID) !== -1 ? true : false
                                                    }
                                                />
                                                <label htmlFor={value.userID} />
                                            </React.Fragment>
                                        }
                                    </li>
                                )
                            })}
                        </ul>
                    }

                    <div className="member-count-wrapper">
                        {roomData.participants.length === 0 ?
                            <b>No member found</b>
                            :
                            <b>{roomData.participants.length} Member{roomData.participants.length > 1 && 's'}</b>
                        }
                    </div>
                </Scrollbars>

                <div className="member-list-action-button-wrapper">
                    {selectedMemberArray.length > 0 ?
                        !onProgressDeleteMember ?
                            <button className="member-delete"
                                    onClick={() => onClickDeleteMember()}
                            >
                                <b>
                                    Delete {selectedMemberArray.length} Member{selectedMemberArray.length > 1 && 's'}
                                </b>
                            </button>
                            :
                            <button className="member-delete red-button">
                                <div className="lds-ring">
                                    <div /><div /><div />
                                </div>
                            </button>
                        :
                        roomData.adminUserIDs.findIndex(value => value === taptalk.getTaptalkActiveUser().userID) !== -1 &&
                            <button className="member-add orange-button" onClick={() => addMemberClick()}>
                                <b>
                                    <FiPlusCircle /> Add Member
                                </b>
                            </button>
                    }
                </div>
            </ModalBody>
        </React.Fragment>
      )
  }

  let onChangeGroupPhotoInputFile = (e) => {
    let targetFile = e.target.files[0];

    if((targetFile.type === 'image/jpeg') || (targetFile.type === 'image/png')) {
        setOnProgressUploadGroupAvatar(true);

        let readerGroupImage = new FileReader();
    
        readerGroupImage.onload = (_e) => {
            let _roomData = {...roomData};

            _roomData.room.imageURL.thumbnail = _e.target.result;

            setRoomData(_roomData);
            
            tapCoreChatRoomManager.updateGroupPicture(_roomData.room.roomID, targetFile, {
                onProgress: (message, percentage, bytes) => {
                    setProgressUploadGroupImage(percentage);
                },

                onSuccess: (response) => {
                    setProgressUploadGroupImage(0);
                    setOnProgressUploadGroupAvatar(false);
                },

                onError: (errorCode, errorMessage) => {
                    setOnProgressUploadGroupAvatar(false);
                    console.log(errorCode, errorMessage);
                }
            })
        }
    
        readerGroupImage.readAsDataURL(e.target.files[0]);
    }
  }

  let onClickGroupImageFile = (e) => {
      let target = document.getElementById('edit-group-avatar-file');

      target.value = null;
  }

  let submitEditGroupName = () => {
    setOnProgressEditGroup(true);
    setErrorEditGroup("");

    tapCoreChatRoomManager.updateGroupChatRoomDetails(roomData.room.roomID, groupNameVal, {
        onSuccess: (response) => {
            setOnProgressEditGroup(false);
        },

        onError: (errorCode, errorMessage) => {
            setOnProgressEditGroup(false);
            setErrorEditGroup(errorMessage);
            console.log(errorCode, errorMessage);
        }
    })
  }

  let generateModalEditGroup = () => {
      let onChangeGroupNameVal = (e) => {
        setGroupNameVal(e.target.value)
      }

      let isEmptyGroupName = () => {
        if((groupNameVal.length < 1) || (groupNameVal.replace(/\s/g, '').length === 0)) {
            return true;
        }

        return false;
      }

      return (
        <React.Fragment>
            <ModalHeader>
                <div className={`circle-top-background modal-room-info-content ${activeModalRoomInfo === ACTIVE_ROOM_INFO_MODAL.editGroup ? "active-circle-modal-room-info" : ""}`}>
                    <IoIosArrowBack 
                        style={{fontSize: '22px'}}
                        className="header-room-info-button back-arrow-modal" 
                        onClick={() => setActiveModalRoomInfo(ACTIVE_ROOM_INFO_MODAL.main)} />
                    <b className="room-info-title">Edit Group</b>
                    <br />
                    <div className="room-info-avatar-wrapper">
                        <div className="room-info-name-avatar">

                            <label htmlFor="edit-group-avatar-file" className="edit-group-avatar-file">
                                <div className="room-info-avatar" onClick={() => onClickGroupImageFile()}>
                                    {onProgressUploadGroupAvatar &&
                                        <div className="progress-upload-group-photo-wrapper">
                                            <CircularProgressbar value={progressUploadGroupImage} />
                                        </div>
                                    }

                                    {roomData.room.imageURL.thumbnail !== "" ?
                                        <img src={roomData.room.imageURL.thumbnail} alt="" id="room-info-avatar-image" />
                                        :
                                        <div style={{background: taptalk.getRandomColor(roomData.room.name)}}>
                                            {Helper.renderUserAvatarWord(roomData.room.name, roomData.room.type === 2)}
                                        </div>
                                    }
                                </div>
                            </label>

                            <input type="file" 
                                   id="edit-group-avatar-file" 
                                   onChange={(e) => onChangeGroupPhotoInputFile(e)}
                                   accept='image/*'
                            />

                            <div className="room-info-name-wrapper">
                                <div className="room-info-name-content">
                                    <p><b>Change Avatar</b></p>
                                    <span>(optional)</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </ModalHeader>

            <ModalBody className="edit-group-modal">
                <label><b>Group Name</b></label>
                <input type="text" value={groupNameVal} onChange={(e) => onChangeGroupNameVal(e)} />
                
                {errorEditGroup.length > 0 &&
                    <p className="error-edit-group">
                        {errorEditGroup}
                    </p>
                }

                {!onProgressEditGroup ?
                    <button className="orange-button"
                            disabled={isEmptyGroupName()}
                            onClick={() => submitEditGroupName()}
                    >
                        Update
                    </button>
                    :
                    <button className="orange-button">
                        <div className="lds-ring">
                            <div /><div /><div />
                        </div>
                    </button>
                }
            </ModalBody>
        </React.Fragment>
      )
  }

  let generateModalMemberDetail = () => {
    let demoteFromAdmin = () => {
        setIsLoadingPromoteDemote(true);

        tapCoreChatRoomManager.demoteGroupAdmins(props.activeRoom.roomID, [memberDetail.userID], {
            onSuccess: (room) => {
                setIsMemberAdmin(false);
                setIsLoadingPromoteDemote(false);
            },

            onError: (errorCode, errorMessage) => {
                setIsLoadingPromoteDemote(false);
                setErrorMemberDetail(errorMessage);
            }   
        })
    }

    let promoteToAdmin = () => {
        setIsLoadingPromoteDemote(true);

        tapCoreChatRoomManager.promoteGroupAdmins(props.activeRoom.roomID, [memberDetail.userID], {
            onSuccess: (room) => {
                setIsMemberAdmin(true);
                setIsLoadingPromoteDemote(false);
            },

            onError: (errorCode, errorMessage) => {
                setIsLoadingPromoteDemote(false);
                setErrorMemberDetail(errorMessage);
            }
        })
    }

    let onClickRemoveMember = (userID) => {
        setModalRemoveMemberOpen(true);
        setErrorRemoveMember('');
    }

    let submitRemoveMember = () => {
        setIsLoadingRemoveMember(true);
        setErrorRemoveMember("");
       
        tapCoreChatRoomManager.removeGroupChatMembers(roomData.room.roomID, [memberDetail.userID], {
            onSuccess : (success, message) => {
                 setIsLoadingRemoveMember(false);
 
                 if(!success) {
                    setErrorRemoveMember(message);
                 }else {
                    setModalRemoveMemberOpen(false);
                    setActiveModalRoomInfo(ACTIVE_ROOM_INFO_MODAL.memberList);
                 }
            },
 
            onError : (errorCode, errorMessage) => {
                setIsLoadingRemoveMember(false);
                setErrorRemoveMember(errorMessage);
            }
        })
    }

    let generateModalRemoveMember = () => {
        return (
            <Modal className="modal-info-confirmation" isOpen={modalRemoveMemberOpen}>
                <ModalBody>
                    <b className="modal-info-confirmation-title">Remove Member</b>

                    <p className="modal-info-confirmation-desc">
                        Are you sure you want to remove this member?
                    </p>

                    {errorRemoveMember.length > 0 &&
                        <p className="modal-info-confirmation-error"> 
                            {errorRemoveMember}
                        </p>
                    }

                    <div className="modal-info-confirmation-button-wrapper">
                        <button 
                            onClick={() => {
                                setModalRemoveMemberOpen(false);
                            }}
                        >
                            <b>Cancel</b>
                        </button>
                        
                        {isLoadingRemoveMember ?
                            <button className="red-button">
                                <div className="lds-ring">
                                    <div /><div /><div />
                                </div>
                            </button>
                            :
                            <button className="red-button" onClick={() => submitRemoveMember()}>
                                <b>Remove</b>
                            </button>
                        }
                    </div>
                </ModalBody>
            </Modal>
        )
    }

    let onClickSendMessage = () => {
        toogleModalRoomInfo();
        let newRoom = tapCoreChatRoomManager.createRoomWithOtherUser(memberDetail);

        if(newRoom.success) {
            props.setActiveRoom(newRoom.room)
        }
    }

    return (
        <React.Fragment>
            <ModalHeader>
                <div className={`circle-top-background modal-room-info-content ${activeModalRoomInfo === ACTIVE_ROOM_INFO_MODAL.memberDetail ? "active-circle-modal-room-info" : ""}`}>
                    {props.mentionUsernameTemp ?
                        <FiX 
                            className="header-room-info-button user-info-back-arrow-modal" 
                            onClick={() => {
                                toogleModalRoomInfo()
                                props.clearMentionUsernameTemp()
                                props.clearMentionUsername()
                            }}
                            style={{fontSize: '22px'}}
                        />
                        :
                        <IoIosArrowBack 
                            className="header-room-info-button user-info-back-arrow-modal" 
                            onClick={() => {
                                props.clearMentionUsername()
                                setActiveModalRoomInfo(ACTIVE_ROOM_INFO_MODAL.memberList)
                            }}
                            style={{fontSize: '22px'}}
                        />
                    }
                    <b className="room-info-title">User Info</b>
                    <br />
                    <div className="room-info-avatar-wrapper">
                        <div className="room-info-name-avatar">
                            <div className="room-info-avatar">
                                {memberDetail.imageURL.thumbnail !== "" ?
                                    <img src={memberDetail.imageURL.thumbnail} alt="" id="room-info-avatar-image" />
                                    :
                                    <div style={{background: taptalk.getRandomColor(memberDetail.fullname)}}>
                                        {Helper.renderUserAvatarWord(memberDetail.fullname, false)}
                                    </div>
                                }
                            </div>
                            
                            <br />

                            <div className="room-info-name-wrapper">
                                <div className="room-info-name-content">
                                    <p><b>{memberDetail.fullname}</b></p>
                                    <p className="color-orange font-weight-normal">@{memberDetail.username}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </ModalHeader>
                            
            <ModalBody>
                {/* {isLoadingContact ?
                    <div className="loading-contact-wrapper"> 
                        <div className="lds-ring">
                            <div /><div /><div />
                        </div>
                    </div>
                    : */}
                    <React.Fragment>
                        <div className={`modal-room-info-content ${activeModalRoomInfo === ACTIVE_ROOM_INFO_MODAL.memberDetail ? "active-modal-room-info-content" : ""}`}>
                            {roomData.room.type === 2 &&
                                <React.Fragment>
                                    <div className="top-action-wrapper action-wrapper">
                                        <ul>   
                                            {props.userContacts[memberDetail.fullname.substr(0, 1).toUpperCase()] ?
                                                ""
                                                :
                                                props.userContacts[memberDetail.fullname.substr(0, 1).toUpperCase()].findIndex(value => value.user.userID === memberDetail.userID) ===  -1 &&
                                                    <li>
                                                        <img src={iconPlus} alt="" />
                                                        Add To Contacts
                                                    </li>
                                            }

                                            {/* {contactList.findIndex(value => value.user.userID === memberDetail.userID) !==  -1 && */}
                                                <li onClick={() => onClickSendMessage()}>
                                                    <img src={iconChat} alt="" />
                                                    Send Message
                                                </li>
                                            {/* } */}

                                            {!isMemberAdmin && roomData.adminUserIDs.findIndex(value => value === taptalk.getTaptalkActiveUser().userID) !== -1 &&
                                                <li onClick={() => promoteToAdmin()}>
                                                    <img src={iconStar} alt="" />
                                                    Promote to Admin

                                                    {isLoadingPromoteDemote &&
                                                        <div className="lds-ring">
                                                            <div /><div /><div />
                                                        </div>
                                                    }
                                                </li>
                                            }

                                            {isMemberAdmin && roomData.adminUserIDs.findIndex(value => value === taptalk.getTaptalkActiveUser().userID) !== -1 &&
                                                <li onClick={() => demoteFromAdmin()}>
                                                    <img src={iconMinus} alt="" />
                                                    Demote from Admin

                                                    {isLoadingPromoteDemote &&
                                                        <div className="lds-ring">
                                                            <div /><div /><div />
                                                        </div>
                                                    }
                                                </li>
                                            }
                                        </ul>
                                    </div>

                                    <div className="bottom-action-wrapper action-wrapper">
                                        <ul>
                                            {/* {roomDataOriginal.participants.length > 2 && */}
                                            {roomData.adminUserIDs.findIndex(value => value === taptalk.getTaptalkActiveUser().userID) !== -1 &&
                                                <li onClick={() => onClickRemoveMember()}>
                                                    <img src={iconRemove} alt="" />
                                                    Remove Member
                                                </li>
                                            }
                                        </ul>
                                    </div>
                                </React.Fragment>
                            }
                        </div>
                    
                        {errorMemberDetail.length > 0 && <p className="error-member-detail">{errorMemberDetail}</p>}
                    </React.Fragment>
                {/* } */}

                {generateModalRemoveMember()}
            </ModalBody>
        </React.Fragment>
      )
  }

  let searchAddMemberRoomInfo = (e) => {
      setSearchContactValue(e.target.value);
  }

  let removeSelectedMember = (userID) => {
    let _selectedAddMember = selectedAddMember.slice();
    let findIndexSelectedAddMember =  _selectedAddMember.findIndex(value => value.userID === userID);
    _selectedAddMember.splice(findIndexSelectedAddMember, 1);

    setSelectedAddMember(_selectedAddMember);
  }   

  let onClickSubmitAddMember = () => {
      let participants = [];

      selectedAddMember.map(value => {
        participants.push(value.userID);
        return null;
      })

      setIsLoadingAddMember(true);

      tapCoreChatRoomManager.addGroupChatMembers(roomData.room.roomID, participants, {
        onSuccess : (room) => {
            setActiveModalRoomInfo(ACTIVE_ROOM_INFO_MODAL.memberList);
            setIsLoadingAddMember(false);
        },

        onError : (errorCode, errorMessage) => {
            console.log(errorCode, errorMessage);
            setIsLoadingAddMember(false);
        }
      })
  }

  let onClickCheckBoxAddMember = (e, value) => {
    let selectedMemberSlice = selectedAddMember.slice();

    if(e.target.checked) {
        if(selectedMemberSlice.length < 500) {
            selectedMemberSlice.push(value.user);
            setSelectedAddMember(selectedMemberSlice);
        }
    }else {
        let selectedMemberFindIndex = selectedMemberSlice.findIndex(_value => _value.userID === value.user.userID);
        selectedMemberSlice.splice(selectedMemberFindIndex, 1);
        setSelectedAddMember(selectedMemberSlice)
    }
  }
  
  let generateModalAddMember = () => {  
        let groupAddMemberList = () => {
            return (
                <div className="new-group-member-list-wrapper">
                        <div className="member-list-count-wrapper">
                        <b>USER{selectedAddMember.length > 1 ? "S" : ""} SELECTED ({selectedAddMember.length}/500)</b>
                        </div>
                        
                        <div className="memberlist-user-wrapper">
                            <div className="memberlist-inner-wrapper">
                                {selectedAddMember.map((value, index) => {
                                    return (
                                        <div className="memberlist-user" key={`member-list-${index}`}>
                                        
                                            {value.imageURL.thumbnail !== "" ?
                                                <div className="member-list-user-avatar">
                                                    <img src={value.imageURL.thumbnail} alt="" />
                                                </div>
                                                :
                                                <div className="member-list-user-avatar"
                                                        style={{background: taptalk.getRandomColor(value.fullname)}}
                                                >
                                                    <b>{Helper.renderUserAvatarWord(value.fullname, false)}</b>
                                                </div>
                                            }
                
                                            <p>
                                                <b>{value.userID === taptalk.getTaptalkActiveUser().userID ? "You" : value.fullname}</b>
                                            </p>

                                            {value.userID !== taptalk.getTaptalkActiveUser().userID &&
                                                <div className="remove-member-list" onClick={() => removeSelectedMember(value.userID)}>
                                                    <img src={iconRemoveX} alt="" />
                                                </div>
                                            }
                                        </div>
                                    )
                                })}
                            </div>
                        </div>

                        <div className="memberlist-submit-wrapper">
                            {isLoadingAddMember ?
                                <button className="orange-button">
                                    <div className="lds-ring">
                                        <div /><div /><div />
                                    </div>
                                </button>
                                :
                                <button className="orange-button" onClick={() => onClickSubmitAddMember()}>
                                   <FiPlusCircle /> Add Member{selectedAddMember.length > 1 ? "s" : ""}
                                </button>
                            }
                        </div>
                </div>
            )
        }

        let newGroupContactList = () => {
            return (
                <div className="new-group-contact-list-wrapper">
                    <div className="contact-by-alphabet-wrapper"
                        style={{
                            height: `calc(100vh - ${selectedAddMember.length > 0 ? '391px' : '161px'})`,
                            maxHeight: `calc(100vh - ${selectedAddMember.length > 0 ? '391px' : '161px'})`
                        }}
                    >
                        <Scrollbars autoHide autoHideTimeout={500}
                                    renderThumbVertical={props => <div {...props} style={style.scrollStyle} />}>
                            {isLoadingContact ?
                                <div className="loading-wrapper">
                                    <div className="lds-ring">
                                        <div /><div /><div />
                                    </div>
                                </div>
                                :
                                
                                contactListAddMember !== null &&
                                    Object.keys(contactListAddMember).map((value, index) => {
                                        return (
                                            <div key={`contact-alphabet-${index}`}>
                                                <p className="contact-alphabet"><b>{value}</b></p>
                                                
                                                {contactListAddMember[value].map((_value, _index) => {
                                                    return (
                                                        <div className="contact-name-wrapper custom-checkbox" key={`contact-${_value}-${_index}`}>
                                                            <div className="user-avatar-wrapper"
                                                                style={{background: taptalk.getRandomColor(_value.user.fullname)}}
                                                            >
                                                                {_value.user.imageURL.thumbnail === "" ?
                                                                    <b>{Helper.renderUserAvatarWord(_value.user.fullname, false)}</b>
                                                                    :
                                                                    <img src={_value.user.imageURL.thumbnail} alt="" />
                                                                }
                                                            </div>
                                                            
                                                            <div className="contact-name">
                                                                <p>
                                                                    <b>{_value.user.fullname}</b>
                                                                </p>
                                                                <p className="contact-username">@{_value.user.username}</p>
                                                            </div>
                                                            
                                                            <React.Fragment>
                                                                <input type="checkbox" 
                                                                    id={_value.user.userID} 
                                                                    onChange={(e) => onClickCheckBoxAddMember(e, _value)} 
                                                                    checked={
                                                                        selectedAddMember.findIndex(member => member.userID === _value.user.userID) !== -1 ? true : false
                                                                    }
                                                                />
                                                                <label htmlFor={_value.user.userID} />
                                                            </React.Fragment>
                                                        </div>
                                                    )
                                                })}
                                                
                                            </div>
                                        )
                                    })  
                            }

                            {(onSearchUserContactAddMember && contactListAddMember.length < 1) &&
                                <div className="cant-find-contact">
                                    <b>Contact Not Found</b>
                                </div>
                            }
                        </Scrollbars>
                    </div>
                </div>
            )
        };


        return (
            <React.Fragment>
                <ModalHeader className={`member-list-header room-info-member-list ${activeModalRoomInfo === ACTIVE_ROOM_INFO_MODAL.addMember ? "active-room-info-member-list" : ""}`}> 
                    <IoIosArrowBack 
                        className="header-room-info-button back-arrow-modal" 
                        onClick={() => {
                            setSearchContactValue("");
                            setActiveModalRoomInfo(ACTIVE_ROOM_INFO_MODAL.memberList)
                        }} 
                    />

                    {selectedMemberArray.length > 0 &&
                        <span 
                            className="clear-selected-member" 
                            onClick={() => {
                                setSelectedMemberArray([])
                            }}
                        >
                            Clear
                        </span>
                    }

                    <b className="room-info-title">Add Member</b>
                    
                    <br />
                    
                    <SearchBox 
                        placeholder="Search Members" 
                        style={{marginTop: '32px', width: '100%'}} 
                        onChangeInputSearch={searchAddMemberRoomInfo} 
                        value={searchContactValue}
                        clearSearchingProps={() => setSearchContactValue("")}
                    />
                </ModalHeader>

                <ModalBody className={`header-add-member room-info-member-list ${activeModalRoomInfo === ACTIVE_ROOM_INFO_MODAL.addMember ? "active-room-info-member-list" : ""}`}>
                    <div className="new-group-wrapper">
                        <React.Fragment>
                            {newGroupContactList()}

                            {selectedAddMember.length > 0 && groupAddMemberList()}
                        </React.Fragment>
                    </div>
                </ModalBody>
            </React.Fragment>
        )
  }

  return (
    roomData !== null &&
        <div className="">
            <Modal isOpen={props.toggleRoomInfoModalprops} className="room-info-modal">
                {activeModalRoomInfo === ACTIVE_ROOM_INFO_MODAL.main &&
                    generateModalInfoMain()
                }
                
                {activeModalRoomInfo === ACTIVE_ROOM_INFO_MODAL.memberList && 
                    generateModalMemberList()
                }

                {activeModalRoomInfo === ACTIVE_ROOM_INFO_MODAL.editGroup &&
                    generateModalEditGroup()
                }

                {activeModalRoomInfo === ACTIVE_ROOM_INFO_MODAL.memberDetail &&
                    generateModalMemberDetail()
                }

                {activeModalRoomInfo === ACTIVE_ROOM_INFO_MODAL.addMember &&
                    generateModalAddMember()
                }
            </Modal>

            {modalFile !== null && generateModalVideoImage()}
        </div>
  );
}

const mapStateToProps = state => ({
    activeRoom: state.activeRoom,
    userContacts: state.userContacts,
    participantList: state.participantList,
    mentionUsername: state.mentionUsername
});

const mapDispatchToProps = {
    setActiveRoom,
    setUserContacts,
    clearMentionUsername
};

export default connect(mapStateToProps, mapDispatchToProps)(ChatRoomHeaderInfoModal);
