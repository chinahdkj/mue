<template>
    <div class="mue-img-preview" v-show="isShow" v-loading.fullscreen="loading">
        <van-image-preview v-if="!isComment" ref="preview" v-model="isShow" :images="imgs" :startPosition="startPosition"
                           :loop="loop" v-bind="$attrs" v-on="$listeners" @close="onClose"
                           @change="onChange">
        </van-image-preview>
        <m-image-preview  ref="preview" v-if="isComment" v-model="isShow" :images="imgs"  :startPosition="startPosition"
            :loop="loop" v-bind="$attrs" v-on="$listeners" @close="onClose" @change="onChange" @save="save"></m-image-preview>
        <div class="handle-btn" v-if="!isComment">
            <van-icon class="handle-icon" name="replay" @click="handleRotate('right')"/>
            <van-icon class="handle-icon" name="replay" @click="handleRotate('left')"/>
            <i v-if="!isDingdingEnv" class="fa fa-download handle-icon" @click="download"/>
            <slot name="handle"></slot>
        </div>
        <div class="handle-btn" v-if="isComment" :class="{comment:isComment}">
            <i class="fa fa-chevron-left handle-icon" @click="handleAction('prev')"/>
            <i class="fa fa-download handle-icon" @click="download"/>
            <i class="fa fa-refresh handle-icon" @click="handleAction('save')"/>
            <i class="fa fa-undo handle-icon" @click="handleRotate('right')"/>
            <i class="fa fa-repeat handle-icon" @click="handleRotate('left')"/>
            <i class="fa fa-pencil handle-icon" @click="handleAction('pen')"/>
            <i class="fa fa-font handle-icon" @click="handleAction('text')"/>
            <i class="fa fa-times handle-icon" @click="isShow = false"/>
            <i class="fa fa-chevron-right handle-icon" @click="handleAction('next')"/>
        </div>
    </div>
</template>

<script>
    import {rotateImg} from "../../../src/utils/image-utils";
    import {localeMixin, t} from "../../../src/locale";
    import MImagePreview from './MImagePreview'
    export default {
        name: 'MueImgPreview',
        mixins: [localeMixin],
        inheritAttrs: false,
        components: {MImagePreview},
        props: {
            isComment: {type: Boolean, default: false},
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
                isDingdingEnv: sessionStorage.getItem('isDingdingEnv'),
                current: -1,
                imgs: [],
                angles: [],
                loading: false
            }
        },
        methods: {
            handleAction(action) {
                if(action === 'save') {
                    this.isShow = false
                }
                
                this.$refs.preview.handleActions(action)
            },
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
                return str.indexOf('data:image') > -1;
            },
            wholePath(path){
                if(!path){
                    return "";
                }
            return this.$comm.getUploadPath(path);
            },
            save(data) {
                this.$emit('upload', data)
            },
            download() {
                this.loading = true;
                let value = this.images[this.current];
                if(this.isComment) {
                    value = this.$refs.preview.getBase64()
                }
                let type = '';
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
                            this.$toast.success(t("mue.imgPreview.downloadSuccess"))
                        } else {
                            this.$toast.success(t("mue.imgPreview.downloadError"))
                        }
                    }
                })
            }
        },
        mounted() {
            document.body.appendChild(this.$el);
        },
        beforeDestroy() {
            document.body.removeChild(this.$el);
        }
    };
</script>
