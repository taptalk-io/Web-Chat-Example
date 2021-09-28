export const setPreviewImageOrVideo = previewImageOrVideo => {
    return { type: 'SET_PREVIEW_IMAGE_OR_VIDEO', previewImageOrVideo }
};

export const clearPreviewImageOrVideo = () => {
    return { type: 'CLEAR_PREVIEW_IMAGE_OR_VIDEO' }
};