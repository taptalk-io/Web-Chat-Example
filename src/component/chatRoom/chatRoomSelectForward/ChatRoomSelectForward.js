import React, { useEffect, useState, useCallback } from "react";
import { Modal, ModalBody } from "reactstrap";
import "./ChatRoomSelectForward.scss";
import { connect } from "react-redux";
import { setForwardMessage, clearForwardMessage } from '../../../redux/actions/reduxActionForwardMessage';
import { setActiveRoom } from '../../../redux/actions/reduxActionActiveRoom';
import { taptalk, tapCoreRoomListManager, tapCoreChatRoomManager } from '@taptalk.io/web-sdk';
import { VariableSizeList as VariableList } from 'react-window';
import SearchBox from '../../reuseableComponent/searchBox/SearchBox';
import groupBadge from "../../../assets/img/group-badge.svg";
import HelperChat from "../../../helper/HelperChat";
import Helper from "../../../helper/Helper";

const CONTACT_OR_GROUP = {
    contact: 1,
    group: 2
}

const SEARCH = {
    contactOrGroup: "contactOrGroup",
    messages: "messages"
}

let SearchResultComponent = (props) => {
    let { resultSearch, dataLength, containerHeight, row, mainProps, refProps, clearSearching, keyword } = props;

    let arrayOfRowHeight = [];

    let generateRowHeight = () => {
        arrayOfRowHeight = [];
        let isFirstContactOrGroup = true;
        let isFirstMessages = true;

        resultSearch.map((val) => {
            if(val.part === SEARCH.contactOrGroup) {
                if(isFirstContactOrGroup) {
                    arrayOfRowHeight.push(94);

                    isFirstContactOrGroup = false;
                }else {
                    arrayOfRowHeight.push(63);
                }
            }else {
                if(isFirstMessages) {
                    arrayOfRowHeight.push(94);

                    isFirstMessages = false;
                }else {
                    arrayOfRowHeight.push(56);
                }
            }

            return null;
        })
    }

    generateRowHeight();

    const getItemSize = (index) => {
        return arrayOfRowHeight[index];
    }

    return (
        <VariableList
            className={``}
            height={containerHeight}
            itemCount={dataLength}
            itemSize={getItemSize}
            width={"100%"}
            // onScroll={onScrollRoomListListenerProps}
            ref={refProps}
            itemData={{
                resultSearch: resultSearch,
                mainProps: mainProps,
                itemSizeList: arrayOfRowHeight,
                // _onClickRetryMoreCaseUnassignedProps: onClickRetryMoreCaseUnassignedProps,
                _refProps: refProps,
                clearSearching: clearSearching,
                searchingProps: keyword
            }}
        >
            {row}
        </VariableList>
    )
};

let printRowSearchList = ({ index, style, data }) => {
    let generateRoomID = (otherUser) => {
        let myUser = taptalk.getTaptalkActiveUser();
        let roomID = "";

        if(parseInt(myUser.userID) > parseInt(otherUser.userID)) {
            roomID = parseInt(otherUser.userID)+"-"+parseInt(myUser.userID);
        }else {
            roomID = parseInt(myUser.userID)+"-"+parseInt(otherUser.userID);
        }
        
        return roomID;
    }

    let createActiveRoom = (val) => {
        let room = null;
        if(val.type === CONTACT_OR_GROUP.group) {
            room = val.lastMessage.room;
        }else {
            let newRoom = tapCoreChatRoomManager.createRoomWithOtherUser(val.user);
            if(newRoom.success) {
                room = newRoom.room;
            }    
        }

        return room;
    }

    let print = data.resultSearch[index];
    let rowHeight = data.itemSizeList[index];
    let props = data.mainProps;

    return (
        <div style={style}>
            <>
                {rowHeight === 94 &&
                    <div className="search-contact-history-header">
                        <b>CHATS AND CONTACTS </b>
                        {/* <b className="clear-history-button">CLEAR HISTORY</b> */}
                    </div>
                }
            
                <div 
                    className={`
                        contact-name-wrapper
                        ${props.activeRoom == null ?
                            ""
                            :
                            (print.type === CONTACT_OR_GROUP.group ?
                                (props.activeRoom.roomID === print.lastMessage.room.roomID ?
                                    "active-chat-list"
                                    :
                                    ""
                                )
                                :
                                (props.activeRoom.roomID === generateRoomID(print.user) ?
                                    "active-chat-list"
                                    :
                                    ""
                                )
                            )

                        }
                    `}
                    onClick={() => {
                        let _forwardMessage = {...props.forwardMessage}
                        let room = createActiveRoom(print)
                        _forwardMessage.target = room
                        data.clearSearching()
                        props.setForwardMessage(_forwardMessage)
                        props.setActiveRoom(room)
                        props.toggle(true)
                    }}
                >
                    <div className="chat-avatar-wrapper">
                        {print.type === CONTACT_OR_GROUP.group &&
                            (print.lastMessage.room.imageURL.thumbnail === "" ?
                                <div className="user-avatar-name" style={{background: taptalk.getRandomColor(print.lastMessage.room.name)}}>
                                    <b>{Helper.renderUserAvatarWord(print.lastMessage.room.name, true)}</b>
                                </div>
                                :
                                <img src={print.lastMessage.room.imageURL.thumbnail} alt='' />
                            )
                        }

                        {print.type === CONTACT_OR_GROUP.contact &&
                            (print.user.imageURL.thumbnail === "" ?
                                <div className="user-avatar-name" style={{background: taptalk.getRandomColor(print.user.fullname)}}>
                                    <b>{Helper.renderUserAvatarWord(print.user.fullname, false)}</b>
                                </div>
                                :
                                <img src={print.user.imageURL.thumbnail} alt="" />
                            )
                        }
                        
                        {print.type === CONTACT_OR_GROUP.group && <img src={groupBadge} alt="" className="group-badge" />}
                    </div>

                    <div className="contact-name">
                        <p>
                            {print.type === CONTACT_OR_GROUP.group ?
                                
                                <b dangerouslySetInnerHTML={ {__html: HelperChat.hightlightSearchKeyword(print.lastMessage.room.name,  data.searchingProps)} } />
                                :
                                <b dangerouslySetInnerHTML={ {__html: HelperChat.hightlightSearchKeyword(print.user.fullname,  data.searchingProps)} } />
                            }
                        </p>
                        {/* <br /> */}
                        {/* <span className="contact-username">@alfonso145</span> */}

                        
                        {/* <IoIosClose className="single-remove-history-button" /> */}
                    </div>
                </div>
            </>
        </div>
    )
}

let ChatRoomSelectForward = (props) => {
    let [keyword, setKeyword] = useState("");
    let [resultSearch, setResultSearch] = useState([]);
    let [serchPanelForwardHeight, setSearchPanelForwardheight] = useState((window.innerHeight * (window.innerWidth > 1024 ? 0.9 : 1)) - 106);
    let [lastWindowResize, setLastWindowResize] = useState(false);

    let runPanelForwardSearchHeight = (_connectStatus) => {
        let defaultHeight = (window.innerHeight * (window.innerWidth > 1024 ? 0.9 : 1)) - 106;
        setSearchPanelForwardheight(defaultHeight);
    }

    useEffect(() => {
        window.addEventListener("resize", () => {
            setLastWindowResize(new Date())
        })
    // eslint-disable-next-line react-hooks/exhaustive-deps
}, [])

    useEffect(() => {
        if(lastWindowResize) {
            runPanelForwardSearchHeight();
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
}, [lastWindowResize])

    useEffect(() => {
        if(keyword === "") {
            setResultSearch([])
        }else {
            filterSearch();
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
}, [keyword])

    useEffect(() => {
        if(!props.isOpen) {
            setKeyword("");
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
}, [props.isOpen])

    let resultSearchRef = useCallback(node => {
        if (node !== null) {
            node.resetAfterIndex(0);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
}, [resultSearch]);

    let filterSearch = async () => {
        let _search = keyword.toLowerCase();
        
        tapCoreRoomListManager.getUpdatedRoomList({
            onSuccess: (roomLists) => {
                let _resultSearch = [];

                props.userContactsNoGroup.map(val => {
                    if(val.user.fullname.toLowerCase().includes(_search)) {
                        val.type = CONTACT_OR_GROUP.contact;
                        val.part = SEARCH.contactOrGroup;
                        _resultSearch.push(val)
                    }

                    return null;
                })

                Object.keys(roomLists).map(val => {
                    if(roomLists[val].lastMessage.room.name.toLowerCase().includes(_search)) {
                        if(roomLists[val].lastMessage.room.type === 2) {
                            roomLists[val].type = CONTACT_OR_GROUP.group;
                            roomLists[val].part = SEARCH.contactOrGroup;
                            _resultSearch.push(roomLists[val]);
                        }
                    }

                    return null;
                })

                // setResultContactAndGroup(_resultSearch);
                
                setResultSearch(_resultSearch)
            },
            onError: (errorCode, errorMessage) => {
                console.log(errorCode, errorMessage);
            }
        })
    }  
    
    let onChangeKeyword = (e) => {
        if(e.target.value[0] !== " ") {
            setKeyword(e.target.value);
        }
    }

    return (
        <Modal isOpen={props.isOpen} toggle={props.toggle} className="modal-forward">
            <ModalBody>
                <div className="modal-forward-top">
                    <p className="modal-forward-title"><b>Forward</b></p>

                    <p className="modal-forward-cancel" onClick={props.toggle}><b>Cancel</b></p>

                    <SearchBox 
                        placeholder="Search" 
                        style={{width: "100%"}} 
                        onChangeInputSearch={onChangeKeyword} 
                        value={keyword}
                        clearSearchingProps={() => setKeyword("")}
                    />
                </div>

                <div className="modal-forward-bottom">
                    {keyword !== "" && resultSearch.length === 0 ?
                        <div className="could-not-find">
                            <p>
                                <b>Oops...</b>
                            </p>

                            <p>
                                Could not find any results
                            </p>
                        </div>
                        :
                        <SearchResultComponent
                            resultSearch={resultSearch}
                            row={printRowSearchList}
                            dataLength={resultSearch.length}
                            containerHeight={serchPanelForwardHeight} //serchPanelForwardHeight
                            mainProps={props}
                            refProps={resultSearchRef}
                            clearSearching={() => setKeyword("")}
                            keyword={keyword}
                        />
                    }
                </div>
            </ModalBody>
        </Modal>
    )
}

const mapStateToProps = state => ({
    activeRoom: state.activeRoom,
    forwardMessage: state.forwardMessage,
    userContactsNoGroup: state.userContactsNoGroup,
});
  
const mapDispatchToProps = {
    setActiveRoom,
    setForwardMessage,
    clearForwardMessage,
};
  
export default connect(mapStateToProps, mapDispatchToProps)(ChatRoomSelectForward);