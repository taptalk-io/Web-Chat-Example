import React, { useState, useEffect } from 'react';
import './RoomListNewGroupSubject.scss'
import { IoIosArrowBack } from 'react-icons/io';
import IconRemove from '../../../../../assets/img/icon-remove.png';
import IconCamera from '../../../../../assets/img/icon-camera.svg';
import Helper from '../../../../../helper/Helper';
import { connect } from 'react-redux';
import { setActiveRoom } from '../../../../../redux/actions/reduxActionActiveRoom';
import { taptalk, tapCoreChatRoomManager } from '@taptalk.io/web-sdk';


var RoomListNewGroupSubject = (props) => {
    let [arrayOfGroupMemberVal, setArrayOfGroupMemberVal] = useState([]);
    let [groupNameVal, setGroupNameVal] = useState('');
    let [groupAvatarVal, setGroupAvatarVal] = useState(null);
    let [isOnProgressCreateGroup, setIsOnProgressCreateGroup] = useState(false);

    useEffect(() => {
        setArrayOfGroupMemberVal(props.arrayOfGroupMemberProps);
    // eslint-disable-next-line react-hooks/exhaustive-deps
}, [props.arrayOfGroupMemberProps]);

    let onChangeGroupName = (e) => {
        setGroupNameVal(e.target.value);
    }

    let isEmptyGroupName = () => {
        if((groupNameVal.length < 1) || (groupNameVal.replace(/\s/g, '').length === 0)) {
            return true;
        }

        return false;
    }

    let onClickLabelAvatarSubject = () => {
        let targetFile = document.getElementById('input-avatar-file-subject');

        targetFile.value = null;
    }

    let onChangeAvatarSubject = (e) => {
        if((e.target.files[0].type === "image/jpeg") || (e.target.files[0].type === "image/png")) {
            setGroupAvatarVal(e.target.files[0]);
            let avatarSubjectReader = new FileReader();

            avatarSubjectReader.onload = (evt) => {
                let targetImage = document.getElementById('avatar-image-subject-value');
                targetImage.src = evt.target.result;
            }

            avatarSubjectReader.readAsDataURL(e.target.files[0]);
        }
    }

    let removeAvatarSubject = () => {
        setGroupAvatarVal(null);
    }

    let submitCreateGroup = () => {
        let _arrayOfGroupMemberVal = [];
        setIsOnProgressCreateGroup(true);

        arrayOfGroupMemberVal.map(value => {
            _arrayOfGroupMemberVal.push(value.userID);
            return null;
        })

        if(groupAvatarVal === null) {
            tapCoreChatRoomManager.createGroupChatRoom(groupNameVal, _arrayOfGroupMemberVal, {
                onSuccess : (room) => {
                    props.setActiveRoom(room);
                    props.toggleNewChatModal();
                    setIsOnProgressCreateGroup(false);
                },
    
                onError: (errorCode, errorMessage) => {
                    console.log(errorCode, errorMessage);
                    setIsOnProgressCreateGroup(false);
                }
            })
        }else {
            tapCoreChatRoomManager.createGroupChatRoomWithPicture(groupNameVal, _arrayOfGroupMemberVal, groupAvatarVal, {
                onSuccess : (room) => {
                    props.setActiveRoom(room);
                    props.toggleNewChatModal();
                    setIsOnProgressCreateGroup(false);
                },
    
                onError: (errorCode, errorMessage) => {
                    console.log(errorCode, errorMessage);
                    setIsOnProgressCreateGroup(false);
                }
            })
        }
    }

    return (
        <div className={`new-group-subject ${props.active ? 'active-new-chat-view' : ''} new-group-view ${props.activeNewGroupView === 2 ? 'active-new-group-view' : ''}`} 
             style={props.style}>
            <div className="new-chat-header new-group-subject-header">
                <IoIosArrowBack className="goback-new-chat" onClick={() => props.setNewGroupViewAction(1)} />
                <b className="new-chat-title">Group Subject</b>

                <div className="group-subject-avatar-wrapper">
                    <div className="group-subject-avatar">
                        <div className="group-subject-avatar-wrapper">
                            {groupAvatarVal !== null &&
                                <div className="icon-remove-wrapper" onClick={() => removeAvatarSubject()}>
                                    <img src={IconRemove} alt="" className="icon-remove" />
                                </div>
                            }

                            <label htmlFor="input-avatar-file-subject" onClick={() => onClickLabelAvatarSubject()}>
                                {groupAvatarVal === null ?
                                    <img src={IconCamera} alt="" className="avatar-image-subject avatar-camera" />
                                    :
                                    <img src={''} alt="" id="avatar-image-subject-value" className="avatar-image-subject" />
                                }
                            </label>

                            <input type="file" 
                                   id="input-avatar-file-subject" 
                                   onChange={(e) => onChangeAvatarSubject(e)} 
                                   accept="image/jpeg, image/png"
                            />
                        </div>
                    </div>
                    <div className="avatar-label">
                        <b>Change Avatar</b>
                        <br />
                        <span>(optional)</span>
                    </div>
                </div>
            </div>

            <div className="group-subject-name">
                <label><b>Group Name</b></label>
                <input type="text" onChange={(e) => onChangeGroupName(e)} />
            </div>

            <div className="new-group-subject-wrapper">
                <div className="new-group-member-list-wrapper">
                     <div className="member-list-count-wrapper">
                     <b>USER{arrayOfGroupMemberVal.length > 1 ? "S" : ""} SELECTED ({arrayOfGroupMemberVal.length}/500)</b>
                     </div>

                     <div className="memberlist-user-wrapper">
                        <div className="memberlist-inner-wrapper">
                            {arrayOfGroupMemberVal.map((value, index) => {
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
                                    </div>
                                )
                            })}
                        </div>
                     </div>

                     <div className="memberlist-submit-wrapper">
                        {!isOnProgressCreateGroup ?
                            <button className="orange-button" disabled={isEmptyGroupName()} onClick={() => submitCreateGroup()}>
                                Create Group
                            </button>
                            :
                            <button className="orange-button">
                                <div className="lds-ring">
                                    <div /><div /><div />
                                </div>
                            </button>
                        }
                        
                     </div>
                </div>
            </div>
        </div>
    );
}


const mapDispatchToProps = {
   setActiveRoom,
};
  
export default connect(null, mapDispatchToProps)(RoomListNewGroupSubject);