<template>
    <div class="mue-upload">
        <ul class="mue-upload-list">
            <li v-for="(file, i) in thumbs" :key="i" class="__upload-file">
                <div class="box" @click.stop.prevent="showAction(i)">
                    <i class="iconfont icon-baobiao-weixuanzhong"></i>
                    <span class="text">{{file.name}}</span>
                </div>
            </li>
            <li class="__upload-btn" v-if="!isReadonly && uploadAble">
                <van-loading v-if="uploading" color=""/>
                <template v-else>
                    <ccwork-upload v-if="isCCWork" ref="ccworkUpload" :disabled="disabled" :multiple="multiple"
                                   :limit="limit" :before-read="beforeRead" :after-read="onCcworkUpload">
                        <i class="iconfont icon-tianjia" :class="{'is-disabled': disabled}" aria-hidden="true"></i>
                    </ccwork-upload>
                    <van-uploader v-else :disabled="disabled" :after-read="upload" :before-read="beforeRead"
                                  :accept="accept" result-type="dataUrl" :multiple="multiple">
                        <i class="iconfont icon-tianjia" :class="{'is-disabled': disabled}"
                           aria-hidden="true"></i>
                    </van-uploader>
                </template>
            </li>
        </ul>
        <van-actionsheet v-model="pop.visible" get-container="body" :cancel-text="t('mue.common.cancel')"
                         @select="onSelect"
                         :actions="actions"/>
        <van-popup v-model="dialog.visible" get-container="body" :close-on-click-overlay="true"
                   class="form-input-dialog"
                   position="bottom" style="width:100%;height:85%;">
            <div class="form-input-dialog-header">附件预览
                <i class="iconfont icon-chushaixuanxiang" @click="dialog.visible = false"></i>
            </div>
            <div class="form-input-dialog-container">
                <iframe v-if="dialog.visible" ref="dialogFrame" frameborder="0" :src="dialog.url" marginheight='0' marginwidth='0'
                        :style="{width: '100%', height: '100%'}"/>
            </div>
            <div class="form-input-dialog-footer">
                <van-button size="large" type="default" @click="dialog.visible = false">关闭预览</van-button>
            </div>
        </van-popup>
    </div>
</template>

<script>
import {localeMixin, t} from "../../../src/locale";
import {isCCWork, getHost} from '../../../src/lib/common';
import {getHeaders} from "../../../src/lib/http";
import CcworkUpload from "./ccworkUpload";
// import ccworkBridge from 'ccwork-jsbridge';

export default {
    mixins: [localeMixin],
    name: "MueUpload",
    components: {CcworkUpload},
    inject: {
        FORM_ITEM: {
            from: "FORM_ITEM",
            default(){
                return {};
            }
        }
    },
    props: {
        accept: {type: String, default: "*/*"},
        value: {type: [String, Array], default: ""},
        disabled: {type: Boolean, default: false},
        readonly: {type: Boolean, default: false},
        multiple: {type: Boolean, default: false},
        limit: {type: Number, default: 0},
        isDownload: {type: Boolean, default: false}, //预览下载
        uploadPrefix: {type: String, default: ""},
        uploadUrl: {type: String, default: ""}, //自定义上传文件地址接口,不包含prefix
        infosUrl: {type: String, default: ""}, //自定义获取文件信息接口地址,不包含prefix
        uploadKey: {type: String, default: ""}, //自定义上传参数名
        isFrame:{type: Boolean, default: false},//是否用iframe打开预览
        isPreview: {type: Boolean, default: false}, //是否开启预览
        previewUrl: {type: String, default: ""}, //自定义文件预览ip+端口
        previewSource: {type: String, default: ""}, //自定义文件预览url的内网地址
        watchFiles: {type: Boolean, default: true}, //是否监听files
        afterUpload:{type: Function, default: null}, // 上传成功后自定义事件
    },
    data(){
        return {
            files: [], thumbs: [], uploading: false, dict: {},
            pop: {visible: false, current: -1},
            dialog: {
                visible: false,
                path:'',
            },
        };
    },
    computed: {
        actions() {
            return this.isDownload ?
                [
                    {name: t('mue.common.download'), act: 'download'},
                    {name: t('mue.common.delete'), act: 'delete'}
                ] :
                [
                    {name: t('mue.common.delete'), act: 'delete'}
                ]
        },
        uploadAble() {
            if(!this.multiple){
                return this.files.length < 1;
            }
            return this.limit > 0 ? this.files.length < this.limit : true;
        },
        isReadonly(){
            return this.FORM_ITEM.readonly || this.readonly;
        },
        isCCWork() {
            return isCCWork();
        },
        prefix() {
            return this.uploadPrefix || this.$OPTIONS.uploadPrefix || "";
        },
        resUploadUrl() {
            return (this.uploadUrl || this.$OPTIONS.uploadUrl) ?
                `${this.prefix}${this.uploadUrl || this.$OPTIONS.uploadUrl}` : `${this.prefix}/app/v1.0/upload.json`
        },
        submitKey() {
            return this.uploadKey || this.$OPTIONS.uploadKey || ""
        },
        resInfosUrl() {
            let dftUrl = this.prefix ? `${this.prefix}/upload/infos` : `/app/redirect/upload/infos`
            return (this.infosUrl || this.$OPTIONS.infosUrl)? `${this.prefix}${this.infosUrl || this.$OPTIONS.infosUrl}` : dftUrl
        }
    },
    watch: {
        value: {
            immediate: true,
            handler(v){
                let temp = [];
                if(!v){
                }
                else if(Array.isArray(v)){
                    temp = v;
                }else{
                    temp = [v];
                }
                this.files = temp;
            }
        },
        files: {
            deep: true, immediate: true,
            handler(v) {
                if(!this.watchFiles){
                    return;
                }
                if(this.multiple){
                    this.$emit("input", v);
                }
                else{
                    this.$emit("input", v.length === 0 ? "" : v[0]);
                }
                this.dict = {};
                let ids = Object.values(v);
                if(ids.length === 0){
                    this.createThumbs();
                    return;
                }
                this.$http.post(this.resInfosUrl,{ids}).then((res)=>{
                    v.forEach((p) => {
                        this.$set(this.dict, p, {
                            url: p,
                            name: res[p].name
                        });
                    });
                    this.createThumbs();
                });
                // if(isCCWork()) {
                //     ids.forEach((p) => {
                //         this.$set(this.dict, p, {
                //             url: p,
                //             name: p
                //         });
                //     });
                //     this.createThumbs();
                // } else {
                //     this.$http.post('/app/redirect/upload/infos',{ids}).then((res)=>{
                //         v.forEach((p) => {
                //             this.$set(this.dict, p, {
                //                 url: p,
                //                 name: res[p].name
                //             });
                //         });
                //         this.createThumbs();
                //     });
                // }
            }
        },
        'dialog.visible':{
            deep: true, immediate: true,
            handler(v){
                if(!v){
                    this.dialog.url = ''
                }
            }
        }
    },
    methods: {
        createThumbs() {
            this.thumbs = this.files.map((p) => {
                return this.getFile(p);
            })
        },
        getFile(p) {
            let url = this.dict[p].url;
            return {url: this.getPath(url), name: this.dict[p].name}
        },
        getPath(m, host = true) {
            if (!m) {
                return "";
            }
            return this.$comm.getUploadPath(m, host);
        },
        showAction(i) {
            this.pop.current = i;
            if (this.isReadonly) {
                this.downloadFile(i);
                return;
            }
            this.pop.visible = true;
        },
        onSelect({act}) {
            if (act === "delete") {
                this.removeFile();
            }
            if (act === "download") {
                this.downloadFile(this.pop.current);
            }
            this.pop.visible = false;
        },
        downloadFile(i) {
            let path = this.previewSource ? this.getPath(this.files[i], false) : this.getPath(this.files[i]);
            let suffix = path.substring(path.lastIndexOf('.'));
            let previewUrl = ''
            if(suffix === ".pdf") {
                previewUrl = path
            }else{
                let u = `${this.previewSource || ''}${path}${path.indexOf("?") > -1 ? "&" : "?"}download=true&origname=1`
                previewUrl = `${this.previewUrl || ""}/onlinePreview?url=${encodeURIComponent(window.HD.base64Encode(u))}`
            }
            if(!previewUrl.startsWith('http')){
                previewUrl = decodeURIComponent(sessionStorage.getItem('host') || '') + previewUrl;
            }
            console.log({host:decodeURIComponent(sessionStorage.getItem('host') || ''), '附件地址':path, '预览服务':this.previewUrl, '预览地址': previewUrl})
            if(this.isFrame){
                this.dialog.visible = true;
                this.dialog.url = previewUrl
            }else{
                window.open(previewUrl); //下载
            }
        },
        removeFile() {
            if (this.disabled) {
                return;
            }

            this.$dialog.confirm({
                title: t('mue.common.delete'), message: t('mue.form.common.delPrompt')
            }).then(() => {
                this.files.splice(this.pop.current, 1);
            }).catch(() => {
            });
        },
        beforeRead(files) {
            let fileArr = Array.isArray(files) ? [...files] : [files];
            if(this.limit <= 0){
                return true;
            }
            let limit = this.multiple ? this.limit : 1;
            if(fileArr.length <= limit && ((this.files.length + fileArr.length) <= limit)){
                return true
            }
            this.$toast.fail(t('mue.form.common.uploadLimitErrorPrompt')+this.limit);
            return false;
        },
        base64ToFile(base64, file){

            let arr = base64.split(",");
            let mime = arr[0].match(/:(.*?);/)[1];// 结果：   image/png
            let bytes = atob(arr[1].replace(/\s/g, ""));
            let n = bytes.length;
            let u8arr = new Uint8Array(n);
            for(let i = 0; i < n; i++){
                u8arr[i] = bytes.charCodeAt(i);
            }

            let blob = new Blob([u8arr], {type: file.type});
            blob.lastModifiedDate = new Date();
            blob.name = file.name;
            return blob;
        },
        upload(files){
            this.uploading = true;
            if(!Array.isArray(files)){
                files = [files];
            }
            let posts = files.map(({content, file}) => {

                let form = new FormData();
                let f = this.base64ToFile(content, file);
                let key = this.submitKey ? this.submitKey : "file"
                form.append(key, file);
                // form.append("id", file.name);

                return this.$http.post(this.resUploadUrl, form, {
                    processData: false, contentType: false
                });
            });
            this.$ajax.all(posts).then((rs) => {
                if(this.multiple){
                    rs.forEach((r) => {
                        if(typeof this.afterUpload === "function"){
                            this.thumbs = this.afterUpload(r,this.thumbs);
                            return
                        }
                        this.files.push(r.url || r);
                    });
                }
                else{
                    if(typeof this.afterUpload === "function"){
                        this.thumbs = this.afterUpload(rs,this.thumbs);
                        this.uploading = false;
                        return
                    }
                    this.files = rs.length > 0 ? [rs[0].url || rs[0]] : [];
                }

                files.forEach((res,idx)=>{
                    this.$emit("on-success", rs[idx], res.file);
                })

                this.uploading = false;
            }).catch(()=>{
                this.uploading = false;
            });
        },
        //云上协同文件上传
        async onCcworkUpload(urls){
            this.uploading = true;
            let rs = []
            for(let i=0; i<urls.length; i++) {
                let url = await this.onFileUpload(urls[i]);
                rs.push(url);
            }
            if(this.multiple){
                rs.forEach((url) => {
                    if(typeof this.afterUpload === "function"){
                        this.thumbs = this.afterUpload(url,this.thumbs);
                        return
                    }
                    this.files.push(url);
                });
            }
            else{
                if(typeof this.afterUpload === "function"){
                    this.thumbs = this.afterUpload(rs,this.thumbs);
                    this.uploading = false;
                    return
                }
                this.files = rs.length > 0 ? [rs[0]] : [];
            }
            this.uploading = false;
        },
        onFileUpload(url) {
            return new Promise((resolve, reject) => {
                ccworkBridge.ccworkFileUpload({
                    // api: 'http://192.168.100.179:8089/app/v1.0/upload.json',
                    api: `${getHost()}${this.resUploadUrl}`,
                    headers: getHeaders(),
                    value: [url],
                    params: {}
                }, (data) => {
                    let res = data.result.url ? JSON.parse(data.result.url) : data.result;
                    if(res.Code === 0) {
                        resolve(res.Response.url);
                    } else {
                        this.uploading = false;
                        reject(res.Message)
                    }
                })
            });
        }
    }
}
</script>
<style lang="less" scoped>
.form-input-dialog{
    &.fullscreen{
        width: 100%;
        height: 100%;
        box-sizing: border-box;
        padding: 0;
    }
    .form-input-dialog-header{
        height: 44px;
        line-height: 44px;
        padding: 0 12px;
        position: relative;
        font-size: 14px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        background-color: #f0f0f0;
        color: #757575;
        .iconfont{
            position: absolute;
            padding:0 12px;
            right: 0;
        }
    }
    .form-input-dialog-container{
        height: calc(100% - 88px);
    }
    .form-input-dialog-footer{
        height: 44px;
        padding: 0px;
        position: relative;
        display: flex;
        align-items: center;
        /deep/.van-button{
            flex: 1;
            border-radius: 0px;
            margin: 0;
            &.van-button--default{
                color: #333333;
            }
        }
    }
    .text-button{
        padding: 0;
    }
}
</style>
