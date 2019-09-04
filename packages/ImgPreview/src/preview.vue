<template>
    <div class="mue-img-preview" v-show="isShow">
        <van-image-preview ref="preview" v-model="isShow" :images="imgs" :startPosition="startPosition"
                           :loop="loop" v-bind="$attrs" v-on="$listeners" @close="onClose"
                           @change="onChange">
        </van-image-preview>
        <div class="handle-btn">
            <van-icon name="replay" @click="handleRotate('right')"/>
            <van-icon name="replay" @click="handleRotate('left')" />
        </div>

    </div>
</template>

<script>
    import { rotateImg } from "../../../src/utils/image-utils";
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
            images:{
                immediate: true,
                handler(v){
                    this.imgs = [...v];
                }
            }
        },
        data() {
            return {
                current: -1,
                imgs: [],
                angles: []
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
                let loading = this.$loading();
                let angle = this.angles[this.current] || 0, img = this.images[this.current];
                if(direction === 'left') {
                    this.$set(this.angles, this.current, angle + 90);
                } else {
                    this.$set(this.angles, this.current, angle - 90);
                }
                let base64 = await this.getBase64(img, this.angles[this.current]);
                this.$set(this.imgs, this.current, base64);
                loading.close();
            },
            getBase64(url, angle) {
                return new Promise((resolve) => {
                    let image = new Image();
                    image.crossOrigin = '';
                    image.src = url;
                    if(url) {
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
            }
        },
        mounted(){
            document.body.appendChild(this.$el);
        }
    };
</script>