<template>
    <div class="mue-signature">
        <ul class="mue-signature-list">
            <li v-for="(m, i) in thumbs" :key="i" class="__upload-img">
                <div class="box" @click="showAction(i)">
                    <img :src="m.url"/>
                </div>
            </li>

            <li class="__upload-btn" v-if="!isReadonly && uploadAble">
                <van-loading v-if="uploading" color=""/>
                <div v-else>
                    <!--<button class="upload-btn" type="button"
                            :disabled="disabled" @click="doSignature">
                        <i class="iconfont icon-tianjia" :class="{'is-disabled': disabled}"
                           aria-hidden="true"></i>
                    </button>-->
                    <button class="signature-btn" type="button" :disabled="disabled" @click="doSignature">

                    </button>
                    <van-uploader ref="uploadbtn" :disabled="disabled" :after-read="upload"
                                  :before-read="beforeRead"
                                  result-type="dataUrl" :multiple="multiple" accept="image/*">
                        <!--<i class="iconfont icon-tianjia" :class="{'is-disabled': disabled}"
                           aria-hidden="true"></i>-->
                    </van-uploader>
                </div>
            </li>
        </ul>

        <van-actionsheet v-model="pop.visible" get-container="body" :cancel-text="t('mue.common.cancel')"
                         @select="onSelect"
                         :actions="[{name: t('mue.form.signature.viewText'), act: 'view'},
                         {name: t('mue.form.signature.resignText'), act: 'resign'},
                         {name: t('mue.common.delete'), act: 'delete'}]"/>

        <mue-img-preview :visible.sync="preview.visible" :images="preview.images" :start-position="preview.start" />
    </div>
</template>

<script>
    import {Base64ToFile, ZipImage} from "../../../src/utils/image-utils";
    import {localeMixin, t} from "../../../src/locale";
    export default {
        name: "MueSignature",
        mixins: [localeMixin],
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
        },
        data() {
            return {
                imgs: [], thumbs: [], uploading: false, dict: {},
                pop: {visible: false},
                current: -1,
                preview: {
                    visible: false,
                    images: [],
                    start: 0
                }
            };
        },
        computed: {
            uploadAble() {
                if (!this.multiple) {
                    return this.imgs.length < 1;
                }
                return this.limit > 0 ? this.imgs.length < this.limit : true;
            },
            isReadonly() {
                return this.FORM_ITEM.readonly || this.readonly;
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
                        this.$set(this.dict, p, {
                            url: p,
                            path: this.getPath(p),
                            local: false
                        });
                    });

                    if (this.base64) {
                        let prms = v.map((p) => {
                            return this.queryLocal(p);
                        });

                        Promise.all(prms).then((datas) => {
                            for (let i = 0; i < datas.length; i++) {
                                let {_id, data} = datas[i];
                                if (!_id) {
                                    continue;
                                }
                                data = JSON.parse(data);
                                this.$set(this.dict, _id, {
                                    url: _id,
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
            createThumbs() {
                // 生成缩略图
                this.thumbs = this.imgs.map((p) => {
                    return this.getFile(p);
                });
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
                return {url: this.getPath(url)}
            },
            //获取完整路径
            getPath(whole) {
                if (!whole) {
                    return "";
                }
                return this.$comm.getUploadPath(whole);
            },

            async doSignature() {
                let url = await this.getSignatureData();
                if (!url) {
                    return
                }
                this.imgs = [url];
                /*let base64 = await this.getBase64Image(this.getPath(url));
                let type = base64.substring(base64.indexOf(':') + 1, base64.indexOf(';'));
                let name = `Signature.${type.substring(type.lastIndexOf('/') + 1)}`;
                let blob = Base64ToFile(base64, {type, name});
                let file = {content: base64, file: blob};
                this.upload(file);*/
            },

            getSignatureData() {
                return new Promise(resolve => {
                    this.$native.signature({
                        params: {},
                        cb: ({url}) => {
                            resolve(url);
                        }
                    });
                });
            },

            getBase64Image(url) {
                return new Promise(resolve => {
                    let img = new Image();
                    img.src = url;
                    img.onload = function() {
                        let canvas = document.createElement("canvas");
                        canvas.width = img.width;
                        canvas.height = img.height;
                        let ctx = canvas.getContext("2d");
                        ctx.drawImage(img, 0, 0, img.width, img.height);
                        let ext = img.src.substring(img.src.lastIndexOf(".") + 1).toLowerCase();
                        let dataURL = canvas.toDataURL("image/" + ext);
                        resolve(dataURL);
                    }
                });
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
                        form.append("file", f, file.name);
                        // form.append("id", file.name);
                        return this.$http.post("/app/v1.0/upload.json", form, {
                            processData: false, contentType: false
                        });
                    });

                    this.$ajax.all(posts).then((rs) => {
                        if (this.multiple) {
                            rs.forEach(({url}) => {
                                this.imgs.push(url);
                            });
                        } else {
                            this.imgs = rs.length > 0 ? [rs[0].url] : [];
                        }
                        this.uploading = false;
                    }).catch(() => {
                        this.uploading = false;
                    });
                });
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
                } else if (act === "resign") {
                    this.doSignature();
                } else if (act === "delete") {
                    this.removeFile();
                }
                this.pop.visible = false;
            },

            showFile() {
                this.preview.images = this.imgs.map((p) => {
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

<style lang="less">

</style>
