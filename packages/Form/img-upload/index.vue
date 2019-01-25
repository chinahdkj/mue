<template>
    <div class="mue-img-upload">
        <ul class="mue-img-upload-list">
            <li v-for="(m, i) in thumbs" :key="i" class="__upload-img"
                @contextmenu.stop.prevent="removeImg(i)" @click.stop.prevent="showPic(i)">
                <img :src="m"/>
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
                immediate: true,
                handler(v){
                    if(!this.multiple){
                        this.imgs = v ? [v] : [];
                    }
                    else{
                        this.imgs = v;
                    }
                }
            },
            imgs(v){
                if(this.multiple){
                    this.$emit("input", v);
                }
                else{
                    this.$emit("input", v.length === 0 ? "" : v[0]);
                }

                this.dict = {};
                v.forEach((p) => {
                    this.dict[p] = p;
                });

                if(this.base64){
                    let prms = v.map((p) => {
                        return this.queryLocal(p);
                    });

                    Promise.all(prms).then((datas)=>{
                        for(let i = 0; i < datas.length; i++){
                            let {_id, data} = datas[i];
                            if(!_id){
                                continue;
                            }
                            data = JSON.parse(data);
                            this.dict[_id] = data.base64;
                        }
                        this.createThumbs();
                    });
                }
                else{
                    this.createThumbs();
                }
            }
        },
        methods: {
            createThumbs(){
                // 生成缩略图
                let thumbs = [];
                for(let i = 0; i < this.imgs.length; i++){
                    let src = this.getPath(this.imgs[i]);
                    thumbs.push(this.zipImg(src, {type: "image/jpeg"}, 0.5, 50));
                }
                this.thumbs = [];
                if(thumbs.length === 0){
                    return;
                }
                this.uploading = true;
                Promise.all(thumbs).then((rs) => {
                    this.thumbs = rs.map(({content}) => {
                        return content;
                    });
                    this.uploading = false;
                });
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

            base64ToFile(base64, file){
                let arr = base64.split(",");
                let bytes = atob(arr[1].replace(/\s/g, ""));
                let n = bytes.length;
                let u8arr = new Uint8Array(n);
                for(let i = 0; i < n; i++){
                    u8arr[i] = bytes.charCodeAt(i);
                }

                return new File([u8arr], file.name, {type: file.type});
            },

            zipImg(content, {type, name}, quality, maxWidth){
                return new Promise((resolve) => {
                    if(quality === 1 && !maxWidth){
                        resolve({content, file: {type, name}});
                        return;
                    }
                    let img = new Image();
                    img.src = content;
                    img.crossOrigin = "anonymous";
                    img.onload = function(){
                        let canvas = document.createElement("canvas");
                        let height = this.height;
                        let width = this.width;
                        if(maxWidth && width > maxWidth){
                            let hw = height / width;
                            width = maxWidth;
                            height = hw * width;
                        }
                        canvas.height = height;
                        canvas.width = width;
                        let ctx = canvas.getContext("2d");
                        ctx.drawImage(img, 0, 0, width, height);
                        resolve({
                            content: canvas.toDataURL(type, quality), file: {type, name}
                        });
                    }
                });
            },

            upload(files){
                this.uploading = true;
                if(!Array.isArray(files)){
                    files = [files];
                }

                let datas = files.map(({content, file}) => {
                    return this.zipImg(content, file, this.quality);
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
                        let f = this.base64ToFile(content, file);
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