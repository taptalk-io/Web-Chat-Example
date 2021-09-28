import React, { useEffect, useState } from 'react';
import './RoomListNewContact.scss'
import { IoIosArrowBack } from 'react-icons/io';
import SearchBox from '../../../reuseableComponent/searchBox/SearchBox';
import { tapCoreContactManager, tapCoreChatRoomManager } from '@taptalk.io/web-sdk';
import Helper from '../../../../helper/Helper';
import { MdChatBubbleOutline } from 'react-icons/md';
import { setActiveRoom } from '../../../../redux/actions/reduxActionActiveRoom';
import { setUserContacts } from '../../../../redux/actions/reduxActionUserContacts';
import { setUserContactsNoGroup } from '../../../../redux/actions/reduxActionUserContactsNoGroup';
import { connect } from "react-redux"; 

var RoomListNewContact = (props) => {
  let [valUsername, setValUsername] = useState('');
  let [userResult, setUserResult] = useState(null);
  let [loadingSearchContact, setLoadingSearchContact] = useState(false);
  let [loadingAddContact, setLoadingAddContact] = useState(false);

  useEffect(() => {
    setTimeout(
        searchUsername(valUsername)
    , 300);
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [valUsername])

  let onChangeSearchByUsername = (e) => {
    setUserResult(null);
    setValUsername(e.target.value);
  }

  let searchUsername = (username) => {
    setLoadingSearchContact(true);

    if(username !== "") {
        tapCoreContactManager.getUserByUsername(username, true, {
           onSuccess : (response) => {
                setUserResult(response);
                setLoadingSearchContact(false);
           },
    
           onError : (errorCode, errorMessage) => {
                setLoadingSearchContact(false);
                // console.log(errorCode, errorMessage);
           }
        })
    }else {
        setUserResult(null);
    }
  };

  let NewContactInfoView = (status) => {
    let infoText = {
        info: {
            textTitle: "Usernames are not case sensitive",
            textDescription: "Make sure you input the exact characters"
        },
        userNotFound: {
            textTitle: "Oops…",
            textDescription: "Could not find any results"
        }
    };

    return (
        <div className="new-contact-info">
            <b>{infoText[status].textTitle}</b>
    
            <p>
                {infoText[status].textDescription}
            </p>
        </div>
    )
  }

  let findContactIndex = (firstName, userID) => {
      let index = -1;

      index = props.userContacts[firstName].findIndex(val => val.user.userID === userID);

      return index;
  }

//   let findContactIndexNoGroup = (userID) => {
//     let index = -1;

//     index = props.userContactsNoGroup.findIndex(val => val.user.userID === userID);

//     return index;
//   }

  let isUserContactExist = (user) => {
    let _userContacts = {...props.userContacts}; 
    let exist = false;
    let firstName = user.fullname.substr(0, 1);
    
    if(Object.keys(_userContacts).length > 0) {
        if(_userContacts[firstName]) {
            let indexContact = findContactIndex(firstName, user.userID);

            if(indexContact !== -1) {
                exist = true;
            }
        }
    }

    return exist;
    // (userResult)
  }

  let NewContactUserView = () => {

    let onClickAddToContact = (user) => {
        setLoadingAddContact(true);
        let firstName = user.fullname.substr(0, 1).toUpperCase();
    
        tapCoreContactManager.addToTapTalkContactsWithUserID(user.userID, {
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
            },

            onError : (errorCode, errorMessage) => {
                setLoadingAddContact(false);
                console.log(errorCode, errorMessage);
            }
        })
    }


    // let onClickDelContact = (user) => {
    //     let firstName = user.fullname.substr(0, 1).toUpperCase();
    //     let indexContact = findContactIndex(firstName, user.userID);
    //     let indexContactNoGroup = findContactIndexNoGroup(user.userID);

    //     tapCoreContactManager.removeFromTapTalkContacts(user.userID, {
    //         onSuccess : () => {
    //             let _userContacts = {...props.userContacts};
    //             let _userContactsNoGroup = props.userContactsNoGroup.slice();

    //             _userContactsNoGroup.splice(indexContactNoGroup, 1);
    //             _userContacts[firstName].splice(indexContact, 1);

    //             if(_userContacts[firstName].length === 0) {
    //                 delete _userContacts[firstName];
    //             }

    //             props.setUserContacts(_userContacts);
    //             props.setUserContactsNoGroup(_userContactsNoGroup);
    //         },

    //         onError : (errorCode, errorMessage) => {
    //             console.log(errorCode, errorMessage);
    //         }
    //     })
    // }

    let onClickChatNow = (user) => {
        props.toggleNewChatModal();
        let newRoom = tapCoreChatRoomManager.createRoomWithOtherUser(user);

        if(newRoom.success) {
            props.setActiveRoom(newRoom.room)
        }
    }

    return (
        <div className="new-contact-user-wrapper">
            <div className="new-contact-user-card">
                <div className="new-contact-user-avatar">
                    {userResult.user.imageURL.thumbnail === "" ?
                        <b>{Helper.renderUserAvatarWord(userResult.user.fullname, false)}</b>
                        :
                        <img src={userResult.user.imageURL.thumbnail} alt=""/>
                    }
                </div>
                
                <p>
                    <b>{userResult.user.fullname}</b>
                </p>

                <p>
                    {userResult.user.username}
                </p>

                {!loadingAddContact ? 
                    isUserContactExist(userResult.user) ?
                        <>
                            <button className="orange-button" onClick={() => onClickChatNow(userResult.user)}>
                                <MdChatBubbleOutline />
                                Chat Now
                            </button>
                            {/* <button className="orange-button" onClick={() => onClickDelContact(userResult.user)}>
                                <MdChatBubbleOutline />
                                del
                            </button> */}
                        </>
                        :
                        <button className="orange-button" onClick={() => onClickAddToContact(userResult.user)}>
                            <MdChatBubbleOutline />
                            Add to Contacts
                        </button>
                    :
                    <button className="orange-button">
                        <div className="lds-ring">
                            <div />
                            <div />
                            <div />
                            <div />
                        </div>
                    </button>
                }
            </div>
        </div>
    )
  }

  return (
    <div className={`new-contact-content ${props.active ? 'active-new-chat-view' : ''}`}>
        <div className="new-chat-header">
            <IoIosArrowBack 
                className="goback-new-chat" 
                onClick={() => {
                    setValUsername("");
                    props.setActiveNewChatView(1)
                }}
            />
            <b className="new-chat-title">New Contact</b>

            <SearchBox 
                placeholder="Search by username" 
                onChangeInputSearch={onChangeSearchByUsername} 
                clearSearchingProps={() => setValUsername("")}
                value={valUsername}
            />
        </div>

        <div className="new-contact-wrapper">
            {userResult === null ?
                valUsername.length < 1 ?
                    NewContactInfoView("info")
                    :
                    loadingSearchContact ? 
                        <div className="loading-search-contact">
                            <div className="lds-ring">
                                <div />
                                <div />
                                <div />
                                <div />
                            </div>
                        </div>
                        :
                        NewContactInfoView("userNotFound")
                :
                NewContactUserView()
            }
        </div>
    </div>
  );
}
  
const mapStateToProps = state => ({
    activeRoom: state.activeRoom,
    userContacts: state.userContacts,
    userContactsNoGroup: state.userContactsNoGroup
});

const mapDispatchToProps = {
    setActiveRoom,
    setUserContacts,
    setUserContactsNoGroup
};

export default connect(mapStateToProps, mapDispatchToProps)(RoomListNewContact);
