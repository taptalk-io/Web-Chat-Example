import React, { useState, useEffect } from 'react';
import './ChatRoomHeaderInfoImage.scss';
import Helper from '../../../../../helper/Helper';
import { tapCoreChatRoomManager } from '@taptalk.io/web-sdk';
import { CircularProgressbar } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import { MdClose } from 'react-icons/md';
import { MdFileDownload } from 'react-icons/md';

var ChatRoomHeaderInfoImage = (props) => {
    let [percentageDownload, setPercentageDownload] = useState(0);
    let [imageSrc, setImageSrc] = useState('');
    let [isImageExistInDB, setIsImageExistInDB] = useState(false);
    let [onDownloadImageProgress, setOnImageDownloadProgress] = useState(false);

    useEffect(() => {
        getImageBase64();
    // eslint-disable-next-line react-hooks/exhaustive-deps
}, [props.mediaData])

    let downloadFile = () => {
        setOnImageDownloadProgress(true);
    
        tapCoreChatRoomManager.downloadMessageFile(props.mediaData, {
            onSuccess: (data) => {
                setOnImageDownloadProgress(false);
                setImageSrc(data.base64);
                setIsImageExistInDB(true);
            },
    
            onProgress: (message, percentage, bytes) => {
                setPercentageDownload(percentage);
            },
    
            onError: (errorCode, errorMessage) => {
                setOnImageDownloadProgress(false);
                console.log(errorCode, errorMessage);
            }
        })
    }

    let getImageBase64 = () => {
        tapCoreChatRoomManager.getFileFromDB(props.mediaData.data.fileID, function(data) {
            if(data) {
                setImageSrc(data.file);
                setIsImageExistInDB(true);
            }else {
                setImageSrc(props.mediaData.data.thumbnail);
                setIsImageExistInDB(false);
            }
        })
    }

    return (
        <div className="room-data-image-wrapper">
            {isImageExistInDB ? 
                <img src={`data:image/png;base64, ${imageSrc}`} 
                     alt=""
                     onClick={() => props.toggleModalFileProps(imageSrc)}
                     className="downloaded-image"
                />
                :
                <img src={`data:image/png;base64, ${imageSrc}`} alt="" />
            }

            <span className="size-wrapper">{Helper.bytesToSize(props.mediaData.data.size)}</span>

            {onDownloadImageProgress &&
                <div className="action-icon-wrapper">
                    <CircularProgressbar value={percentageDownload} />
                    <MdClose onClick={() => console.log('cancel')} className="icon-action" />
                </div>
            }

            {(!isImageExistInDB && !onDownloadImageProgress) &&
                <div className="action-icon-wrapper">
                    <MdFileDownload onClick={() => downloadFile()} className="icon-action" />
                </div>
            }
        </div>
    )
}

export default ChatRoomHeaderInfoImage;
