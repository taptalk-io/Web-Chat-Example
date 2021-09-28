const INITIAL_STATE = {
  fileURL: false,
  fileType: false
};

let reduxReducerPreviewImageOrVideo = (state = INITIAL_STATE, action) => {
    switch (action.type) {
      case 'SET_PREVIEW_IMAGE_OR_VIDEO':
        return action.previewImageOrVideo;
      case 'CLEAR_PREVIEW_IMAGE_OR_VIDEO':
        return INITIAL_STATE;
      default:
        return state;
    }
};

export default reduxReducerPreviewImageOrVideo;