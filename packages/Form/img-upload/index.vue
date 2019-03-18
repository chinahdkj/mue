<template>
    <div class="mue-img-upload">
        <ul class="mue-img-upload-list">
            <li v-for="(m, i) in thumbs" :key="i" class="__upload-img">
                <img :src="m" v-touch="{tap: () => {showPic(i);}, long: () => {removeImg(i);}}"/>
            </li>
            <li class="__upload-btn" v-if="!FORM_ITEM.readonly">
                <van-loading v-if="uploading" color=""/>
                <van-uploader v-else :disabled="disabled" :after-read="upload"
                              result-type="dataUrl" :multiple="multiple">
                    <i class="iconfont icon-tianjia" :class="{'is-disabled': disabled}"
                       aria-hidden="true"></i>
                </van-uploader>
            </li>
        </ul>
    </div>
</template>

<script>
    import {ImagePreview} from "vant";
    import {Base64ToFile, ZipImage} from "../../../src/utils/image-utils";

    export default {
        name: "MueImgUpload",
        components: {},
        inject: {
            FORM_ITEM: {
                from: "FORM_ITEM",
                default(){
                    return {};
                }
            }
        },
        props: {
            value: {type: [String, Array], default: ""},
            disabled: {type: Boolean, default: false},
            multiple: {type: Boolean, default: false},
            base64: {type: Boolean, default: false}, // 以base64格式将图片保存手机数据库
            quality: { // 新图片压缩比例
                type: Number, default: 1, validator(v){
                    return v > 0 && v <= 1;
                }
            }
        },
        data(){
            return {
                imgs: [], thumbs: [], uploading: false, dict: {}
            };
        },
        watch: {
            value: {
                immediate: true, deep: true,
                handler(v){
                    if(!this.multiple){
                        this.imgs = v ? [v] : [];
                    }
                    else{
                        this.imgs = v || [];
                    }
                }
            },
            imgs: {
                deep: true, immediate: true,
                handler(v){
                    if(!Array.isArray(v)){
                        return
                    }

                    if(this.multiple){
                        this.$emit("input", v);
                    }
                    else{
                        this.$emit("input", v.length === 0 ? "" : v[0]);
                    }

                    this.dict = {};
                    v.forEach((p) => {
                        this.$set(this.dict, p, p);
                    });

                    if(this.base64){
                        let prms = v.map((p) => {
                            return this.queryLocal(p);
                        });

                        Promise.all(prms).then((datas) => {
                            for(let i = 0; i < datas.length; i++){
                                let {_id, data} = datas[i];
                                if(!_id){
                                    continue;
                                }
                                data = JSON.parse(data);
                                this.$set(this.dict, _id, data.base64);
                            }
                            this.createThumbs();
                        });
                    }
                    else{
                        this.createThumbs();
                    }
                }
            }
        },
        methods: {
            createThumbs(){
                // 生成缩略图
                this.thumbs = this.imgs.map((m) => {
                    return this.getPath(m);
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

            queryLocal(id){
                return new Promise((resolve) => {
                    return this.$native.queryLocalData({
                        params: {datas: [{key: "_id", value: id}]},
                        cb: ({datas}) => {
                            resolve(datas.length === 0 ? {} : datas[0]);
                        }
                    });
                })
            },

            saveLocal(rs, callback){
                let imgs = rs;
                if(!this.multiple){
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

            getPath(m){
                let data = this.dict[m];
                if(!data){
                    return "";
                }
                if(data.startsWith("/upload")){
                    return `${sessionStorage.getItem("host") || ""}${data}`;
                }
                return data;
            },

            upload(files){
                this.uploading = true;
                if(!Array.isArray(files)){
                    files = [files];
                }

                let datas = files.map(({content, file}) => {
                    return ZipImage(content, file, this.quality);
                });
                Promise.all(datas).then((rs) => {
                    // 图片本地保存
                    if(this.base64){
                        if(rs.length === 0){
                            this.uploading = false;
                            return;
                        }
                        this.saveLocal(rs, (result, images) => {
                            if(result.state === 0){
                                if(!this.multiple){
                                    this.imgs = [];
                                }
                                images.forEach(({_id}) => {
                                    this.imgs.push(_id);
                                });
                            }
                            else{
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
                        if(this.multiple){
                            rs.forEach(({url}) => {
                                this.imgs.push(url);
                            });
                        }
                        else{
                            this.imgs = rs.length > 0 ? [rs[0].url] : [];
                        }
                        this.uploading = false;
                    }).catch(() => {
                        this.uploading = false;
                    });
                });
            },

            showPic(i){
                let images = this.imgs.map((m) => {
                    return this.getPath(m);
                });
                this.$native.hideHeader({params: {hide: 1}});
                ImagePreview({
                    images, startPosition: i, loop: true, onClose: () => {
                        this.$native.hideHeader({params: {hide: 0}});
                    }
                });
            },
            removeImg(i){
                if(this.disabled){
                    return;
                }

                this.$dialog.confirm({
                    title: "删除", message: "是否删除此图片!"
                }).then(() => {
                    this.imgs.splice(i, 1);
                }).catch(() => {
                });
            }
        }
    }
</script>