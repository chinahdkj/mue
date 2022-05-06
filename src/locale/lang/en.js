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
            search: "Search",
            delete: "Delete",
            download: "Download",
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
            },
            uniqueFail: "Uniqueness validation failed",
            beUnique: "Must be unique",
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
    },

    //表单验证
    "async-validate": {
        "default": "*#{%s}#* validate error",
        required: "*#{%s}#* is required",
        "enum": "*#{%s}#* must be one of %s",
        whitespace: "*#{%s}#* cannot be empty",
        date: {
            format: "*#{%s}#* date %s is invalid for format %s",
            parse: "*#{%s}#* date could not be parsed, %s is invalid ",
            invalid: "*#{%s}#* date %s is invalid"
        },
        types: {
            string: "*#{%s}#* is not a %s",
            method: "*#{%s}#* is not a %s (function)",
            array: "*#{%s}#* is not an %s",
            object: "*#{%s}#* is not an %s",
            number: "*#{%s}#* is not a %s",
            date: "*#{%s}#* is not a %s",
            boolean: "*#{%s}#* is not a %s",
            integer: "*#{%s}#* is not an %s",
            float: "*#{%s}#* is not a %s",
            regexp: "*#{%s}#* is not a valid %s",
            email: "*#{%s}#* is not a valid %s",
            url: "*#{%s}#* is not a valid %s",
            hex: "*#{%s}#* is not a valid %s"
        },
        string: {
            len: "*#{%s}#* must be exactly %s characters",
            min: "*#{%s}#* must be at least %s characters",
            max: "*#{%s}#* cannot be longer than %s characters",
            range: "*#{%s}#* must be between %s and %s characters"
        },
        number: {
            len: "*#{%s}#* must equal %s",
            min: "*#{%s}#* cannot be less than %s",
            max: "*#{%s}#* cannot be greater than %s",
            range: "*#{%s}#* must be between %s and %s"
        },
        array: {
            len: "*#{%s}#* must be exactly %s in length",
            min: "*#{%s}#* cannot be less than %s in length",
            max: "*#{%s}#* cannot be greater than %s in length",
            range: "*#{%s}#* must be between %s and %s in length"
        },
        pattern: {
            mismatch: "*#{%s}#* value %s does not match pattern %s"
        },

        // tinymce富文本编辑器
        tinymce: {

        }
    }
};
