<template>
    <div class="mue-img-preview" v-show="isShow">
        <van-image-preview ref="preview" v-model="isShow" :images="images" :startPosition="startPosition" :loop="loop" v-bind="$attrs"
                           v-on="$listeners" @close="onClose"
                           @change="onChange">
        </van-image-preview>
        <div class="handle-btn">
            <van-icon name="replay" @click="rotateLeft"/>
            <van-icon name="replay" @click="rotateRight" />
        </div>

    </div>
</template>

<script>
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
                current: -1,
                angles: [],
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
            rotateRight() {
                let dom = this.$refs.preview.$el.getElementsByClassName('van-image-preview__image')[this.current];
                this.$set(this.angles, this.current, (this.angles[this.current] || 0) + 90)
                dom.style.transform = `rotate(${this.angles[this.current]}deg)`
            },
            rotateLeft() {
                let dom = this.$refs.preview.$el.getElementsByClassName('van-image-preview__image')[this.current];
                this.$set(this.angles, this.current, (this.angles[this.current] || 0) - 90)
                dom.style.transform = `rotate(${this.angles[this.current]}deg)`
            }
        },
        mounted(){
            document.body.appendChild(this.$el);
        }
    };
</script>