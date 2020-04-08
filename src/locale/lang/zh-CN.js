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
            clear: "清空",
            delete: "删除",
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
            }
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
    }
};