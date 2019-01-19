<template>
    <div class="mue-img-upload">
        <ul class="mue-img-upload-list">
            <li v-for="(m, i) in thumbs" :key="i" class="__upload-img"
                @contextmenu.stop.prevent="removeImg(i)" @click.stop.prevent="showPic(i)">
                <img :src="m"/>
            </li>
            <li class="__upload-btn">
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
        props: {
            value: {type: [String, Array], default: ""},
            disabled: {type: Boolean, default: false},
            multiple: {type: Boolean, default: false},
            base64: {type: Boolean, default: false}, // 新上传图片直接返回base64
            quality: {
                type: Number, default: 1, validator(v){
                    return v > 0 && v <= 1;
                }
            }
        },
        data(){
            return {
                imgs: [], thumbs: [], uploading: false
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

                let thumbs = [];
                for(let i = 0; i < v.length; i++){
                    let src = this.getPath(v[i]);
                    thumbs.push(this.zipImg(src, {type: "image/jpeg"}, 1, 50));
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
            }
        },
        methods: {
            getPath(m){
                if(m.startsWith("/upload")){
                    return `${window.location.origin}${m}`;
                }
                return m;
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
                    if(this.base64){
                        if(this.multiple){
                            rs.forEach(({content}) => {
                                this.imgs.push(content);
                            });
                        }
                        else{
                            this.imgs = rs.length > 0 ? [rs[0].content] : [];
                        }
                        this.uploading = false;
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
                ImagePreview({images, startPosition: i, loop: true});
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