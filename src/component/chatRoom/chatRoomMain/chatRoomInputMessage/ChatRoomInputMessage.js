import React, { useState, useRef, useEffect } from 'react';
import { Modal, ModalBody } from 'reactstrap';
import MediaQuery from 'react-responsive';
import './ChatRoomInputMessage.scss';
import { FiPaperclip, FiChevronLeft, FiChevronRight, FiX, FiUpload, FiSmile, FiFile, FiImage } from 'react-icons/fi';
// import { MdInsertDriveFile, MdImage } from 'react-icons/md';
import { tapCoreChatRoomManager } from '@taptalk.io/web-sdk';
import { connect } from 'react-redux';
import { IoIosClose } from "react-icons/io";
import AddImage from "../../../../assets/img/add-image.svg";
import Airplane from '../../../../assets/img/icon-airplane.svg';
import Helper from "../../../../helper/Helper";
import HelperUpload from "../../../../helper/HelperUpload";
import HelperChat from '../../../../helper/HelperChat';
import { setPreviewImageOrVideo } from "../../../../redux/actions/reduxActionPreviewImageOrVideo";
import { clearReplyMessage } from '../../../../redux/actions/reduxActionReplyMessage';
import { clearForwardMessage } from '../../../../redux/actions/reduxActionForwardMessage';
import 'emoji-mart/css/emoji-mart.css';
import { Picker } from 'emoji-mart';
import ChatRoomReplyMessage from "./chatRoomReplyMessage/ChatRoomReplyMessage";
import ChatRoomForwardMessage from "./chatRoomForwardMessage/ChatRoomForwardMessage";
import ChatRoomMentionList from "./chatRoomMentionList/ChatRoomMentionList";

var ChatRoomInputMessage = (props) => {
  let [inputFileShow, setInputFileShow] = useState(false);
  let chatRoomMesageInputRef = useRef("messageInput");
  let [isShowModalMedia, setIsShowModalMedia] = useState(false);
  let [isShowModalMediaLoading, setIsShowModalMediaLoading] = useState(false);
  let [isActiveButtonSend, setIsActiveButtonSend] = useState(false);
  let [isTyping, setIsTyping] = useState(false);
  let [typingTimeoutID, setTypingTimeoutID] = useState(0);
  let [selectedMention, setSelectedMention] = useState(false);
  
  let [arrayOfFileUploadValue, setArrayOfFileUploadValue] = useState([]);

  // let [sendMediaType, setSendMediaType] = useState('');
  // let [captionLimit, setCaptionLimit] = useState(0);
  // let [mediaImageFileSrc, setMediaImageFileSrc] = useState('');
  // let [mediaVideoFileSrc, setMediaVideoFileSrc] = useState('');
  let [lastChangeMediaInput, setLastChangeMediaInput] = useState({
    files: [],
    time: ""
  });
  let [arrayOfMediaUploadValue, setArrayOfMediaUploadValue] = useState([]);
  let [currentActiveSelectedFile, setCurrentActiveSelectedFile] = useState(null);
  let [showDropFileHereOnModal, setShowDropFileHereOnModal] = useState(false);
  // let [mediaFile, setMediaFile] = useState('');
  let [listOfParticipant, setListOfParticipant] = useState([]);

  useEffect(() => {
    if(lastChangeMediaInput.time !== "") {
      runMediaInputChange(lastChangeMediaInput.files);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [lastChangeMediaInput])

  useEffect(() => {
    if(props.lastDragAndDropFilesProps.files.length > 0) {
      runMediaInputChange(props.lastDragAndDropFilesProps.files)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [props.lastDragAndDropFilesProps])

  useEffect(() => {
    setIsActiveButtonSend(false);
    setListOfParticipant([]);

    if(props.activeRoom !== null) {
      let selectorInputText = document.querySelectorAll(".main-textarea-input")[0];
      selectorInputText.focus();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [props.activeRoom])
  
  useEffect(() => {
    if(arrayOfFileUploadValue.length > 0) {
      props.runningFileMessageProps(arrayOfFileUploadValue);
      setArrayOfFileUploadValue([]);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [arrayOfFileUploadValue]);

  useEffect(() => {
    bodyClickListener();
    // listenerDocumentInputChange();
    // listenerMediaInputChange();
    let elTextInput = document.getElementsByClassName("main-textarea-input")[0];

    if(props.replyMessage.message || props.forwardMessage.message) {
      elTextInput.focus();
    }

    // input growing
    let elChatRoomMain = document.getElementsByClassName("chat-room-main-wrapper")[0];
    let maxHeightChatroom = 108; // 158
    
    let selInputRoomHeight = (height) => {
      elChatRoomMain.style.setProperty("max-height", "calc(100vh - "+height+"px)", "important");
    };

    let onInputMessageListener = (e) => {
      let defaultTextAreaHeight = 40;       
      let maxTextareaHeight = 120 + 20; // 5 rows - 20px per row
      let replyMessageHeight = 68;

      if(e.target.value === "") {
          elTextInput.removeAttribute("style");
          
          if(props.replyMessage.message || props.forwardMessage.message) {
            elChatRoomMain.style.setProperty("max-height", "calc(100vh - 176px)", "important");
          }else {
            elChatRoomMain.removeAttribute("style");
          }
      }

      let textAreaHeightBefore = e.target.style.height === "" ? 40 : parseInt(e.target.style.height.replace("px", ""));
      
      elTextInput.style.height = "";
      elTextInput.style.height = elTextInput.scrollHeight + "px";

      let textareaCurrentHeight = parseInt(e.target.style.height.replace("px", ""));
      let textareaActualCurrentHeight = elTextInput.offsetHeight;
      if(textAreaHeightBefore !== textareaCurrentHeight) {
          if(textareaActualCurrentHeight <= maxTextareaHeight) {
              if(textAreaHeightBefore < textareaCurrentHeight) {
                let chatRoomContainerMaxHeightVal = maxHeightChatroom + (textareaActualCurrentHeight - defaultTextAreaHeight);
                selInputRoomHeight((props.replyMessage.message || props.forwardMessage.message) ? chatRoomContainerMaxHeightVal + replyMessageHeight : chatRoomContainerMaxHeightVal);
              }

              if(textAreaHeightBefore > textareaCurrentHeight) {
                let chatRoomContainerMaxHeightVal = maxHeightChatroom - (defaultTextAreaHeight - textareaActualCurrentHeight);
                selInputRoomHeight((props.replyMessage.message || props.forwardMessage.message) ? chatRoomContainerMaxHeightVal + replyMessageHeight : chatRoomContainerMaxHeightVal);
              }
          }
      }
    }

    elTextInput.addEventListener("input", onInputMessageListener);

    //input growing
    return () => {
      elTextInput.removeEventListener("input", onInputMessageListener)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [props.replyMessage, props.forwardMessage]);

  let bodyClickListener = () => {
    let target = document.querySelector('body');
    
    target.addEventListener('click', function() {
      setInputFileShow(false)
    })
  }

  let listenerDocumentInputChange = (e) => {    
    // let target = document.querySelector('#document-input');
    
    // target.addEventListener('change', function(e) {
      HelperUpload.checkFileLimit(e.target.files, {
        onAllowed: () => {
          HelperUpload.checkFileSizeLimit(e.target.files, {
            onAllowed: (arrayOfFiles) => {
              setArrayOfFileUploadValue(arrayOfFiles);
            },
            onReachLimit: (message) => {
              Helper.doToast(message, "fail");
            }
          })
        },
        onReachLimit: (message) => {
          Helper.doToast(message, "fail");
        }
      })

      e.target.value = null;
    // })
  }

  let actionOnMediaInputChange = (mediaFiles) => {
    setArrayOfMediaUploadValue(mediaFiles);
    
    
    setCurrentActiveSelectedFile({
      file: mediaFiles[mediaFiles.length - 1],
      index: mediaFiles.length - 1
    })
    
    setIsShowModalMedia(true);
  }

  let runMediaInputChange = (files) => {
    setIsShowModalMediaLoading(true);

    HelperUpload.checkFileAllowed(files, {
      onAllowed: () => {
        HelperUpload.checkFileLimit(files, {
          onAllowed: () => {
            HelperUpload.checkFileSizeLimitForMedia(arrayOfMediaUploadValue, files, {
              onAllowed: (arrayOfMedia) => {
                setTimeout(() => {
                  setIsShowModalMediaLoading(false);
                  actionOnMediaInputChange(arrayOfMedia);
                }, 1000)
              },
              onReachLimit: (message) => {
                setIsShowModalMediaLoading(false);
                Helper.doToast(message, "fail");
              }
            })
          },
          onReachLimit: (message) => {
            setIsShowModalMediaLoading(false);
            Helper.doToast(message, "fail");
          }
        })
      },
      onFileTypeDidntMatch: (message) => {
        setIsShowModalMediaLoading(false);
        Helper.doToast(message, "fail");
      }
    })
  }

  let listenerMediaInputClick = (e) => {
    e.target.value = null;
  }

  let listenerMediaInputChange = (e) => {
    // let target = document.querySelector('#media-input');

    // target.addEventListener('click', function(e) {
    //   this.value = null;
    // })
    
    // target.addEventListener('change', function(e) {
      setLastChangeMediaInput({
        files: e.target.files,
        time: new Date().valueOf()
      });
      
    // })
  }

  let inputFileView = () => {
      return (
          <div className="input-file-wrapper-chat" style={{display: inputFileShow ? 'block' : 'none'}}>
            <label htmlFor="document-input">
                <div className="input-file-content">
                    <FiFile />
                    <span>Documents</span>
                </div>
            </label>
            <input type="file" name="document" id="document-input" multiple onChange={(e) => listenerDocumentInputChange(e)} />
            
            {/* <label>
                <div className="input-file-content">
                <MdCameraAlt />
                <span>Camera</span> 
                </div>
            </label> */}

            <label htmlFor="media-input">
                <div className="input-file-content">
                    <FiImage />
                    <span>Media</span> 
                </div>
            </label>

            <input type="file" name="media" id="media-input" accept='image/*,video/*' multiple onClick={(e) => listenerMediaInputClick(e)} onChange={(e) => listenerMediaInputChange(e)} />

            {/* <label>
                <div className="input-file-content">
                <MdPermContactCalendar />
                <span>Contact</span> 
                </div>
            </label> */}
          </div>
      )
  }

  let inputFileViewResponsive = () => {
    return (
        <Modal isOpen={inputFileShow} className="modal-document-responsive" toggle={() => setInputFileShow(false)}>
          <ModalBody>
              <div className="input-file-wrapper-chat">
                <label htmlFor="document-input">
                    <div className="input-file-content">
                        <FiFile />
                        <span>Documents</span>
                    </div>
                </label>
                <input type="file" name="document" id="document-input" multiple onChange={(e) => listenerDocumentInputChange(e)} />
                
                {/* <label>
                    <div className="input-file-content">
                    <MdCameraAlt />
                    <span>Camera</span> 
                    </div>
                </label> */}

                <label htmlFor="media-input">
                    <div className="input-file-content">
                        <FiImage />
                        <span>Media</span> 
                    </div>
                </label>

                <input type="file" name="media" id="media-input" accept='image/*,video/*' multiple onClick={(e) => listenerMediaInputClick(e)} onChange={(e) => listenerMediaInputChange(e)} />

                {/* <label>
                    <div className="input-file-content">
                    <MdPermContactCalendar />
                    <span>Contact</span> 
                    </div>
                </label> */}
              </div>

              <div className="cancel-document-modal" onClick={() => setInputFileShow(false)}>
                <b>Cancel</b>
              </div>
          </ModalBody>
        </Modal>
    )
  }

  let inputFileViewLoading = () => {
    return (
        <Modal isOpen={isShowModalMediaLoading} className="modal-document-loading">
          <ModalBody>
              <div className="lds-ring">
                <div /><div /><div /><div />
              </div>
              <p>
                <b>Loading File</b>
              </p>
              
          </ModalBody>
        </Modal>
    )
  }

  let onClickMediaInput = () => {
    // setCaptionLimit(0);
    // setSendMediaType('');
    // setMediaImageFileSrc('');
    // setMediaFile('');
    // setMediaVideoFileSrc('');
  }

  let onChangeCaptionInput = (e) => {
    let _currentActiveSelectedFile = {...currentActiveSelectedFile};
    let _arrayOfMediaUploadValue = arrayOfMediaUploadValue.slice();

    _arrayOfMediaUploadValue[_currentActiveSelectedFile.index].caption = e.target.value;
    
    setArrayOfMediaUploadValue(_arrayOfMediaUploadValue);
    // setCaptionLimit(e.target.value.length)
  }

  let startTyping = () => {
    if (isTyping) {
        return;
    }

    setIsTyping(true);
    
    tapCoreChatRoomManager.sendStartTypingEmit(props.activeRoom.roomID);
  }

  let stopTyping = () => {
    if (!isTyping) {
        return;
    }

    clearTimeout(typingTimeoutID);

    setIsTyping(false);
    setTypingTimeoutID(0);
    
    tapCoreChatRoomManager.sendStopTypingEmit(props.activeRoom.roomID);
  }

  let onChangeInputMessage = (e) => {
    if(e.target.value.length > 0) {
      setIsActiveButtonSend(true);
    }else {
      setListOfParticipant([]);
      setIsActiveButtonSend(false);
    }
  }

  let keyPressInputMessage = async (e) => {
    if(e.which === 13 && !e.shiftKey) {        
        actionSubmitMessage(e);
    }

    if(e.target.value.length > 0) {
      setIsActiveButtonSend(true);
    }else {
      setIsActiveButtonSend(false);
    }
  }

  let actionSubmitMessage = async (e) => {
    if(listOfParticipant.length !== 0) {
      onClickMention(selectedMention.user);
    }else {
      e.preventDefault();
      setIsActiveButtonSend(false);
  
      props.onInputNewMessageProps(chatRoomMesageInputRef.current.value);
      chatRoomMesageInputRef.current.value = "";
      props.clearReplyMessage();
      props.clearForwardMessage();
      HelperChat.resetChatRoomHeightAndInputText();
      setListOfParticipant([]);
    }
  }

  let resetMediaUploadState = () => {
    props.setLastDragAndDropFilesProps();
    setArrayOfMediaUploadValue([]);
    setCurrentActiveSelectedFile(null);
  }

  let toggleModalMedia = () => {
    resetMediaUploadState();
    setIsShowModalMedia(!isShowModalMedia);
  }

  let generateModalMedia = () => {
      let runSetActiveCurrentSelectedFile = (file, index) => {
        setCurrentActiveSelectedFile({
          file: file,
          index: index
        })
      }

      let singeRemoveSelectedFile =(index) => {
        let _arrayOfMediaUploadValue = arrayOfMediaUploadValue.slice();

        _arrayOfMediaUploadValue.splice(index, 1);

        if(_arrayOfMediaUploadValue.length === 0) {
          toggleModalMedia();
        }else {
          runSetActiveCurrentSelectedFile(_arrayOfMediaUploadValue[0], 0);
        }

        setArrayOfMediaUploadValue(_arrayOfMediaUploadValue);
      }

      let onClickSelectedFileNavigator = (direction) => {
        let _arrayOfMediaUploadValue = arrayOfMediaUploadValue.slice();
        let _currentActiveSelectedFile = {...currentActiveSelectedFile};
        
        if(direction === "left") {
          let index = _currentActiveSelectedFile.index - 1;
          runSetActiveCurrentSelectedFile(_arrayOfMediaUploadValue[index], index);
        }else {
          let index = _currentActiveSelectedFile.index + 1;
          runSetActiveCurrentSelectedFile(_arrayOfMediaUploadValue[index], index);
        }
      }

      let toggleShowDropFileHereOnModal = () => {
        setShowDropFileHereOnModal(!showDropFileHereOnModal);
      }

      let generateModalDragAndDropViewHere = () => {
        let handleDropFile = (e) => {
            props.hidedropFileHereProps();
            e.preventDefault();
            toggleShowDropFileHereOnModal();
            let files= e.dataTransfer.files;
            runMediaInputChange(files);
        }
    
        return (
          <div className={`drop-file-here-wrapper ${showDropFileHereOnModal ? "active-drop-file-here-wrapper" : ""}`}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {handleDropFile(e)}}
          >
            <div className="drop-file-here-content">
              <div className="drop-file-here-inner-content">
                <FiUpload />
    
                <p>
                  Drop your files, image or video here
                </p>
              </div>
            </div>
          </div>
        )
      }

      return (
          <div onDragEnter={() => toggleShowDropFileHereOnModal()} onDragLeave={() => toggleShowDropFileHereOnModal()}>
            <Modal isOpen={isShowModalMedia} className={'modal-media'}>
              <ModalBody>
                  {generateModalDragAndDropViewHere()}
                  <div className="top-button-wrapper">
                    <div className="close-modal-media"  onClick={() => toggleModalMedia()}>
                      <IoIosClose className="close-modal-video" />
                      <b>Cancel</b>
                    </div>

                    <div className="file-counter file-counter-mobile">
                          <b>{arrayOfMediaUploadValue.length}/5</b>
                    </div>
                  </div>

                  {currentActiveSelectedFile !== null &&
                    <React.Fragment>
                      {currentActiveSelectedFile.index !== 0 &&
                        <FiChevronLeft  className="preview-arrow-navigator left-preview-navigator" onClick={() => onClickSelectedFileNavigator("left")} />
                      }

                      {currentActiveSelectedFile.index !== arrayOfMediaUploadValue.length - 1 &&
                        <FiChevronRight className="preview-arrow-navigator right-preview-navigator" onClick={() => onClickSelectedFileNavigator("right")} />
                      }

                      <div className="video-image-wrapper">
                          <div className="preview-container">
                            {/* {sendMediaType === 'image' ? */}
                              {/* <img src={mediaImageFileSrc} alt='' /> */}
                            {currentActiveSelectedFile.file.type.split("/")[0] === "image" ?
                              <img src={currentActiveSelectedFile.file.fileSrc} alt="" />
                              :
                              <video controls id="video-input-preview" key={`video-preview-${currentActiveSelectedFile.file.name}`}>
                                <source src={currentActiveSelectedFile.file.fileSrc} type="video/mp4" />
                                <source src={currentActiveSelectedFile.file.fileSrc} type="video/ogg" />
                              </video>
                            }
                          </div>

                          {currentActiveSelectedFile !== null &&
                            <div className="caption-container">
                              <input 
                                type="text"
                                placeholder="Add caption..." 
                                onChange={(e) => onChangeCaptionInput(e)} 
                                maxLength={100}
                                id="input-caption"
                                value={arrayOfMediaUploadValue[currentActiveSelectedFile.index].caption}
                              />

                              {/* <img src={Airplane} 
                                  alt="" 
                                  className="airplane-icon" 
                                  onClick={() => submitMediaChatAction()} /> */}

                              <span className="caption-limit-text">{arrayOfMediaUploadValue[currentActiveSelectedFile.index].caption.length}/100</span>
                            </div>
                          }
                      </div>
                    </React.Fragment>
                  }
                  
                  <div className="selected-file-wrapper">
                      <div className="file-counter file-counter-desktop">
                            <b>{arrayOfMediaUploadValue.length}/5</b>
                      </div>
                      
                      <div className="selected-file-container">
                        <div className="selected-file-container-inner">
                          {arrayOfMediaUploadValue.length < HelperUpload.fileUploadLimit &&
                            <React.Fragment>
                              <label htmlFor="media-input" onClick={() => onClickMediaInput()}>
                                <div className="add-more-file-button">
                                  <img src={AddImage} alt="" />
                                  <br />
                                  Add More
                                </div>
                              </label>

                              <input type="file" name="media" id="media-input" accept='image/*,video/*' multiple />
                            </React.Fragment>
                          }
                          
                          {currentActiveSelectedFile !== null &&
                            arrayOfMediaUploadValue.map((value, index) => {
                              return (
                                currentActiveSelectedFile.index === index ? 
                                  <div className={`selected-file-content active-selected-file`} 
                                      key={`media-thumbnail-${index}`}
                                  >
                                    <div className="remove-selected-file-button" onClick={() => singeRemoveSelectedFile(index)}>
                                      <FiX />
                                    </div>
                                    
                                    {value.type.split("/")[0] === "image" ?
                                      <img src={value.fileSrc} alt="" className="media-thumbnail" />
                                      :
                                      <video src={value.fileSrc} alt="" className="media-thumbnail"/>
                                    }

                                    <div className="dark-layer" />
                                  </div>
                                  :
                                  <div className={`selected-file-content ${currentActiveSelectedFile.index === index ? "active-selected-file" : ""}`} 
                                      key={`media-thumbnail-${index}`}
                                      onClick={() => runSetActiveCurrentSelectedFile(value, index)}
                                  >
                                    <div className="remove-selected-file-button" onClick={() => singeRemoveSelectedFile(index)}>
                                      <FiX />
                                    </div>
                                    {value.type.split("/")[0] === "image" ?
                                      <img src={value.fileSrc} alt="" className="media-thumbnail" />
                                      :
                                      <video src={value.fileSrc} alt="" className="media-thumbnail" />
                                    }

                                    <div className="dark-layer" />
                                  </div>
                              )
                            }
                          )}
                        </div>
                      </div>

                      <div className="send-media-button-wrapper">
                        <button className="orange-button" onClick={() => submitMediaChatAction()}>
                          <img src={Airplane} 
                              alt="" 
                              className="airplane-icon" 
                          />

                          <b>Send</b>
                        </button>
                      </div>
                  </div>
              </ModalBody>
            </Modal>
          </div>
      );
  }

  let submitMediaChatAction = () => {
    let timeout = 0;
    setIsShowModalMedia(false);
    // let targetInputCaption = document.querySelector('#input-caption');
    // let targetInputMedia = document.querySelector('#media-input');
 
    // if(sendMediaType === 'image') {
    //   props.runningImageMessageProps(mediaFile, targetInputCaption.value);
    // }

    // if(sendMediaType === 'video') {
    //   props.runningVideoMessageProps(mediaFile, targetInputCaption.value);
    // }
    arrayOfMediaUploadValue.map((value, index) => {
      if(index > 0) { timeout += 700; }

      if(value.type.split("/")[0] === "image") {
        setTimeout(() => {
          props.runningImageMessageProps(value, value.caption, index);
        }, timeout);
      }else {
        setTimeout(() => {
          props.runningVideoMessageProps(value, value.caption, index);
        }, timeout); 
      }

      resetMediaUploadState();
      return null;
    })
  }

  let onSelectEmoji = (e) => {
    let target = document.querySelectorAll('.main-textarea-input')[0];
    target.value = target.value + e.native;
    setIsActiveButtonSend(true);
  }

  let runOnChange = async (e) => {
    onChangeInputMessage(e);
  }

  let runOnKeyUp = async (e) => {
    keyPressInputMessage(e)
    
    if(e.target.value.length > 0 && e.which !== 38 && e.which !== 40) {
      checkAndSearchUserMentionList();
    }
    
    if (isTyping) {
        if (typingTimeoutID) {
            clearTimeout(typingTimeoutID);
        }

        setTypingTimeoutID(setTimeout(() => {
            stopTyping();
        }, 7000));
    }
  }

  let runOnKeyDown = async (e) => {
    if(listOfParticipant.length > 0) {
      if(e.keyCode === 40 || e.keyCode === 38) {
        e.preventDefault();
      }
    }

    if(e.which === 13) {
      if(!e.shiftKey) {
          e.preventDefault();
      }
    }

    startTyping()
  }

  let checkAndSearchUserMentionList = async () => {
    if(props.activeRoom.type === 2) {
      let elInput = document.querySelectorAll(".main-textarea-input")[0];
      let s = elInput.value;

      if (s.includes("@")) {
        let cursorIndex = elInput.selectionStart;
        let loopIndex = elInput.selectionStart;

        while (loopIndex > 0) {
            // Loop text from cursor index to the left
            loopIndex--;
            let c = s[loopIndex];
            if (c === ' ' || c === '\n') {
              // Found space before @, return
              setListOfParticipant([]);
              return;
            }
            
            if (c === '@') {
                // Found @, start searching user
                let keyword = s.substring(loopIndex + 1, cursorIndex).toLowerCase();
                setListOfParticipant(
                  keyword === "" ?
                    props.participantList
                    :
                    props.participantList.filter((val) => {
                      return val.fullname.includes(keyword) || val.username.includes(keyword) 
                    })
                );
                  
                return;
            }
        }
        
        if(loopIndex < 1) {
          setListOfParticipant([]);
        }
      }else {
        setListOfParticipant([]);
      }
    }
  }

  let onClickMention = async (val) => {
    let elInput = document.querySelectorAll(".main-textarea-input")[0];
    let caretPosition = elInput.selectionStart;
    let s = elInput.value;
    let cursorIndex = elInput.selectionStart;
    let loopIndex = elInput.selectionStart;
    while (loopIndex > 0) {
      // Loop text from cursor index to the left
      loopIndex--;
      let c = s[loopIndex];
    
      if (c === ' ' || c === '\n') {
        setListOfParticipant([]);
        return;
      }        

      if (c === '@') {
        // Found @, start searching user
        let keyword = s.substring(loopIndex + 1, cursorIndex).toLowerCase();          
        let _val = [elInput.value.slice(0, caretPosition - keyword.length), val.username+ " ", elInput.value.slice(caretPosition)].join('');
        elInput.value = _val;
        elInput.focus();
        setListOfParticipant([]);
        return;
      }
    }
  }
  
  let runSetSelectionMention = (user, index) => {
    setSelectedMention(user ? 
      {
          user: user,
          index: index
      }
      :
      false
    );
  }

  return (
    <div className={`chat-room-input-message-wrapper`}>
        {/* <div className="taplive-main-chat-room-send-message-hamburger taplive-mark-as-solved-case-panel-toggle"
             onClick={() => props.toggleMarkAsSolvedPanelProps()}
        >
            <img src={iconHamburgerWhite} alt="" />
        </div> */}
        
        <div className="chat-room-reply-message-mention-wrapper">
          {listOfParticipant.length > 0 &&
            <ChatRoomMentionList 
                onClickMention={onClickMention}
                listOfParticipant={listOfParticipant}
                selectedMention={selectedMention}
                runSetSelectionMention={runSetSelectionMention}
            />
          }

          {props.replyMessage.message && <ChatRoomReplyMessage />}

          {(props.forwardMessage.message && props.forwardMessage.target) && <ChatRoomForwardMessage />}

        </div>

        <form 
          onSubmit={(e) => actionSubmitMessage(e)} 
        >
            <div className="chat-room-textarea-wrapper">
                <textarea rows={1}
                  className={`main-textarea-input`}
                  placeholder="Send Message..." 
                  onBlur={() => stopTyping()}
                  ref={chatRoomMesageInputRef}
                  onChange={(e) => {
                    runOnChange(e);
                  }}
                  onKeyUp={(e) => {
                    runOnKeyUp(e)
                  }}
                  onKeyDown={(e) => {
                    runOnKeyDown(e)
                  }}
                  onClick={checkAndSearchUserMentionList}
                />

                <div className="emoji-picker-outer-wrapper">
                  <FiSmile
                    className="emoji-toggle-button"
                  />

                  <div className="emoji-picker-main-wrapper">
                    <Picker 
                      onSelect={(e) => onSelectEmoji(e)} 
                      showPreview={false}
                    />
                  </div>
                </div>
                
                <FiPaperclip onClick={() => setInputFileShow(!inputFileShow)}
                            className={inputFileShow ? 'active-paperclip' : ''} 
                />

                <MediaQuery minDeviceWidth={768}>
                  {inputFileView()}
                </MediaQuery>

                <MediaQuery minDeviceWidth={300} maxDeviceWidth={767}>
                  {inputFileViewResponsive()}
                </MediaQuery>
            </div>
            
            {isActiveButtonSend ? 
              <button className="chat-send-wrapper">
                  <img src={Airplane} alt="" />
              </button>
              :
              <button className="chat-send-wrapper" disabled>
                  <img src={Airplane} alt="" />
              </button>
            }
        </form>
        
        {generateModalMedia()}
        {inputFileViewLoading()}
    </div>
  );
}

const mapStateToProps = state => ({
    activeRoom: state.activeRoom,
    replyMessage: state.replyMessage,
    forwardMessage: state.forwardMessage,
    participantList: state.participantList,
});

const mapDispatchToProps = {
  setPreviewImageOrVideo,
  clearReplyMessage,
  clearForwardMessage
}

export default connect(mapStateToProps, mapDispatchToProps)(ChatRoomInputMessage);
