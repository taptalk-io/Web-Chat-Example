import React, { useState, useEffect } from 'react';
import './ChatRoomHeaderInfoVideo.scss';
import Helper from '../../../../../helper/Helper';
import { tapCoreChatRoomManager } from '@taptalk.io/web-sdk';
import { IoIosVideocam } from 'react-icons/io';
import { CircularProgressbar } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import { MdClose } from 'react-icons/md';
import { MdFileDownload } from 'react-icons/md';

var ChatRoomHeaderInfoVideo = (props) => {
    let [percentageDownload, setPercentageDownload] = useState(0);
    let [videoSrc, setVideoSrc] = useState('');
    let [isVideoExistInDB, setIsVideoExistInDB] = useState(false);
    let [onDownloadVideoProgress, setOnVideoDownloadProgress] = useState(false);

    useEffect(() => {
        getVideoBase64();
    // eslint-disable-next-line react-hooks/exhaustive-deps
}, [props.mediaData])

    let downloadFile = () => {
        setOnVideoDownloadProgress(true);
    
        tapCoreChatRoomManager.downloadMessageFile(props.mediaData, {
            onSuccess: (data) => {
                let _data = {
                  type: data.contentType,
                  file: data.base64
                };

                setOnVideoDownloadProgress(false);
                setVideoSrc(_data);
                setIsVideoExistInDB(true);
            },
    
            onProgress: (message, percentage, bytes) => {
                setPercentageDownload(percentage);
            },
    
            onError: (errorCode, errorMessage) => {
                setOnVideoDownloadProgress(false);
                console.log(errorCode, errorMessage);
            }
        })
    }

    let getVideoBase64 = () => {
        tapCoreChatRoomManager.getFileFromDB(props.mediaData.data.fileID, function(data) {
            if(data) {
                setVideoSrc(data);
                setIsVideoExistInDB(true);
            }else {
                setVideoSrc(props.mediaData.data.thumbnail);
                setIsVideoExistInDB(false);
            }
        })
    }

    return (
        <div className="room-data-video-wrapper">
            <IoIosVideocam className="video-icon" />

            {isVideoExistInDB ?
              <video src={`data:${videoSrc.type};base64, ${videoSrc.file}`} 
                     className="video-thumbnail" 
                     onClick={() => props.toggleModalFileProps(videoSrc)}
              />
               :     
              <img src={`data:image/png;base64, ${props.mediaData.data.thumbnail}`} alt="" /> 
            }

            <span className="size-wrapper">{Helper.bytesToSize(props.mediaData.data.size)}</span>

            <span className="duration-wrapper">{Helper.msToTime(props.mediaData.data.duration)}</span>

            {onDownloadVideoProgress &&
                <div className="action-icon-wrapper">
                    <CircularProgressbar value={percentageDownload} />
                    <MdClose onClick={() => console.log('cancel')} className="icon-action" />
                </div>
            }

            {(!isVideoExistInDB && !onDownloadVideoProgress) &&
                <div className="action-icon-wrapper">
                    <MdFileDownload onClick={() => downloadFile()} className="icon-action" />
                </div>
            }
        </div>
    )
}

export default ChatRoomHeaderInfoVideo;
