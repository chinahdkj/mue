import vanLang from "vant/lib/locale/lang/zh-CN";

export default {
    vant: {
        code: "zh-CN",
        lang: vanLang,
    },

    mue: {
        common: {
            confirm: "确定",
            submit:'提交',
            cancel: "取消",
            search: "搜索",
            clear: "清空",
            delete: "删除",
            download: "查看",
            empty: "暂无数据",
            placeholder: "输入选项关键字"
        },

        search: {
            placeholder: "请输入搜索关键词"
        },

        tree: {
            placeholder: "输入选项关键字"
        },

        dataTable: {
            allLoadedText: "条数据已加载，没有更多数据了",
        },

        dateRangePicker: {
            start: "起始",
            end: "截止",
        },

        dvr: {
            tooltip: "请添加视频"
        },

        form: {
            common: {
                delPrompt: '是否删除此文件？',
                uploadLimitErrorPrompt: '上传文件数量不能超过',
            },
            gis: {
                longText: "经度",
                latText: "纬度",
                positionText: "定位",
                zoomInText: "放大",
                zoomOutText: "缩小",
                rangeOutText: "超出范围",
            },
            imgUpload: {
                viewText: '预览文件',
                imageText: '上传图片',
                videoText: '拍摄视频',
                errorTiltop:'图片保存至相册时发生错误',
                errorUpload:'上传失败'
            },
            soundRecord: {
                playText: "播放音频",
                errorText: '录制失败',
            },
            signature: {
                viewText: "预览文件",
                resignText: "重签",
            },
            uniqueFail: "唯一性验证失败",
            beUnique: "不能重复",
        },
        imgPreview: {
            downloadSuccess: "已下载至手机相册",
            downloadError: "下载失败"
        },
        loadMore: {
            topPullText: "下拉可以刷新",
            topLoadingText: "刷新中...",
            topDropText: "释放开始刷新",
            bottomPullText: "上拉加载更多",
            bottomDropText: "释放开始加载",
            bottomLoadingText: "加载中...",
            allLoadedText: "没有更多了",
        }
    },

    // 表单验证
    "async-validate": {
        default: "*#{%s}#*校验失败",
        required: "*#{%s}#*必填项",
        enum: "*#{%s}#*必须是 %s 中的一个",
        whitespace: "*#{%s}#*不能为空",
        date: {
            format: "*#{%s}#*日期对象 %s 无效，当转换 %s时",
            parse: "*#{%s}#*日期对象不能被解析, %s 无效",
            invalid: "*#{%s}#*日期对象 %s 无效",
        },
        types: {
            string: "*#{%s}#*不是一个 %s",
            method: "*#{%s}#*不是一个 %s (function)",
            array: "*#{%s}#*不是一个 %s",
            object: "*#{%s}#*不是一个 %s",
            number: "*#{%s}#*不是一个 %s",
            date: "*#{%s}#*不是一个 %s",
            boolean: "*#{%s}#*不是一个 %s",
            integer: "*#{%s}#*不是一个 %s",
            float: "*#{%s}#*不是一个 %s",
            regexp: "*#{%s}#*不是一个有效的 %s",
            email: "*#{%s}#*不是一个有效的 %s",
            url: "*#{%s}#*不是一个有效的 %s",
            hex: "*#{%s}#*不是一个有效的 %s",
        },
        string: {
            len: "*#{%s}#*须包含 %s 个字符",
            min: "*#{%s}#*须大于 %s 个字符",
            max: "*#{%s}#*须小于 %s 个字符",
            range: "*#{%s}#*须小于 %s 到 %s 个字符",
        },
        number: {
            len: "*#{%s}#*须等于 %s",
            min: "*#{%s}#*须大于 %s",
            max: "*#{%s}#*须小于 %s",
            range: "*#{%s}#*须介于 %s 、 %s 之间",
        },
        array: {
            len: "*#{%s}#*的长度须等于 %s",
            min: "*#{%s}#*的长度须大于 %s",
            max: "*#{%s}#*的长度须小于 %s",
            range: "*#{%s}#*的长度须介于 %s 、 %s 之间",
        },
        pattern: {
            mismatch: "*#{%s}#*的值 %s 不匹配正则 %s",
        }
    },
};
