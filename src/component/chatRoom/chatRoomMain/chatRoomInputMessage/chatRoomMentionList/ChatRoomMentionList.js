import React, { useEffect, useRef } from "react";
import "./ChatRoomMentionList.scss";
import { setParticipantList, clearParticipantList } from "../../../../../redux/actions/reduxActionParticipantList";
import Helper from "../../../../../helper/Helper";
import { taptalk } from "@taptalk.io/web-sdk";
import { FixedSizeList as List } from "react-window";
import { connect } from "react-redux";

const Row = ({ index, style, data }) => {
    // console.log(index + " " + data.list[index].fullname)
    return (
        <div 
            className={`mention-list-content ${data.selectedMention ? (data.selectedMention.user.userID === data.list[index].userID ? "active-mention" : "") : ""}`}
            style={style} 
            onClick={() => {
                data.onSelectedMention(false)
                data.onClickMention(data.list[index])
            }}
            // onMouseEnter={() => data.onSelectedMention()}
        >
            {data.list[index].imageURL.thumbnail === "" ?
                <div className="user-avatar-name" 
                    style={{background: taptalk.getRandomColor(data.list[index].fullname)}}
                    // onClick={() => toggleRoomInfoModalAction()}
                >
                    <b>{Helper.renderUserAvatarWord(data.list[index].fullname, false)}</b>
                </div>
                :
                <img src={data.list[index].imageURL.thumbnail} alt="" className="user-avatar-image" />
            }

            <p className="user-fullname">
                <b>{data.list[index].fullname}</b>
            </p>

            <p className="user-username">
                @{data.list[index].username}
            </p>
        </div>
    )
};
   
const ParticipantList = (props) => {
    let { itemLength, list, mainProps, onClickMention, refProps, onSelectedMention, selectedMention } = props;

    return (
        <List
            height={itemLength > 4 ? 222 : itemLength*58}
            itemCount={itemLength}
            itemSize={58}
            width={'100%'}
            itemData={{
                list: list,
                mainProps: mainProps,
                onClickMention: onClickMention,
                onSelectedMention: onSelectedMention,
                selectedMention: selectedMention
            }}
            ref={refProps}
        >
            {Row}
        </List>
    )
};

let ChatRoomMentionList = (props) => {
    let mentionListRef = useRef("mentionList");

    let onSelectedMention = (user, index) => {
        if(user) {
            props.runSetSelectionMention(user, index);
        }else {
            props.runSetSelectionMention(false);
        }
    }

    useEffect(() => {
        if(props.selectedMention) {
          let participant = props.listOfParticipant;
          let length = participant.length - 1;
          
          let onKeydownMention = async (e) => {
            if(e.keyCode === 40) {
              // arrow down
              let index = props.selectedMention.index === length ? 0 : props.selectedMention.index + 1;
              props.runSetSelectionMention(props.listOfParticipant[index], index);
              mentionListRef.current.scrollToItem(index);
            }
    
            if(e.keyCode === 38) {
                // arrow up
                let index = props.selectedMention.index === 0 ? length : props.selectedMention.index - 1;
                props.runSetSelectionMention(props.listOfParticipant[index], index);
                mentionListRef.current.scrollToItem(index);
            }
          }
    
          window.addEventListener('keydown', onKeydownMention);
    
          return () => {
              window.removeEventListener('keydown', onKeydownMention);
          }
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
}, [props.selectedMention])

    useEffect(() => {
        props.runSetSelectionMention(props.listOfParticipant[0], 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
}, [props.listOfParticipant])

    return (
        <div className={`
                mention-list-wrapper
                ${props.replyMessage.message || props.forwardMessage.message ? 'bottom-136' : ''}
            `}
        >
            <ParticipantList 
                itemLength={props.listOfParticipant.length}
                list={props.listOfParticipant}
                mainProps={props}
                onClickMention={props.onClickMention}
                refProps={mentionListRef}
                onSelectedMention={onSelectedMention}
                selectedMention={props.selectedMention}
            />
            {/* {props.participantList.map((val, idx) => {
                return (
                    <div className="mention-list-content" key={`mention-${idx}`}>
                        {data.list[index].imageURL.thumbnail === "" ?
                            <div className="user-avatar-name" 
                                style={{background: taptalk.getRandomColor(data.list[index].fullname)}}
                                // onClick={() => toggleRoomInfoModalAction()}
                            >
                                <b>{Helper.renderUserAvatarWord(data.list[index].fullname, false)}</b>
                            </div>
                            :
                            <img src={data.list[index].imageURL.thumbnail} alt="" className="user-avatar-image" />
                        }

                        <p className="user-fullname">
                           <b>{data.list[index].fullname}</b>
                        </p>

                        <p className="user-username">
                            @{data.list[index].username}
                        </p>
                    </div>
                )
            })} */}
        </div>
    )
}

const mapStateToProps = state => ({
    participantList: state.participantList,
    replyMessage: state.replyMessage,
    forwardMessage: state.forwardMessage,
});

const mapDispatchToProps = {
    setParticipantList,
    clearParticipantList
}

export default connect(mapStateToProps, mapDispatchToProps)(ChatRoomMentionList);