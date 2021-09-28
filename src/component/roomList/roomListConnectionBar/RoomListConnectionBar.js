import React from 'react';
import './RoomListConnectionBar.scss';
import { FaExclamationCircle } from 'react-icons/fa';

const CONNECTING_STATUS = {
  disconnected: 1,
  loading: 2,
  connected: 3
};

var RoomListConnectionBar = (props) => {
  let connectionStatus = props.connectingStatusProps;

  let connectStatusClassName = () => {
    let status = "";

    switch(connectionStatus) {
      case CONNECTING_STATUS.disconnected:
          status = "error";
          break;
      case CONNECTING_STATUS.loading:
          status = "waiting";
          break;
      default:
          break;
      // case CONNECTING_STATUS.connected:
      //     status = "connected";
      //     break;
    }

    return status;
  }

  return (
    <div className={`room-list-connection-bar-container status-${connectStatusClassName()} ${props.connectingStatusProps !== CONNECTING_STATUS.connected ? 'active-connection-bar': ''}`} 
         style={{height: `${props.connectingStatusProps !== CONNECTING_STATUS.connected ? '26px' : '0'}`}}
    >
      {renderStatus(connectionStatus)}
    </div>
  );
}

var renderStatus = (status) => {
    switch(status) {
        case CONNECTING_STATUS.loading:
          return (
            <React.Fragment>
                <div className="lds-ring"><div></div><div></div><div></div><div></div></div>
                <b>RECONNECTING</b>
            </React.Fragment>
          )
        // case CONNECTING_STATUS.disconnected:
        //   return (
        //     <React.Fragment>
        //         <div className="lds-ring"><div></div><div></div><div></div><div></div></div>
        //         <b>WAITING FOR NETWORK</b>
        //     </React.Fragment>
        //   )
        case CONNECTING_STATUS.disconnected:
            return (
                <React.Fragment>
                    <FaExclamationCircle />
                    <b>DISCONNECTED</b>
                </React.Fragment>
            )
        // case CONNECTING_STATUS.connected:
        //     return (
        //         <React.Fragment>
        //             <FaCheck />
        //             <b>CONNECTED</b>
        //         </React.Fragment>
        //     )
        default:
            break;
    }
}

export default RoomListConnectionBar;
