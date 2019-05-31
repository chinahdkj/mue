<template>
    <div class="mue-img-upload">

        <ul class="mue-img-upload-list">
            <li v-for="(m, i) in thumbs" :key="i" class="__upload-img">
                <div class="box" @click="showAction(i)">
                    <img :src="m.url"/>
                    <div v-if="m.type === 'video'" class="box-shadow">
                        <i class="fa fa-video-camera"></i>
                    </div>
                </div>
            </li>
            <li class="__upload-btn" v-if="!isReadonly && uploadAble">
                <van-loading v-if="uploading" color=""/>
                <div v-else>
                    <button v-if="accept !== 'image'" class="upload-btn" type="button"
                            :disabled="disabled" @click="uploadhadVideo()">
                        <i class="iconfont icon-tianjia" :class="{'is-disabled': disabled}" aria-hidden="true"></i>
                    </button>
                    <van-uploader ref="uploadbtn" :disabled="disabled" :after-read="upload" :before-read="beforeRead"
                                  result-type="dataUrl" :multiple="multiple" accept="image/*">
                        <i class="iconfont icon-tianjia" :class="{'is-disabled': disabled}"
                           aria-hidden="true"></i>
                    </van-uploader>
                </div>
            </li>
        </ul>

        <van-actionsheet v-model="pop.visible" get-container="body" cancel-text="取消"
                         @select="onSelect"
                         :actions="[{name: '预览文件', act: 'view'}, {name: '删除', act: 'delete'}]"/>

        <van-actionsheet v-model="uploadPop.visible" get-container="body" cancel-text="取消"
                         @select="typeSelect"
                         :actions="[{name: '上传图片', act: 'image'}, {name: '拍摄视频', act: 'video'}]"/>

        <!--<van-popup v-model="videoPop.visible" class="mue-img-upload-pop">
            <video :src="videoPop.src" style="width:100%;height:300px;" controls></video>
        </van-popup>-->

    </div>
</template>

<script>
    import {ImagePreview} from "vant";
    import {Base64ToFile, ZipImage} from "../../../src/utils/image-utils";

    const IMG = 'image/jpg,image/jpeg,image/png,image/gif,image/bmp';
    const VIDEO = 'video/mp4,video/rmvb,video/avi,video/mov,video/flv,video/3gp';

    export default {
        name: "MueImgUpload",
        components: {},
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
            readonly: {type: Boolean, default: false},
            multiple: {type: Boolean, default: false},
            base64: {type: Boolean, default: false}, // 以base64格式将图片保存手机数据库
            quality: { // 新图片压缩比例
                type: Number, default: 1, validator(v) {
                    return v > 0 && v <= 1;
                }
            },
            limit: {type: Number, default: 5},
            accept: {
                type: String, default: "image"
            }
        },
        data() {
            return {
                imgs: [], thumbs: [], uploading: false, dict: {},
                pop: {visible: false},
                uploadPop: {visible: false},
                // videoPop: {visible: false, src: ''},
                current: -1
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
            isReadonly(){
                return this.FORM_ITEM.readonly || this.readonly;
            }
        },
        watch: {
            value: {
                immediate: true, deep: true,
                handler(v) {
                    let temp = [];
                    if (!v) {
                    }
                    else if (Array.isArray(v)) {
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
                    }
                    else {
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

                    if (this.base64 || this.accept !== "image") {
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
                    }
                    else {
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
                    this.$refs.uploadbtn.$el.getElementsByClassName("van-uploader__input")[0].click();
                }
                else if (act === "video") {
                    this.videoUpload();
                }
                this.uploadPop.visible = false;
            },
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
                if (whole.startsWith("/upload")) {
                    return `${sessionStorage.getItem("host") || ""}${whole}`;
                }
                return whole;
            },

            upload(files) {
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
                            }
                            else {
                                console.error(result.msg);
                            }
                            this.uploading = false;
                        });
                        return;
                    }

                    let posts = rs.map(({content, file}) => {
                        let form = new FormData();
                        let f = Base64ToFile(content, file);
                        form.append("file", f, file.name);

                        return this.$http.post("/app/v1.0/upload.json", form, {
                            processData: false, contentType: false
                        });
                    });

                    this.$ajax.all(posts).then((rs) => {
                        if (this.multiple) {
                            rs.forEach(({url}) => {
                                this.imgs.push(url);
                            });
                        }
                        else {
                            this.imgs = rs.length > 0 ? [rs[0].url] : [];
                        }
                        this.uploading = false;
                    }).catch(() => {
                        this.uploading = false;
                    });
                });
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
                                this.$toast.fail('上传失败');
                            }
                            this.uploading = false;
                        }
                    },
                );
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
                }
                else if (act === "delete") {
                    this.removeFile();
                }
                this.pop.visible = false;
            },

            showFile() {
                let type = this.fileType(this.imgs[this.current]);
                if (type === 'image') {
                    let images = this.imgs.filter((f) => {
                        return this.fileType(f) === 'image'
                    }).map((p) => {
                        return this.getPath(p);
                    });
                    this.$native.hideHeader({params: {hide: 1}});
                    let tempArr = this.imgs.slice(0,this.current);
                    let videoNum = tempArr.filter((v) => {
                        return this.fileType(v) === 'video'
                    }).length;
                    let newIndex =  this.current - videoNum;
                    ImagePreview({
                        images, startPosition: newIndex, loop: true,
                        onClose: () => {
                            this.$native.hideHeader({params: {hide: 0}});
                        }
                    });
                } else {
                    // this.videoPop.visible = true;
                    let videoPath = this.dict[this.imgs[this.current]].path;
                    this.$native.showVideo({params: {path: videoPath}});
                }
            },
            removeFile() {
                if (this.disabled) {
                    return;
                }

                this.$dialog.confirm({
                    title: "删除", message: "是否删除此文件!"
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
                    return true;
                }
                let limit = this.multiple ? this.limit : 1;
                if (fileArr.length <= limit && ((this.imgs.length + fileArr.length) <= limit)) {
                    return true
                } else {
                    this.$toast.fail(`上传文件不能超过${this.limit}个`);
                }
            }
        }
    }
</script>