<template>
    <div class="android-upload">
        <button class="upload-btn" type="button" :disabled="disabled" @click="Upload">
            <slot></slot>
        </button>
    </div>
</template>

<script>
    import {Base64ToFile} from "../../../src/utils/image-utils";

    export default {
        props: {
            disabled: {type: Boolean, default: false},
            multiple: {type: Boolean, default: false},
            mType: {type: Number, default: 0}, //0:图片, 1:文件 3:拍照
            limit: {type: Number, default: 5},
            beforeRead: {type: Function, default: null},
            afterRead: {type: Function, default: null}
        },
        data() {
            return {
                values: []
            }
        },
        computed: {
            limitNum() {
                return this.multiple ? this.limit : 1
            }
        },
        methods: {
            Upload() {
                this.values = [];
                this.$native.multi_file({
                    params: {
                        maxNum: this.limitNum,
                        mType: this.mType,
                        cameraDevice: 0,
                    },
                    cb: (result) => {
                        let { value } = result
                        if(this.mType === 3){
                            let content = `data:${result.file.type};base64,`
                            value = {
                                content: result.value.startsWith(content) ? result.value : `data:${result.file.type};base64,` + result.value,
                                file: result.file
                            }
                            if(result.value){
                                this.values.push(value);
                            }
                            if (!this.values.length) {
                                return;
                            }
                            if (typeof this.beforeRead === 'function') {
                                let res = this.beforeRead(this.values);
                                if (res === false) {

                                } else if (res instanceof Promise) {
                                    res.then((vals) => {
                                        this.onAfterRead(vals);
                                    })
                                } else {
                                    this.onAfterRead(res);
                                }
                            } else {
                                this.onAfterRead(this.values);
                            }
                        }else{
                            if(value !== null) {
                                this.values.push(value);
                                return true;
                            } else {
                                if (!this.values.length) {
                                    return;
                                }
                                if (typeof this.beforeRead === 'function') {
                                    let res = this.beforeRead(this.values);
                                    if (res === false) {

                                    } else if (res instanceof Promise) {
                                        res.then((vals) => {
                                            this.onAfterRead(vals);
                                        })
                                    } else {
                                        this.onAfterRead(res);
                                    }
                                } else {
                                    this.onAfterRead(this.values);
                                }
                            }
                        }
                    }
                });
            },
            onAfterRead(values) {
                if (typeof this.afterRead === 'function') {
                    let files = values.map(m => {
                        let type = m.file.type, name = m.file.name;
                        let blob = Base64ToFile(m.content, {type, name});
                        return {content: m.content, file: blob}
                    });
                    this.afterRead(files);
                }
            }
        }
    };
</script>

<style lang="less">

</style>
