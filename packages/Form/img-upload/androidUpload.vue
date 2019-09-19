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
            // multiple: {type: Boolean, default: false},
            accept: {type: Number, default: 0}, //0:图片, 1:文件
            limit: {type: Number, default: 5},
            beforeRead: {type: Function, default: null},
            afterRead: {type: Function, default: null}
        },
        data() {
            return {
                values: []
            }
        },
        methods: {
            Upload() {
                this.values = [];
                this.$native.multi_file({
                    params: {
                        maxNum: this.limit,
                        mType: this.accept
                    },
                    cb: ({value}) => {
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