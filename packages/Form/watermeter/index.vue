<template>
    <div class="mue-watermeter">
        <div class="mue-form-input has-suffix" :class="{'mue-form-input__is-disabled': disabled}">
            <input type="number" pattern="[0-9]*" class="input__inner" v-model="text" :disabled="disabled"
                   :placeholder="placeholder" unselectable="on"/>
            <i class="input__suffix input__suffix_icon fa fa-camera"
               @click.stop="callCamera"/>
        </div>
    </div>
</template>

<script>
    export default {
        name: "MueWatermeter",
        props: {
            value: {type: [Number, String], default: null},
            disabled: {type: Boolean, default: false},
            readonly: {type: Boolean, default: false},
            placeholder: {type: String, default: ""},
            mask: {type: Boolean, default: true} //是否显示扫描框
        },
        data() {
            return {
                text: ""
            }
        },
        watch: {
            value: {
                immediate: true, handler(v) {
                    if(!v) {
                        return
                    }
                    this.text = v;
                }
            },
            text(v) {
                this.$emit("input", String(v));
            }
        },
        methods: {
            callCamera() {
                this.$native.ocr_watermeter({
                    params: {
                        mask: this.mask,
                    },
                    cb: (res) => {
                        if(res.code === 0) {
                            this.text = res.response.word;
                            /*res.response.image => base64图片  res.response.word 识别结果*/
                            this.$emit('change', res.response)
                        }
                    }
                });
            }
        }
    };
</script>

<style lang="less">

</style>
