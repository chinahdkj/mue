<template>
    <div class="mue-img-upload">
        <ul class="mue-img-upload-list">
            <li v-for="(m, i) in thumbs" :key="i" class="__upload-img">
                <div class="box" @click.stop.prevent="showAction(i)">
                    <img :src="m.url"/>
                    <div v-if="m.type === 'video'" class="box-shadow">
                        <i class="fa fa-video-camera"></i>
                    </div>
                </div>
            </li>
            <li class="__upload-btn" v-if="!isReadonly && uploadAble">
                <van-loading v-if="uploading" color=""/>
                <div v-else>
                    <button class="upload-btn" type="button"
                            :disabled="disabled" @click="uploadWatermark()">
                        <i class="iconfont icon-tuxiang" :class="{'is-disabled': disabled}"
                           aria-hidden="true"></i>
                    </button>
                </div>
            </li>
            <li class="__upload-btn" v-if="isUpload && !isReadonly && uploadAble">
                <van-loading v-if="uploading" color=""/>
                <template v-else>
                    <!-- 和达浪潮等环境... -->
                    <android-upload v-if="isCCWork || isHdkj" ref="androidUpload" :disabled="disabled" :multiple="multiple"
                                    :mType="mType" :limit="limit" :before-read="beforeRead" :after-read="upload">
                        <i class="iconfont icon-tianjia" :class="{'is-disabled': disabled}" aria-hidden="true"></i>
                    </android-upload>
                    <!-- 其他情况 -->
                    <van-uploader v-else ref="uploadbtn" :disabled="disabled" :after-read="upload"
                                  :before-read="beforeRead"
                                  result-type="dataUrl" :multiple="multiple" :accept="uploadAccept">
                        <i class="iconfont icon-tianjia" :class="{'is-disabled': disabled}"
                           aria-hidden="true"></i>
                    </van-uploader>
                </template>
            </li>
        </ul>

        <van-actionsheet v-model="pop.visible" get-container="body" :cancel-text="t('mue.common.cancel')"
                         @select="onSelect"
                         :actions="[{name: t('mue.form.imgUpload.viewText'), act: 'view'}, {name: t('mue.common.delete'), act: 'delete'}]"/>

        <mue-img-preview @upload="save" :is-comment="isComment" :visible.sync="preview.visible" :images="preview.images" :start-position="preview.start"/>

    </div>
</template>

<script>
import {Base64ToFile, ZipImage} from "../../../src/utils/image-utils";
import {isAndroid, isCCWork, isHdkj} from "../../../src/lib/common";
import AndroidUpload from "../img-upload/androidUpload.vue";
import {localeMixin, t} from "../../../src/locale";

const IMG = 'image/jpg,image/jpeg,image/png,image/gif,image/bmp';

export default {
    mixins: [localeMixin],
    name: "MueImgWatermark",
    components: {
        AndroidUpload
    },
    inject: {
        FORM_ITEM: {
            from: "FORM_ITEM",
            default() {
                return {};
            }
        }
    },
    props: {
        value: {type: [String, Array], default: ""},
        disabled: {type: Boolean, default: false},
        isComment: {type: Boolean, default: false},
        readonly: {type: Boolean, default: false},
        multiple: {type: Boolean, default: false},
        base64: {type: Boolean, default: false}, // 以base64格式将图片保存手机数据库
        quality: { // 新图片压缩比例
            type: Number, default: 1, validator(v) {
                return v > 0 && v <= 1;
            }
        },
        limit: {type: Number, default: 5},
        mType: {type: Number, default: 0}, // 原生multi_file 方法支持的mType参数 0:图片, 1:文件 3:拍照
        watermarkParams: {
            type: Object,
            default() {
                return null
            }
        },
        header: { //自定义请求头
            tyoe: Object,
            default: () => null
        },
        uploadPrefix: {
            type: String,
            default: ""
        },
        uploadUrl: {type: String, default: ""}, //自定义上传文件地址接口
        uploadKey: {type: String, default: ""}, //自定义上传参数名
        isUpload: {type: Boolean, default: false}, //是否启用上传图片和拍照
    },
    data() {
        return {
            isCCWork: isCCWork(),
            isHdkj: isHdkj(),
            isDingdingEnv: sessionStorage.getItem('isDingdingEnv'),
            imgs: [], thumbs: [], uploading: false, dict: {},
            pop: {visible: false},
            uploadAccept: 'image/*', // 图片 image/* 视频 video/* 用于h5上传附件区分类型
            current: -1,
            preview: {
                visible: false,
                images: [],
                start: 0
            }
        };
    },
    computed: {
        type() {
            return IMG;
        },
        uploadAble() {
            if (!this.multiple) {
                return this.imgs.length < 1;
            }
            return this.limit > 0 ? this.imgs.length < this.limit : true;
        },
        isReadonly() {
            return this.FORM_ITEM.readonly || this.readonly;
        },
        isAd() {
            // return false;
            return isAndroid();
        },
        prefix() {
            return this.uploadPrefix || this.$OPTIONS.uploadPrefix || "";
        },
        submitKey() {
            return this.uploadKey || this.$OPTIONS.uploadKey || ""
        },
        resUploadUrl() {
            return (this.uploadUrl || this.$OPTIONS.uploadUrl) ?
                `${this.prefix}${this.uploadUrl || this.$OPTIONS.uploadUrl}` : `${this.prefix}/app/v1.0/upload.json`
        },
    },
    watch: {
        value: {
            immediate: true, deep: true,
            handler(v) {
                let temp = [];
                if (!v) {
                } else if (Array.isArray(v)) {
                    temp = v;
                } else {
                    temp = [v];
                }
                this.imgs = temp;
            }
        },
        imgs: {
            deep: true, immediate: true,
            handler(v, ov) {
                if (!Array.isArray(v)) {
                    return
                }

                if (this.multiple) {
                    this.$emit("input", v);
                } else {
                    this.$emit("input", v.length === 0 ? "" : v[0]);
                }

                this.dict = {};
                v.forEach((p) => {
                    // this.$set(this.dict, p, p);
                    let type = this.fileType(p);
                    this.$set(this.dict, p, {
                        url: type === "video" ? `${p}.jpg` : p, // 图片，缩略图
                        type,
                        path: this.getPath(p), //完整路径
                        local: false // 是否本地文件
                    });
                });

                if (this.base64 && !isCCWork()) {
                    let prms = v.filter((p) => {
                        return this.base64 || this.fileType(p) === "video";
                    }).map((p) => {
                        return this.queryLocal(p);
                    });

                    Promise.all(prms).then((datas) => {
                        for (let i = 0; i < datas.length; i++) {
                            let {_id, data} = datas[i];
                            if (!_id) {
                                continue;
                            }
                            let type = this.fileType(_id);
                            data = JSON.parse(data);
                            this.$set(this.dict, _id, {
                                url: type === "video" ? data.thumb : data.base64,
                                type,
                                path: data.path,
                                local: true
                            });
                        }
                        this.createThumbs();
                    });
                } else {
                    this.createThumbs();
                }
            }
        }
    },
    methods: {

        fileType(url) {
            let suffix = url.substr(url.lastIndexOf('.') + 1).toLowerCase();
            return IMG.includes(suffix) ? 'image' : 'video'
        },
        createThumbs() {
            // 生成缩略图
            this.thumbs = this.imgs.map((p) => {
                return this.getFile(p);
            });
            // let thumbs = [];
            // for(let i = 0; i < this.imgs.length; i++){
            //     let src = this.getPath(this.imgs[i]);
            //     thumbs.push(ZipImage(src, {type: "image/jpeg"}, 0.5, 50));
            // }
            // this.thumbs = [];
            // if(thumbs.length === 0){
            //     return;
            // }
            // this.uploading = true;
            // Promise.all(thumbs).then((rs) => {
            //     this.thumbs = rs.map(({content}) => {
            //         return content;
            //     });
            //     this.uploading = false;
            // });
        },

        queryLocal(id) {
            return new Promise((resolve) => {
                return this.$native.queryLocalData({
                    params: {datas: [{key: "_id", value: id}]},
                    cb: ({datas}) => {
                        resolve(datas.length === 0 ? {} : datas[0]);
                    }
                });
            })
        },

        saveLocal(rs, callback) {
            let imgs = rs;
            if (!this.multiple) {
                imgs = rs.length > 0 ? [rs[0]] : [];
            }
            imgs = imgs.map(({content, file}) => {
                let {name, type} = file;
                let ext = name.split(".");
                ext = ext[ext.length - 1];
                let id = this.$comm.newFilePath(ext);
                return {
                    _id: id,
                    c6: this.$comm.getAppId(""),
                    data: JSON.stringify({
                        contextType: type, url: id, name, base64: content
                    })
                }
            });

            this.$native.saveLocalData({
                params: {type: "common-image", state: "1", datas: imgs},
                cb: (result) => {
                    callback(result, imgs);
                }
            });
        },

        getFile(p) {
            let url = this.dict[p].url;
            return {url: this.getPath(url), type: this.dict[p].type}
        },
        //获取完整路径
        getPath(whole) {
            if (!whole) {
                return "";
            }
            return this.$comm.getUploadPath(whole);
        },

        getWatermark() {
            return new Promise(resolve => {
                this.$native.watermarkCamera({
                    params: {...this.watermarkParams},
                    cb: ({code, base64Img}) => {
                        if (code === 0) {
                            resolve(base64Img);
                        }
                    }
                });
            });
        },

        //调用原生水印相机
        async uploadWatermark() {
            console.log('mue-img-watermark')
            let base64 = await this.getWatermark();
            if (!base64) {
                return
            }
            let type = base64.substring(base64.indexOf(':') + 1, base64.indexOf(';'));
            let name = `Watermark.${type.substring(type.lastIndexOf('/') + 1)}`;
            let blob = Base64ToFile(base64, {type, name});
            let file = {content: base64, file: blob};
            this.upload(file);
        },

        //base64图片主动调上传
        base64ToUpload(base64,index) {
            if (!base64) {
                return
            }
            let type = base64.substring(base64.indexOf(':') + 1, base64.indexOf(';'));
            let name = `ocr_pic.${type.substring(type.lastIndexOf('/') + 1)}`;
            let blob = Base64ToFile(base64, {type, name});
            let file = {content: base64, file: blob};
            this.upload(file, index);
        },
        save(data) {
            console.log(data)
            this.base64ToUpload(data.base64,data.index)
        },
        upload(files, index = '') {
            this.uploading = true;
            if (!Array.isArray(files)) {
                files = [files];
            }


            let datas = files.map(({content, file}) => {
                return ZipImage(content, file, this.quality);

            });
            Promise.all(datas).then((rs) => {
                // 图片本地保存
                if (this.base64) {
                    if (rs.length === 0) {
                        this.uploading = false;
                        return;
                    }
                    this.saveLocal(rs, (result, images) => {
                        if (result.state === 0) {
                            if (!this.multiple) {
                                this.imgs = [];
                            }
                            images.forEach(({_id}) => {
                                this.imgs.push(_id);
                            });
                        } else {
                            console.error(result.msg);
                        }
                        this.uploading = false;
                    });
                    return;
                }

                let posts = rs.map(({content, file}) => {
                    let form = new FormData();
                    let f = Base64ToFile(content, file);
                    let key = this.submitKey ? this.submitKey : "file"
                    form.append(key, f, file.name);
                    // form.append("id", file.name);
                    //保存到本地相册
                    /*if(!(this.isAd && this.multiple)) {
                        this.saveAlbum(content, file)
                    }*/

                    return this.$http.post(this.resUploadUrl, form, {
                        processData: false, contentType: false
                    }, null, this.header);
                });

                this.$ajax.all(posts).then((rs) => {
                    if(index === '') {
                        if (this.multiple) {
                            rs.forEach((r) => {
                                this.imgs.push(r.url || r);
                            });
                        } else {
                            this.imgs = rs.length > 0 ? [rs[0].url || rs[0]] : [];
                        }
                    }else {
                        this.imgs.splice(index, 1, rs[0].url || rs[0]);
                    }
                    this.uploading = false;
                }).catch(() => {
                    this.uploading = false;
                });
            });
        },

        saveAlbum(base64, file) {
            let prefix = `data:${file.type};base64,`
            let val = base64.substring(prefix.length);
            this.$native.resSave({
                params: {
                    type: 'img_base64',
                    value: val
                },
                cb: (res) => {
                    if (res.code === 0) {
                    } else {
                        this.$toast.success(t('mue.form.imgUpload.errorTiltop'));
                    }
                }
            })
        },

        videoUpload() {
            this.uploading = true;
            let id = this.$comm.newFilePath('mp4');
            this.$native.video({
                params: {id: id, local: this.base64},
                cb: ({code}) => {
                    if (code === 0) {
                        this.imgs.push(id);
                    } else if (code === 1) {
                    } else {
                        this.$toast.fail(t('mue.form.imgUpload.errorUpload'));
                    }
                    this.uploading = false;
                }
            });

            //云上协同目前没有“取消录制”回调，强制关闭加载动画
            if(isCCWork()) this.uploading = false;
        },

        showAction(i) {
            this.current = i;
            if (this.isReadonly) {
                this.showFile();
                return;
            }
            this.pop.visible = true;
        },

        onSelect({act}) {
            if (act === "view") {
                this.showFile();
            } else if (act === "delete") {
                this.removeFile();
            }
            this.pop.visible = false;
        },

        showFile() {
            this.preview.images = this.imgs.filter((f) => {
                return this.fileType(f) === 'image'
            }).map((p) => {
                return this.getPath(this.dict[p].url)
            });
            this.$native.hideHeader({params: {hide: 1}});

            this.preview.start = this.current;
            this.preview.visible = true;

        },
        removeFile() {
            if (this.disabled) {
                return;
            }

            this.$dialog.confirm({
                title: t('mue.common.delete'), message: t('mue.form.common.delPrompt')
            }).then(() => {
                let id = this.imgs[this.current], info = this.dict[id] || {};
                this.imgs.splice(this.current, 1);

                if (info.local) {
                    // 删除原生本地数据库数据
                    this.$native.deleteLocalData({
                        params: {datas: [{key: '_id', value: id}]}
                    });
                    // 删除原生本地文件
                    this.$native.delFile({
                        params: {path: info.path}
                    });
                }

            }).catch(() => {
            });
        },
        beforeRead(files) {
            let fileArr = Array.isArray(files) ? [...files] : [files];
            if (this.limit <= 0) {
                return fileArr;
            }
            let limit = this.multiple ? this.limit : 1;
            if (fileArr.length <= limit && ((this.imgs.length + fileArr.length) <= limit)) {
                return fileArr
            } else {
                this.$toast.fail(t('mue.form.common.uploadLimitErrorPrompt')+this.limit);
                return false;
            }
        }
    },
}
</script>
