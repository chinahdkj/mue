<template>
    <div class="mue-img-upload">
        <ul class="mue-img-upload-list">
            <li v-for="(m, i) in imgs" :key="i" class="__upload-img"
                @contextmenu.stop.prevent="removeImg(i)" @click.stop.prevent="showPic(i)">
                <img :src="getPath(m)"/>
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
                imgs: [], uploading: false
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

            zipImg(content, {type, name}){
                return new Promise((resolve) => {
                    if(this.quality === 1){
                        resolve({content, file: {type, name}});
                        return;
                    }
                    let self = this;
                    let img = new Image();
                    img.src = content;
                    img.onload = function(){
                        let canvas = document.createElement("canvas");
                        canvas.height = this.height;
                        canvas.width = this.width;
                        let ctx = canvas.getContext('2d');
                        ctx.drawImage(img, 0, 0);
                        resolve({
                            content: canvas.toDataURL(type, self.quality), file: {type, name}
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
                    return this.zipImg(content, file);
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
                ImagePreview({images: this.imgs, startPosition: i, loop: true});
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