<template>
    <div class="ccwork-upload">
        <button class="upload-btn" type="button" :disabled="disabled" @click="Upload">
            <slot></slot>
        </button>
    </div>
</template>

<script>
    // import ccworkBridge from 'ccwork-jsbridge';

    export default {
        props: {
            disabled: {type: Boolean, default: false},
            multiple: {type: Boolean, default: false},
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
        computed: {
            limitNum() {
                return this.multiple ? this.limit : 1
            }
        },
        methods: {
            Upload() {
                this.values = [];
                ccworkBridge.ccworkFileManager({
                    ccworkFileManagerIsSingleSelect: !this.multiple
                }, ({status, errormessage, result}) => {
                    if(status != 1) {
                        this.$toast("无法选择文件");
                        return
                    }
                    if(!(result.pathList || []).length) return
                    this.values = result.pathList;
                    if (typeof this.beforeRead === 'function') {
                        let res = this.beforeRead(this.values);
                        if (res === false) {

                        } else if (res instanceof Promise) {
                            res.then((vals) => {
                                this.afterRead(vals);
                            })
                        } else {
                            this.afterRead(this.values);
                        }
                    } else {
                        this.afterRead(this.values);
                    }
                })
            }
        }
    };
</script>

<style lang="less">

</style>
