import React, { useState, useEffect } from 'react';
import './RoomListNewChatMain.scss'
import { FiX } from 'react-icons/fi';
import IconContact from '../../../../assets/img/icon-new-contact.svg';
import IconGroup from '../../../../assets/img/icon-new-group.svg';
import SearchBox from '../../../reuseableComponent/searchBox/SearchBox';
import { IoIosArrowForward } from "react-icons/io";
import { Scrollbars } from 'react-custom-scrollbars';
import { setActiveRoom } from '../../../../redux/actions/reduxActionActiveRoom';
import { taptalk, tapCoreContactManager, tapCoreChatRoomManager } from '@taptalk.io/web-sdk';
import Helper from '../../../../helper/Helper';
import { connect } from 'react-redux';

var style = {
    scrollStyle: {
      position: "relative",
      backgroundColor: "#ff7d00",
      right: "-5px",
      width: "3px",
      borderRadius: "8px"
    }
};

var RoomListNewChatMain = (props) => {
  let [userContacts, setUserContacts] = useState(null);
  let [waitingUserContact, setWaitingUserContact] = useState(false);
  let [onSearchContact, setOnSearchContact] = useState(false);
  let [contactSearchResultTemp, setContactSearchResultTemp] = useState(false);
  let [contactSearchResult, setContactSearchResult] = useState(null);
  let [searchContactValue, setSearchContactValue] = useState("");

  useEffect(() => {
      if(contactSearchResultTemp) {
        setContactSearchResult(contactSearchResultTemp.contact)
      }
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [contactSearchResultTemp])

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
                    // setContactSearchResult(newContactGroupSearch);
                    setContactSearchResultTemp({
                        contact: newContactGroupSearch,
                        time: new Date()
                    })
                    setOnSearchContact(true);
                    return null;
                })
            }, 

            onContactNotFound: () => {
                // setContactSearchResult([]);
                setContactSearchResultTemp(false);
                setOnSearchContact(true);
            }
        })
    }else {
        // setContactSearchResult(null);
        setContactSearchResultTemp(false);
        setOnSearchContact(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [searchContactValue])

  let onChangeSearchContact = (e) => {
    setSearchContactValue(e.target.value);
  }

  useEffect(() => {
    getAllUserContact();
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [])

  let getAllUserContact = () => {
    setWaitingUserContact(true)
    
    let newContactGroup = {};

    tapCoreContactManager.getAllUserContacts({
        onSuccess: (response) => {
            props.setContactListProps(response);
            setWaitingUserContact(false);
            response.map((value) => {
                let alphabetGroupName = value.user.fullname[0].toUpperCase();
                if(newContactGroup[alphabetGroupName] === undefined) {
                    newContactGroup[alphabetGroupName] = [];
                    newContactGroup[alphabetGroupName].push(value);
                }else {
                    newContactGroup[alphabetGroupName].push(value);
                }
                setUserContacts(newContactGroup);
                return null;
            })
        },

        onError: (errorCode, errorMessage) => {
            setWaitingUserContact(false);
            console.log(errorCode, errorMessage);
        }
    });
  }

  let newChatMainView = () => {                    
      return (
        <React.Fragment>
            <div className="add-contact-wrapper new-contact" onClick={() => props.setActiveNewChatView(2)}>
                <img src={IconContact} alt="" />
                <b>New Contact</b>
                <IoIosArrowForward />
            </div>

            <div className="add-contact-wrapper new-group" onClick={() => props.setActiveNewChatView(3)}>
                <img src={IconGroup} alt="" />
                <b>New Group</b>
                <IoIosArrowForward />
            </div>

            <div className="contact-by-alphabet-wrapper">
                <Scrollbars autoHide autoHideTimeout={500}
                    renderThumbVertical={props => <div {...props} style={style.scrollStyle} />}>
                
                    {waitingUserContact && (userContacts === null) ?
                        <div className="main-contact-loading-wrapper">
                            <div className="lds-ring">
                                <div /><div /><div /><div />
                            </div>
                        </div>
                        :
                        <React.Fragment>
                            {userContacts !== null &&
                                Object.keys(userContacts).map((value, index) => {
                                    return (
                                        <div key={`contact-alphabet-${index}`}>
                                            <p className="contact-alphabet"><b>{value}</b></p>

                                            
                                            
                                            {userContacts[value].map((_value, _index) => {
                                                return (
                                                    <div className="contact-name-wrapper" key={`contact-${_value}-${_index}`} onClick={() => onClickContact(_value)}>
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
                                                            <p><b>{_value.user.fullname}</b></p>
                                                        </div>
                                                    </div>
                                                )
                                            })}
                                            
                                        </div>
                                    )
                                })
                            }
                            
                        </React.Fragment>
                    } 
                </Scrollbars>
            </div>
        </React.Fragment>
      )
  }

  let onClickContact = (contact) => {
      console.log(contact)
    props.toggleNewChatModal();
    let newRoom = tapCoreChatRoomManager.createRoomWithOtherUser(contact.user);

    if(newRoom.success) {
        props.setActiveRoom(newRoom.room)
    }
  }

  let onSearchNewChatView = () => {
    return (
        <div className="on-search-new-chat-view-wrapper">
            <Scrollbars autoHide autoHideTimeout={500}
                        renderThumbVertical={props => <div {...props} style={style.scrollStyle} />}
            >
                {contactSearchResult !== null &&
                    Object.keys(contactSearchResult).map((value, index) => {
                        return (
                            <React.Fragment key={`contact-search-${index}`}>
                                <p className="contact-alphabet"><b>{value}</b></p>

                                {contactSearchResult[value].map((_value, _index) => {
                                    return (
                                        <div className="contact-name-wrapper" key={`contact-${_value}-${_index}`} onClick={() => onClickContact(contactSearchResult[value][_index])}>
                                            <div className="search-avatar-wrapper"
                                                 style={{background: taptalk.getRandomColor(contactSearchResult[value][_index].user.fullname)}}
                                            >
                                                {contactSearchResult[value][_index].user.imageURL.thumbnail === "" ?
                                                    <b>{Helper.renderUserAvatarWord(contactSearchResult[value][_index].user.fullname, false)}</b>
                                                    :
                                                    <img src={contactSearchResult[value][_index].user.imageURL.thumbnail} alt="" />
                                                }
                                            </div>
                                            <div className="contact-name">
                                                <p>
                                                    <b>{contactSearchResult[value][_index].user.fullname}</b>
                                                </p>
                                                
                                                <p className="contact-username">
                                                    @{contactSearchResult[value][_index].user.username}
                                                </p>
                                            </div>
                                        </div>
                                    )
                                })}
                            </React.Fragment>
                        )
                    })
                }

                <div className="user-not-found">
                    <span>Can’t find the contact you were looking for?</span>
                    <p onClick={() => props.setActiveNewChatView(2)} className="orange-text-button">
                        <b>Add new contact</b>
                    </p>
                </div>
            </Scrollbars>
        </div>
    )
  }

  return (
    <div className={`new-chat-content ${props.active ? 'active-new-chat-view' : ''}`}>
        <div className="new-chat-header">
            <FiX className="close-new-chat" onClick={() => props.toggleNewChatModal()} />
            <b className="new-chat-title">New Chat</b>
            
            <SearchBox 
                placeholder="Search for contacts" 
                onChangeInputSearch={onChangeSearchContact} 
                clearSearchingProps={() => setSearchContactValue("")}
                value={searchContactValue}
            />
        </div>

        <div style={{display: onSearchContact ? 'none' : 'block', height: "calc(100% - 117px)"}}>
            {newChatMainView()}
        </div>
        
        <div style={{display: onSearchContact ? 'block' : 'none', height: "calc(100% - 117px)"}}>
            {onSearchNewChatView()}
        </div>
    </div>
  );
}

const mapStateToProps = state => ({
    activeRoom: state.activeRoom,
    userContacts: state.userContacts
});

const mapDispatchToProps = {
    setActiveRoom,
};

export default connect(mapStateToProps, mapDispatchToProps)(RoomListNewChatMain);
