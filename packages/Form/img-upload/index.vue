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
                    <!-- 水印相机 -->
                    <button v-if="accept === 'watermark'" class="upload-btn" type="button"
                            :disabled="disabled" @click="uploadWatermark()">
                        <i class="iconfont icon-tianjia" :class="{'is-disabled': disabled}"
                           aria-hidden="true"></i>
                    </button>
                    <!-- 视频 或 图片视频 -->
                    <button v-else-if="accept === 'video' || accept === 'all'" class="upload-btn" type="button"
                            :disabled="disabled" @click="uploadhadVideo()">
                        <i class="iconfont icon-tianjia" :class="{'is-disabled': disabled}"
                           aria-hidden="true"></i>
                    </button>
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
                </div>
            </li>
        </ul>

        <van-actionsheet v-model="pop.visible" get-container="body" :cancel-text="t('mue.common.cancel')"
                         @select="onSelect"
                         :actions="[{name: t('mue.form.imgUpload.viewText'), act: 'view'}, {name: t('mue.common.delete'), act: 'delete'}]"/>

        <van-actionsheet v-model="uploadPop.visible" get-container="body" :cancel-text="t('mue.common.cancel')"
                         @select="typeSelect"
                         :actions="[{name:  t('mue.form.imgUpload.imageText'), act: 'image'}, {name: t('mue.form.imgUpload.videoText'), act: 'video'}]"/>

        <mue-img-preview @upload="save" :is-comment="isComment" :visible.sync="preview.visible" :images="preview.images" :start-position="preview.start"/>

        <van-popup v-model="videoPop.visible" class="mue-img-upload-pop">
            <div style="width: 100vw; height: 300px; display: flex; align-items: center; justify-content: center;background: black;">
                <video :src="videoPop.src" v-if="videoPop.visible" style="width:100%;height:100%;top: 0;left: 0; background: black" autoplay controls></video>
            </div>
        </van-popup>

    </div>
</template>

<script>
import {Base64ToFile, ZipImage} from "../../../src/utils/image-utils";
import { isAndroid, isDingTalk, isCCWork, getHost, isHdkj, isDingGov } from "../../../src/lib/common";
import androidUpload from "./androidUpload";

import {localeMixin, t} from "../../../src/locale";

const IMG = 'image/jpg,image/jpeg,image/png,image/gif,image/bmp,image/heic';
const VIDEO = 'video/mp4,video/rmvb,video/avi,video/mov,video/flv,video/3gp';

export default {
    mixins: [localeMixin],
    name: "MueImgUpload",
    components: {
        androidUpload
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
        appid: {type: String, default: null}, // 用于开发平台自定义表单设置了base64离线模式时候，将appid置空上传到统一平台上（其他业务单独使用该组件时，也可以配置appid为空来实现自动上传图片到统一平台）
        quality: { // 新图片压缩比例
            type: Number, default: 1, validator(v) {
                return v > 0 && v <= 1;
            }
        },
        limit: {type: Number, default: 5},
        mType: {type: Number, default: 0}, // 原生multi_file 方法支持的mType参数 0:图片, 1:文件 3:拍照
        accept: {
            type: String, default: "image"
        },
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
        uploadKey: {type: String, default: ""} //自定义上传参数名
    },
    data() {
        return {
            isDingdingEnv: sessionStorage.getItem('isDingdingEnv'),
            isCCWork: isCCWork(),
            isHdkj: isHdkj(),
            imgs: [], thumbs: [], uploading: false, dict: {},
            pop: {visible: false},
            uploadPop: {visible: false},
            uploadAccept: 'image/*', // 图片 image/* 视频 video/* 用于h5上传附件区分类型
            videoPop: {visible: false, src: ''},
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
            let type = '';
            switch (this.accept) {
                case 'image':
                    type = IMG;
                    break;
                case 'video':
                    type = VIDEO;
                    break;
                case 'watermark':
                    type = IMG;
                    break;
                case 'all':
                    type = `${IMG},${VIDEO}`;
                    break;
                default:
                    type = IMG;
            }
            return type;
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
        isDing(){
            return isDingTalk()
        }
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
                    let url = p
                    if(type === 'video'){
                        if(p.indexOf('?') > -1){
                            url = `${p.split('?')[0]}.jpg?${p.split('?')[1]}`
                        }else{
                            url = `${p}.jpg`
                        }
                    }
                    this.$set(this.dict, p, {
                        url: url, // 图片，缩略图
                        type,
                        path: this.getPath(p), //完整路径
                        local: false // 是否本地文件
                    });
                });

                // 仅限和达环境支持离线模式和视频的离线存储。其他都是在线
                if ((this.base64 || this.accept === "video" || this.accept === 'all') && isHdkj()) {
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
        uploadhadVideo() {
            this.accept === 'video' ? this.videoUpload() : this.uploadPop.visible = true;
        },
        typeSelect({act}) {
            if (act === "image") {
                this.uploadAccept = 'image/*'
                // 和达环境或浪潮或浙政钉环境支持用原生方法获取图片。其他用h5代替
                this.$nextTick(() => {
                    if (isHdkj() || isCCWork() || isDingGov()) {
                        this.$refs.androidUpload.Upload();
                    } else {
                        this.$comm.clickElement(this.$refs.uploadbtn.$el.getElementsByClassName("van-uploader__input"));
                    }
                })
            } else if (act === "video") {
                this.videoUpload();
            }
            this.uploadPop.visible = false;
        },
        fileType(url) {
            let suffix = "";
            if(url.includes("fileName=")) {
                let name = "fileName"
                let urlParamStr = url.split("?")[1];
                let reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
                let r = urlParamStr.match(reg);
                if (r != null) {
                    let fileName = decodeURIComponent(r[2]);
                    if(fileName.lastIndexOf('.') === fileName.indexOf('.')){
                        suffix = fileName.substring(fileName.lastIndexOf('.') + 1).toLowerCase();
                    }else{
                        suffix = fileName.substring(fileName.indexOf('.') + 1).toLowerCase();
                    }
                }
            } else {
                suffix = url.substring(url.lastIndexOf('.') + 1).toLowerCase();
            }
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
                    c6: this.appid !== null ? this.appid : this.$comm.getAppId(""),
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
            let path = this.$comm.getUploadPath(whole)
            if(path.startsWith('data')){
                return path
            }
            return path + `${path.indexOf('?') > -1 ? '&' : '?'}uniwater_utoken=${sessionStorage.getItem('authortoken')}`;
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
            this.uploadAccept = 'image/*'
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
            this.base64ToUpload(data.base64,data.index)
        },
        upload(files, index = '') {
            this.uploading = true;
            if (!Array.isArray(files)) {
                files = [files];
            }


            let datas = files.map(({content, file}) => {
                if(this.uploadAccept === 'image/*'){
                    return ZipImage(content, file, this.quality);
                }else{
                    return { content, file: {type: file.type, name: file.name} }
                }
            });
            Promise.all(datas).then((rs) => {
                // 图片本地保存
                // 原生和达环境才支持离线模式
                if (this.base64 && isHdkj()) {
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

                    return new Promise((resolve, reject)=>{
                        this.$http.post(this.resUploadUrl, form, {
                            processData: false, contentType: false
                        }, null, this.header).then(r=>{
                            // 视频封面上传 不是和达不是浪潮 并且是视频上传的时候
                            if(!isHdkj() && !isCCWork() && this.uploadAccept === 'video/*'){
                                // 获取视频封面并上传
                                let url = r.startsWith('/upload/') ? (getHost() + r) : r
                                let suffix = url.includes("?") ? url.split('?')[0] : url
                                const poster = this.getVideoBase64(content)
                                poster.then(_img=>{
                                    let { file: formFile, id, filename: formFileName } = this.base64toFile(_img, suffix, file.name)
                                    let form = new FormData();
                                    form.append(key, formFile, formFileName);
                                    form.append("id", id);
                                    this.$http.post(this.resUploadUrl, form, {
                                        processData: false, contentType: false
                                    },null, this.header)
                                })
                            }
                            resolve(r)
                        }).catch(r=>{
                            reject(r)
                        })
                    })
                });

                this.$ajax.all(posts).then((rs) => {
                    if(index === '' || typeof index === 'object') {
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
            this.uploadAccept = 'video/*'
            // 仅限和达或浪潮或浙政钉环境支持视频拍摄，其他调用h5方法
            if (isHdkj() || isCCWork() || isDingGov()) {
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
            }else{
                this.$nextTick(()=>{
                    this.$comm.clickElement(this.$refs.uploadbtn.$el.getElementsByClassName("van-uploader__input"));
                })
            }
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
            let type = this.fileType(this.imgs[this.current]);
            if (type === 'image') {
                this.preview.images = this.imgs.filter((f) => {
                    return this.fileType(f) === 'image'
                }).map((p) => {
                    return this.getPath(this.dict[p].url)
                });
                this.$native.hideHeader({params: {hide: 1}});
                let tempArr = this.imgs.slice(0, this.current);
                let videoNum = tempArr.filter((v) => {
                    return this.fileType(v) === 'video'
                }).length;
                // let newIndex = this.current - videoNum;

                this.preview.start = this.current - videoNum;
                this.preview.visible = true;

                /*ImagePreview({
                    images, startPosition: newIndex, loop: true,
                    onClose: () => {
                        this.$native.hideHeader({params: {hide: 0}});
                    }
                });*/
            } else {
                // this.videoPop.visible = true;
                let videoPath = this.dict[this.imgs[this.current]].path;
                // 仅限和达和浪潮环境支持视频播放，其他需要h5
                if(isHdkj() || isCCWork()){
                    if(videoPath.startsWith('/upload/')){
                        this.$native.showVideo({params: {path: getHost() + videoPath}});
                    }else{
                        this.$native.showVideo({params: {path: videoPath}});
                    }
                }else{
                    if(videoPath.startsWith('/upload/')){
                        this.videoPop.src = getHost() + videoPath
                        this.videoPop.visible = true
                    }else{
                        this.videoPop.src = videoPath
                        this.videoPop.visible = true
                    }
                }
            }
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
        },
        getVideoBase64(url){
            return new Promise(function(resolve, reject) {
                let dataURL = '';
                let video = document.createElement("video");
                video.setAttribute('crossorigin', 'anonymous'); //处理跨域
                video.setAttribute('src', url);
                video.setAttribute('width', 180);
                video.setAttribute('height', 320);
                video.setAttribute('controls', 'controls');
                video.currentTime = 1  //视频时长，一定要设置，不然大概率白屏
                video.addEventListener('loadeddata', function(e) {
                    let canvas = document.createElement("canvas"),
                        width = video.width, //canvas的尺寸和图片一样
                        height = video.height;
                    canvas.width = width;
                    canvas.height = height;
                    canvas.getContext("2d").drawImage(video, 0, 0, width, height); //绘制canvas
                    dataURL = canvas.toDataURL('image/jpeg',0.3); //转换为base64
                    let img = document.createElement("img");
                    img.src = dataURL
                    video.setAttribute('poster', dataURL);
                    resolve(dataURL);
                });
            })
        },
        base64toFile(dataurl, name = 'file', file = ''){
            let arr = dataurl.split(',')
            let mime = arr[0].match(/:(.*?);/)[1]
            let suffix = mime.split('/')[1]
            let bstr = atob(arr[1])
            let n = bstr.length
            let u8arr = new Uint8Array(n)
            while (n--) {
                u8arr[n] = bstr.charCodeAt(n)
            }
            return {
                file: new File([u8arr], `${name}.${suffix}`, {
                    type: mime
                }),
                id: `${name}.${suffix}`,
                filename: `${file}.${suffix}`,
            }
        }
    },
}
</script>
