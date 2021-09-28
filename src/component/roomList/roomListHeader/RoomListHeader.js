import React from 'react';
import SearchBox from '../../reuseableComponent/searchBox/SearchBox';
import './RoomListHeader.scss';
import iconEdit from '../../../assets/img/edit-orange.svg';
import Helper from '../../../helper/Helper';
import { connect } from 'react-redux';
import { taptalk } from '@taptalk.io/web-sdk';

var RoomListHeader = (props) => {
  let user = taptalk.getTaptalkActiveUser();

  return (
    <div className="top-room-list-wrapper">
        <div className="room-list-top-avatar-wrapper">
          <div className="my-avatar" onClick={() => props.toggleMyAccountModal()}>
            {user !== null && 
              (user.imageURL.thumbnail === '' ?
                <div className="avatar-abbreviation">
                    <b>{Helper.renderUserAvatarWord(user.fullname, false)}</b>
                </div>
                :
                <img src={user.imageURL.thumbnail} alt="" />
              )
            }
          </div>
        </div>

        <SearchBox 
          placeholder="Search" 
          style={{marginTop: "1px"}} 
          onChangeInputSearch={props.onChangeSearchRoomListProps} 
          value={props.searchingProps}
          clearSearchingProps={props.clearSearchingProps}
        />
        
        <div className="room-list-top-new-icon-wrapper" onClick={() => props.toggleNewChatModal()}>
          <img className="room-list-top-new-icon smaller-hover" 
              src={iconEdit} 
              alt=""
          />
        </div>
    </div>
  );
}

const mapStateToProps = state => ({
  appData: state.appData,
});

export default connect(mapStateToProps, null)(RoomListHeader);
