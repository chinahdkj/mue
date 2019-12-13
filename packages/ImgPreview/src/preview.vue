<template>
    <div class="mue-img-preview" v-show="isShow" v-loading.fullscreen="loading">
        <van-image-preview ref="preview" v-model="isShow" :images="imgs" :startPosition="startPosition"
                           :loop="loop" v-bind="$attrs" v-on="$listeners" @close="onClose"
                           @change="onChange">
        </van-image-preview>
        <div class="handle-btn">
            <van-icon class="handle-icon" name="replay" @click="handleRotate('right')"/>
            <van-icon class="handle-icon" name="replay" @click="handleRotate('left')"/>
            <i class="fa fa-download handle-icon" @click="download"/>
        </div>

    </div>
</template>

<script>
    import {rotateImg} from "../../../src/utils/image-utils";

    export default {
        name: 'MueImgPreview',
        inheritAttrs: false,
        props: {
            visible: {
                type: Boolean,
                default: false
            },
            images: {
                type: Array,
                default() {
                    return []
                }
            },
            startPosition: {
                type: Number,
                default: 0
            },
            loop: {
                type: Boolean,
                default: true
            }
        },
        computed: {
            isShow: {
                get() {
                    return this.visible
                },
                set(nv) {
                    this.$emit('update:visible', nv)
                    return nv
                }
            }
        },
        watch: {
            startPosition: {
                immediate: true,
                handler(v) {
                    this.current = v;
                }
            },
            images: {
                immediate: true,
                handler(v) {
                    this.imgs = [...v];
                }
            }
        },
        data() {
            return {
                current: -1,
                imgs: [],
                angles: [],
                loading: false
            }
        },
        methods: {
            onClose() {
                this.angles = [];
                this.$emit('update:visible', false);
                this.$native.hideHeader({params: {hide: 0}});
            },
            onChange(index) {
                this.current = index;
            },
            async handleRotate(direction) {
                this.loading = true
                let angle = this.angles[this.current] || 0, img = this.images[this.current];
                if (direction === 'left') {
                    this.$set(this.angles, this.current, angle + 90);
                } else {
                    this.$set(this.angles, this.current, angle - 90);
                }
                let base64 = await this.getBase64(img, this.angles[this.current]);
                this.$set(this.imgs, this.current, base64);
                this.loading = false;
            },
            getBase64(url, angle) {
                return new Promise((resolve) => {
                    let image = new Image();
                    image.crossOrigin = '';
                    image.src = url;
                    if (url) {
                        image.onload = () => {
                            let canvas = document.createElement('canvas');
                            /*canvas.width = image.width;
                            canvas.height = image.height;
                            let ctx = canvas.getContext('2d');
                            ctx.drawImage(image, 0, 0, canvas.width, canvas.height);*/
                            rotateImg(image, angle, canvas);
                            resolve(canvas.toDataURL())
                        }
                    }
                })
            },
            isBase64(str) {
                let reg = /^data:image\/[a-z]+;base64,(.|\n)+=$/;
                return reg.test(str);
            },
            wholePath(path){
                if(!path){
                    return "";
                }
                if(path.startsWith("/upload")){
                    // return `http://192.168.100.179:8081${path}`;
                    return `${this.$comm.getHost()}${path}?appid=${this.$comm.getAppId()}`;
                }
                return path;
            },
            download() {
                this.loading = true;
                let value = this.images[this.current];
                let type = this.isBase64(value) ? 'img_base64' : 'img_url';
                if (this.isBase64(value)) {
                    type = 'img_base64';
                    let prefix = value.match(/^data:image\/[a-z]+;base64,/)[0];
                    value = value.substring(prefix.length);
                } else {
                    type = 'img_url'
                    value = this.wholePath(value);
                }
                this.$native.resSave({
                    params: {type, value},
                    cb: (res) => {
                        this.loading = false;
                        if(res.code === 0) {
                            this.$toast.success('已下载至手机相册')
                        } else {
                            this.$toast.success('下载失败')
                        }
                    }
                })
            }
        },
        mounted() {
            document.body.appendChild(this.$el);
        }
    };
</script>