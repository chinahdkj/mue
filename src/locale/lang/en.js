import vanLang from "vant/lib/locale/lang/en-US";

vanLang.confirm = "OK";

export default {
    vant: {
        code: "en-US",
        lang: vanLang,
    },
    mue: {
        common: {
            confirm: "OK",
            submit:'Submit',
            cancel: "Cancel",
            delete: "Delete",
            clear: "Clear",
            empty: "No data",
            placeholder: "Enter option keywords",
        },

        search: {
            placeholder: "Please enter the search keyword"
        },

        dataTable: {
            allLoadedText: " data loaded, no more data",
        },

        dateRangePicker: {
            start: "Start",
            end: "End",
        },

        dvr: {
            tooltip: "Please add a video"
        },

        form: {
            common: {
                delPrompt: "Whether to delete this file？",
                uploadLimitErrorPrompt: 'The number of uploaded files cannot exceed'
            },
            gis: {
                longText: "lng",
                latText: "lat",
                positionText: "pos",
                zoomInText: "zoom",
                zoomOutText: "shrink",
                rangeOutText: "Out of range",
            },
            imgUpload: {
                viewText: 'Preview file',
                imageText: 'Upload image',
                videoText: 'Take a video',
                errorTiltop:'An error occurred while saving the picture to the album',
                errorUpload:'Upload failed'
            },
            soundRecord: {
                playText: "Play audio",
                errorText: 'Recording failed',
            },
            signature: {
                viewText: "Preview file",
                resignText: "Resign",
            }
        },
        imgPreview: {
            downloadSuccess: "Downloaded to phone album",
            downloadError: "Download failed"
        },
        loadMore: {
            topPullText: "Pull down to refresh",
            topLoadingText: "Refreshing...",
            topDropText: "Release to refresh",
            bottomPullText: "Pull up to load more",
            bottomDropText: "Release to start loading",
            bottomLoadingText: "Loading...",
            allLoadedText: "No more",
        },

        tree: {
            placeholder: "Enter option keywords"
        }
    }
};