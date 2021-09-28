import React, { useState, useEffect } from 'react';
import './RoomListNewGroupInvite.scss'
import { IoIosArrowBack } from 'react-icons/io';
import SearchBox from '../../../../reuseableComponent/searchBox/SearchBox';
import { Scrollbars } from 'react-custom-scrollbars';
import IconRemove from '../../../../../assets/img/icon-remove.png';
import Helper from '../../../../../helper/Helper';
import { setUserContacts } from '../../../../../redux/actions/reduxActionUserContacts';
// import CircleLoading from '../../../../reuseableComponent/circleLoading/CircleLoading';
import { taptalk, tapCoreContactManager } from '@taptalk.io/web-sdk';
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

var RoomListNewGroupInvite = (props) => {
    let [selectedMemberList, setSelectedMemberList] = useState([]);
    let [searchContactValue, setSearchContactValue] = useState("");
    // let [userContactsOriginal, setUserContactsOriginal] = useState(null);
    let [onSearchUserContact, setOnSearchUserContact] = useState(false);
    let [userContacts, setUserContacts] = useState(null);
    let [userContactsTemp, setUserContactsTemp] = useState(false);
    // let [waitingUserContact, setWaitingUserContact] = useState(false);

    useEffect(() => {
        getAllUserContact();
    // eslint-disable-next-line react-hooks/exhaustive-deps
}, []);

    useEffect(() => {
        if(userContactsTemp) {
            setUserContacts(userContactsTemp.contact)
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
}, [userContactsTemp])

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
                        // setUserContacts(newContactGroupSearch);
                        setUserContactsTemp({
                            contact: newContactGroupSearch,
                            time: new Date()
                        })
                        setOnSearchUserContact(true);
                        return null;
                    })
                }, 
    
                onContactNotFound: () => {
                    // setUserContacts([]);
                    setUserContactsTemp(false);
                    setOnSearchUserContact(true);
                }
            })
        }else {
            // setUserContacts(props.userContacts);
            setUserContactsTemp({
                contact: props.userContacts,
                time: new Date()
            })
            setOnSearchUserContact(false);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
}, [searchContactValue])

    let getAllUserContact = () => {
        // setWaitingUserContact(true)
        
        let newContactGroup = {};
    
        tapCoreContactManager.getAllUserContacts({
            onSuccess: (response) => {
                // setWaitingUserContact(false);
                response.map((value) => {
                    let alphabetGroupName = value.user.fullname[0].toUpperCase();
                    let _selectedMemberList = selectedMemberList.slice();

                    _selectedMemberList.push(taptalk.getTaptalkActiveUser())

                    setSelectedMemberList(_selectedMemberList);

                    if(newContactGroup[alphabetGroupName] === undefined) {
                        newContactGroup[alphabetGroupName] = [];
                        newContactGroup[alphabetGroupName].push(value);
                    }else {
                        newContactGroup[alphabetGroupName].push(value);
                    }

                    // setUserContactsOriginal(newContactGroup);
                    props.setUserContacts(newContactGroup);
                    setUserContacts(newContactGroup);
                    return null;
                })
            },
    
            onError: (errorCode, errorMessage) => {
                // setWaitingUserContact(false);
                console.log(errorCode, errorMessage);
            }
        });
    }

    // let newGroupEmptyContact = () => {
    //     return (
    //         <div className="new-group-empty-contact">
    //             <p>Your contact list seems empty…</p>
    //             <b className="new-group-add-contact orange-text-button" onClick={() => props.setActiveNewChatView(2)}>
    //                 Add New Contact
    //             </b>
    //         </div>
    //     )
    // }

    // let newGroupUserNotFound = () => {
    //     return (
    //         <div className="new-group-user-not-found">
    //             <p>No results found for “lorem ipsum…”</p>
    //             <b>
    //                 Try a different search
    //             </b>
    //         </div>
    //     )
    // }

    let removeSelectedMember = (userID) => {
        let _selectedMemberList = selectedMemberList.slice();
        let findIndexSelectedMember =  _selectedMemberList.findIndex(value => value.userID === userID);
        _selectedMemberList.splice(findIndexSelectedMember, 1);

        setSelectedMemberList(_selectedMemberList);
    }   

    let onClickContinueNewGroup = () => {
        props.setNewGroupMemberProps(selectedMemberList);
        props.setNewGroupViewAction(2);
    }

    let newGroupMemberList = () => {
        return (
            <div className="new-group-member-list-wrapper">
                    <div className="member-list-count-wrapper">
                    <b>USER{selectedMemberList.length > 1 ? "S" : ""} SELECTED ({selectedMemberList.length}/500)</b>
                    </div>
                    
                    <div className="memberlist-user-wrapper">
                        <div className="memberlist-inner-wrapper">
                            {selectedMemberList.map((value, index) => {
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
                                                <img src={IconRemove} alt="" />
                                            </div>
                                        }
                                    </div>
                                )
                            })}
                        </div>
                    </div>

                    <div className="memberlist-submit-wrapper">
                        <button className="orange-button" onClick={() => onClickContinueNewGroup()}>
                            Continue
                        </button>
                    </div>
            </div>
        )
    }

    let onClickCheckBoxMember = (e, member) => {
        let _selectedMemberList = selectedMemberList.slice();

        if(e.target.checked) {
            if(_selectedMemberList.length < 500) {
                _selectedMemberList.push(member.user);
                setSelectedMemberList(_selectedMemberList);
            }
        }else {
            let findIndexSelectedMember = _selectedMemberList.findIndex(value => value.userID === member.user.userID);
            _selectedMemberList.splice(findIndexSelectedMember, 1);
            setSelectedMemberList(_selectedMemberList);
        }
    }

    let newGroupContactList = () => {
        return (
            <div 
                className="new-group-contact-list-wrapper"
                style={{
                    height: `calc(100% - ${selectedMemberList.length > 1 ? '207px' : '0px'})`,
                    maxHeight: `calc(100% - ${selectedMemberList.length > 1 ? '207px' : '0px'})`
                }}
            >
                <div className="contact-by-alphabet-wrapper">
                    <Scrollbars autoHide autoHideTimeout={500}
                                renderThumbVertical={props => <div {...props} style={style.scrollStyle} />}>
                        
                        {userContacts !== null &&
                            Object.keys(userContacts).map((value, index) => {
                                return (
                                    <div key={`contact-alphabet-${index}`}>
                                        <p className="contact-alphabet"><b>{value}</b></p>
                                        
                                        {userContacts[value].map((_value, _index) => {
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
                                                        <p><b>{_value.user.fullname}</b></p>
                                                        <p className="contact-username">@{_value.user.username}</p>
                                                    </div>
                                                    
                                                    <React.Fragment>
                                                        <input type="checkbox" 
                                                            id={_value.user.userID} 
                                                            onChange={(e) => onClickCheckBoxMember(e, _value)} 
                                                            checked={
                                                                selectedMemberList.findIndex(member => member.userID === _value.user.userID) !== -1 ? true : false
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

                        {(onSearchUserContact && userContacts.length < 1) &&
                            <div className="cant-find-contact">
                                <b>Contact Not Found</b>
                            </div>
                        }
                    </Scrollbars>
                </div>
            </div>
        )
    };

    // let newGroupOnSearch = () => {
    //     return (
    //         <div className="new-group-on-search-wrapper"
    //             style={{
    //                 height: `calc(100vh - ${selectedMemberList.length > 0 ? '402px' : '161px'})`,
    //                 maxHeight: `calc(100vh - ${selectedMemberList.length > 0 ? '402px' : '161px'})`
    //             }}
    //         >
    //             {/* <CircleLoading /> */}
    //             <div className="search-from">
    //                 <b>CONTACTS</b>
    //             </div>
    //             <div className="contact-name-wrapper">
    //                 <img src={Pelangi} alt="" />
    //                 <div className="contact-name">
    //                     <b>Anaru Hakopa</b>
    //                     <br />
    //                     <span className="contact-username">@alfonso145</span>

    //                     <div className="custom-checkbox">
    //                         <input type="checkbox" id="filter-taptalk" />
    //                         <label htmlFor="filter-taptalk" />                       
    //                     </div>
    //                 </div>
    //             </div>
    //             <div className="search-from">
    //                 <b>GROUPS</b>
    //             </div>
    //             <div className="contact-name-wrapper">
    //                 <img src={Pelangi} alt="" />
    //                 <div className="contact-name">
    //                     <b>Anaru Hakopa</b>
    //                     <br />
    //                     <span className="contact-username">@alfonso145</span>

    //                     <div className="custom-checkbox">
    //                         <input type="checkbox" id="filter-taptalk" />
    //                         <label htmlFor="filter-taptalk" />                       
    //                     </div>
    //                 </div>
    //             </div>
    //         </div>
    //     )
    // }

    let searchMemberNewGroup = (e) => {
        setSearchContactValue(e.target.value);
    }

    return (
        <div style={props.style} className={`new-group-view ${props.activeNewGroupView === 1 ? 'active-new-group-view' : ''}`}>
            <div className="new-chat-header">
                <IoIosArrowBack 
                    className="goback-new-chat" 
                    onClick={() => {
                        setSearchContactValue("");
                        props.setActiveNewChatView(1); 
                    }}
                />
                
                <b className="new-chat-title">New Group</b>

                <SearchBox 
                    placeholder="Search for user" 
                    onChangeInputSearch={searchMemberNewGroup} 
                    clearSearchingProps={() => setSearchContactValue("")}
                    value={searchContactValue}
                />
            </div>

            <div className="new-group-wrapper">
                {newGroupContactList()}
                {/* {newGroupOnSearch()} */}

                {selectedMemberList.length > 1 && newGroupMemberList()}
                {/* {newGroupEmptyContact()} */}
            </div>
        </div>
    );
}

const mapStateToProps = state => ({
    userContacts: state.userContacts
});
  
const mapDispatchToProps = {
    setUserContacts
};
  
export default connect(mapStateToProps, mapDispatchToProps)(RoomListNewGroupInvite);
