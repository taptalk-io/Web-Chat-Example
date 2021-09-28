import React, { useState, useEffect, useCallback } from 'react';
import './RoomListOnSearch.scss';
// import Pelangi from '../../../assets/img/pelangi.jpg';
import { setActiveRoom } from '../../../redux/actions/reduxActionActiveRoom';
import { setGoToChatBubble } from '../../../redux/actions/reduxActionGoToChatBubble';
import groupBadge from "../../../assets/img/group-badge.svg";
// import MessageSent from "../../../assets/img/icon-checkmark-grey-1.svg";
import HelperChat from "../../../helper/HelperChat";
import Helper from "../../../helper/Helper";
import { taptalk, tapCoreRoomListManager, tapCoreChatRoomManager } from '@taptalk.io/web-sdk';
// import { IoIosClose } from 'react-icons/io';
import { connect } from 'react-redux';
import { VariableSizeList as VariableList } from 'react-window';

const CONTACT_OR_GROUP = {
    contact: 1,
    group: 2
}

const SEARCH = {
    contactOrGroup: "contactOrGroup",
    messages: "messages"
}

const CONNECTING_STATUS = {
    disconnected: 1,
    loading: 2,
    connected: 3
};

let SearchResultComponent = (props) => {
    let { resultSearch, dataLength, containerHeight, row, mainProps, refProps } = props;

    let arrayOfRowHeight = [];

    let generateRowHeight = () => {
        arrayOfRowHeight = [];
        let isFirstContactOrGroup = true;
        let isFirstMessages = true;

        resultSearch.map((val) => {
            if(val.part === SEARCH.contactOrGroup) {
                if(isFirstContactOrGroup) {
                    arrayOfRowHeight.push(101);

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
                _refProps: refProps
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

    let isToday = (date) => {
        let today = new Date();
        let _date = new Date(date);
        return _date.getDate() === today.getDate() &&
            _date.getMonth() === today.getMonth() &&
            _date.getFullYear() === today.getFullYear()
    }
    
    let isYerterday = (date) => {
        let _date = new Date(date);
        let yesterday = new Date(new Date().setDate(new Date().getDate()-1));
        return _date.getDate() === yesterday.getDate() &&
            _date.getMonth() === yesterday.getMonth() &&
            _date.getFullYear() === yesterday.getFullYear() 
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

    let scrollToReply = (localID) => {
        let targetScroll = document.querySelectorAll(".chat-room-main-content")[0];
        let targetLocalID = document.querySelector(`#message-${localID}`);
        
        if(targetLocalID !== null) {
            targetScroll.scrollTop = targetLocalID.offsetTop;
    
            targetLocalID.classList.add("highlight-chat-bubble");

            setTimeout(() => {
                targetLocalID.classList.remove("highlight-chat-bubble");
            }, 2000);
        }
      }

    let print = data.resultSearch[index];
    let rowHeight = data.itemSizeList[index];
    let props = data.mainProps;

    return (
        <div style={style}>
            {print.part === SEARCH.contactOrGroup ?
                (
                    <>
                        {rowHeight === 101 &&
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
                                props.clearSearchingProps()
                                props.setActiveRoom(createActiveRoom(print))
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
                                        
                                        <b dangerouslySetInnerHTML={ {__html: HelperChat.hightlightSearchKeyword(print.lastMessage.room.name,  props.searchingProps)} } />
                                        :
                                        <b dangerouslySetInnerHTML={ {__html: HelperChat.hightlightSearchKeyword(print.user.fullname,  props.searchingProps)} } />
                                    }
                                </p>
                                {/* <br /> */}
                                {/* <span className="contact-username">@alfonso145</span> */}

                                
                                {/* <IoIosClose className="single-remove-history-button" /> */}
                            </div>
                        </div>
                    </>
                )
                :
                (
                    <>
                        {rowHeight === 94 &&
                            <div className="search-message-header">
                                <b>MESSAGES</b>
                            </div>
                        }

                        <div 
                            className={`dialog-message-wrapper ${props.activeRoom === null ? "" : (props.activeRoom.roomID === print.room.roomID ? "active-chat-list" : "")}`}
                            onClick={() => {
                                props.clearSearchingProps()

                                if(props.activeRoom !== null) {
                                    if(print.room.roomID === props.activeRoom.roomID) {
                                        scrollToReply(print.localID);
                                    }else {
                                        props.setGoToChatBubble({
                                            localID: print.localID,
                                            roomID: print.room.roomID
                                        })
                                    }
                                }else {
                                    props.setGoToChatBubble({
                                        localID: print.localID,
                                        roomID: print.room.roomID
                                    })
                                }

                                props.setActiveRoom(print.room)
                            }}
                        >
                            <div className="dialog-top">
                                <p>
                                    <b>{print.room.name}</b>
                                </p>
                                
                                <span className="dialog-date">
                                    {isToday(print.created) ?
                                        new Date(print.created).getHours()+":"+(new Date(print.created).getMinutes() < 10 ? "0" : "")+new Date(print.created).getMinutes()
                                        :
                                        isYerterday(print.created) ?
                                            "Yesterday"
                                            :
                                            new Date(print.created).getDate()+"/"+(new Date(print.created).getMonth() + 1)+"/"+new Date(print.created).getFullYear()
                                    }
                                </span>
                            </div>
                            <div className="dialog-bottom">
                                <p dangerouslySetInnerHTML={ {__html : HelperChat.hightlightSearchKeyword(HelperChat.generateLastMessage(print), props.searchingProps)} } />

                                <div className="message-status">
                                    {(print.user.userID === taptalk.getTaptalkActiveUser().userID && print.type !== 9001) &&
                                        //message status badge
                                        <img src={HelperChat.renderChatStatus(print, null)} alt="" />
                                        //message status badge
                                    }
                                </div>
                            </div>
                        </div>
                    </>
                )
            }
        </div>
    )
}

var RoomListOnSearch = (props) => {
    let [resultSearch, setResultSearch] = useState([]);
    let [serchPanelHeight, setSearchPanelheight] = useState(window.innerHeight - 52);
    let [lastWindowResize, setLastWindowResize] = useState(false);
    
    let resultSearchRef = useCallback(node => {
        if (node !== null) {
            node.resetAfterIndex(0);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
}, [resultSearch]);

    useEffect(() => {
        if(lastWindowResize) {
            runPanelSearchHeight();
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
}, [lastWindowResize])

    useEffect(() => {
        window.addEventListener("resize", () => {
            setLastWindowResize(new Date())
        })
    // eslint-disable-next-line react-hooks/exhaustive-deps
}, [])

    useEffect(() => {
        let _connectStatus = props.connectingStatusProps;
        let elTarget = document.querySelectorAll(".room-list-on-search-wrapper")[0];

        if (elTarget) {
            if (_connectStatus === CONNECTING_STATUS.disconnected || _connectStatus === CONNECTING_STATUS.loading) {
                // elRoomList.style.height = "calc(100vh - 135px)";
                elTarget.style.height = "calc(100vh - 78px)";
            } else {
                // elRoomList.style.height = "calc(100vh - 109px)";
                elTarget.style.height = "calc(100vh - 52px)";
            }

            setLastWindowResize(new Date())
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
}, [props.connectingStatusProps])

    let runPanelSearchHeight = (_connectStatus) => {
        let min = props.connectingStatusProps === CONNECTING_STATUS.connected ? 52 : 78;
        let defaultHeight = window.innerHeight - min;
        setSearchPanelheight(defaultHeight);
    }

    useEffect(() => {
        if(props.searchingProps === "") {
            setResultSearch([]);
        }else {
            filterSearch();
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
}, [props.searchingProps])

    let filterSearch = async () => {
        let _search = props.searchingProps.toLowerCase();
        
        tapCoreRoomListManager.getUpdatedRoomList({
            onSuccess: (roomLists) => {
                let _resultSearch = [];

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

                props.userContactsNoGroup.map(val => {
                    if(val.user.fullname.toLowerCase().includes(_search)) {
                        val.type = CONTACT_OR_GROUP.contact;
                        val.part = SEARCH.contactOrGroup;
                        _resultSearch.push(val)
                    }

                    return null;
                })

                // setResultContactAndGroup(_resultSearch);
                
                setResultSearch(_resultSearch.concat(filterRooms()))
            },
            onError: (errorCode, errorMessage) => {
                console.log(errorCode, errorMessage);
            }
        })
    }   

    let filterRooms = () => {
        let _search = props.searchingProps.toLowerCase();
        let rooms = tapCoreChatRoomManager.getAllRooms();
        let _resultMessages = [];

        Object.keys(rooms).map(val => {
            Object.keys(rooms[val].messages).map(valMes => {
                if(rooms[val].messages[valMes].body !== null && rooms[val].messages[valMes].body.toLowerCase().includes(_search)) {
                    rooms[val].messages[valMes].part = SEARCH.messages;
                    _resultMessages.push(rooms[val].messages[valMes])
                }

                return null;
            })

            return null;
        })

        return _resultMessages;
    }

    let notFoundView = () => {
        return (
            <div className="no-result-wrapper">
                <b>Oops...</b>
                <p>
                    Could not find any results
                </p>
            </div>
        )
    }

    return (
        <div className="room-list-on-search-wrapper" style={props.style}>
            {resultSearch.length === 0 ?
                notFoundView()
                :
                resultSearch.length > 0 &&
                    <SearchResultComponent
                        resultSearch={resultSearch}
                        row={printRowSearchList}
                        dataLength={resultSearch.length}
                        containerHeight={serchPanelHeight}
                        mainProps={props}
                        refProps={resultSearchRef}
                        // onClickRetryMoreCaseUnassignedProps={onClickRetryMoreCase}
                        // onScrollRoomListListenerProps={() => onScrollRoomListListener("list-unassigned-case")}
                        // listNameProps={"list-unassigned-case"}
                        // refProps={lastUnassignedMineCaseReff}
                    />
            }
        </div>
    );
}


const mapStateToProps = state => ({
    userContactsNoGroup: state.userContactsNoGroup,
    activeRoom: state.activeRoom
});

const mapDispatchToProps = {
    setActiveRoom,
    setGoToChatBubble
};
  
export default connect(mapStateToProps, mapDispatchToProps)(RoomListOnSearch);
