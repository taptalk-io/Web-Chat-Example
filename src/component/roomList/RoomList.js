import React, { useState  } from 'react';
import './RoomList.scss';
import RoomListHeader from './roomListHeader/RoomListHeader';
import RoomListConnectionBar from './roomListConnectionBar/RoomListConnectionBar';
import RoomListChat from './roomListChat/RoomListChat';
import RoomListMyAccount from './roomListMyAccount/RoomListMyAccount';
import RoomListNewChat from './roomListNewChat/RoomListNewChat';
import RoomListOnSearch from './roomListOnSearch/RoomListOnSearch';
import RoomListSetupModal from './roomListSetupModal/RoomListSetupModal';
import { connect } from 'react-redux';

const SETUP_ROOM_MODAL_STATUS = {
  loading: 1,
  success: 3,
  fail: 4
}

var RoomList = (props) => {
  let [myAccountModal, setMyAccountModal] = useState(false);
  let [searching, setSearching] = useState("");

  let toggleMyAccountModal = () => {
    setMyAccountModal(!myAccountModal);
  }

  let [newChatModal, setNewChatModal] = useState(false);
  let toggleNewChatModal = () => {
    setNewChatModal(!newChatModal);
  }

  let onChangeSearchRoomList = (e) => {
    setSearching(e.target.value);
  }

  let clearSearching = () => {
    setSearching("");
  }

  return (
    <React.Fragment>
      <RoomListSetupModal setupModal={props.setupModal} />
      
      {props.setupModal === SETUP_ROOM_MODAL_STATUS.success &&
        <>
          <div className="room-list-container">
            <RoomListHeader toggleMyAccountModal={toggleMyAccountModal}
                            toggleNewChatModal={toggleNewChatModal}
                            onChangeSearchRoomListProps={onChangeSearchRoomList} 
                            searchingProps={searching}
                            clearSearchingProps={clearSearching}
            />

            <RoomListConnectionBar connectingStatusProps={props.connectingStatusProps} />
            

            <RoomListChat onClickRoomListProps={props.onClickRoomListProps} 
                          style={searching !== "" ? {display: 'none'} : {display: 'block'}}
                          messageListenerNewMessageProps={props.messageListenerNewMessageProps}
                          messageListenerUpdateMessageProps={props.messageListenerUpdateMessageProps}
                          forceRefreshRoomProps={props.forceRefreshRoomProps}
                          undoForceRefreshRoomProps={props.undoForceRefreshRoomProps}
                          connectingStatusProps={props.connectingStatusProps}
            />

            <RoomListOnSearch 
              style={searching !== "" ? {display: 'block'} : {display: 'none'}}
              searchingProps={searching} 
              connectingStatusProps={props.connectingStatusProps}
              clearSearchingProps={clearSearching}
            />
          </div>

          <RoomListMyAccount myAccountModal={myAccountModal}
              toggleMyAccountModal={toggleMyAccountModal}
          />

          <RoomListNewChat newChatModal={newChatModal}
              toggleNewChatModal={toggleNewChatModal}
              newEmitMessageProps={props.newEmitMessageProps}
          />
        </>
      }
    </React.Fragment>
  );
}

const mapStateToProps = state => ({
  appData: state.appData,
});

export default connect(mapStateToProps, null)(RoomList);