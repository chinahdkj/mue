<template>
    <div class="mue-img-preview" v-show="isShow">
        <van-image-preview ref="preview" v-model="isShow" :images="images" :startPosition="startPosition"
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
            }
        },
        data() {
            return {
                current: -1
            }
        },
        methods: {
            onClose() {
                this.$emit('update:visible', false);
                this.$native.hideHeader({params: {hide: 0}});
            },
            onChange(index) {
                this.current = index;
            },
            async handleRotate(direction) {
                let loading = this.$loading();
                let base64 = await this.getBase64(this.images[this.current], direction);
                this.$set(this.images, this.current, base64);
                loading.close();
            },
            getBase64(url, direction) {
                return new Promise((resolve) => {
                    let image = new Image();
                    image.crossOrigin = '';
                    image.src = url;
                    if(url) {
                        image.onload = () => {
                            let canvas = document.createElement('canvas');
                            canvas.width = image.width;
                            canvas.height = image.height;
                            let ctx = canvas.getContext('2d');
                            ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
                            rotateImg(image, direction, canvas);
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