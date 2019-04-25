<template>
    <div class="mue-tree-picker">
        <div class="mue-form-input has-suffix" @click="ShowPop">
            <input type="text" class="input__inner" readonly :value="text" :disabled="disabled"
                   :placeholder="placeholder" onfocus="this.blur()"/>
            <i class="input__suffix input__suffix_icon iconfont icon-zhanlei"></i>
        </div>
        <van-popup class="mue-tree-picker-pop" v-model="isVisible" position="right"
                   :lazy-render="false" get-container="body" :close-on-click-overlay="false"
                   @click-overlay="isVisible = false">
            <mue-tree ref="tree" :data="data" :cancel-button-text="cancelButtonText" @cancel="onCancel"
                      @confirm="onConfirm" :multiple="multiple"/>
        </van-popup>
    </div>
</template>

<script>
    export default {
        name: "MueTreePicker",
        inject: {
            FORM_ITEM: {
                from: "FORM_ITEM",
                default() {
                    return {};
                }
            }
        },
        props: {
            data: {
                type: Array, default() {
                    return []
                }
            },
            value: {default: null},
            clearable: {type: Boolean, default: false},
            disabled: {type: Boolean, default: false},
            placeholder: {type: String, default: ""},
            multiple: {type: Boolean, default: false}
        },
        data() {
            return {
                isVisible: false, text: ""
            }
        },
        computed: {
            cancelButtonText() {
                return this.clearable ? "清空" : "取消";
            }
        },
        watch: {
            value: {
                deep: true, immediate: true,
                handler(v) {
                    this.$nextTick(() => {
                        if (v == null || !this.$refs.tree) {
                            this.text = "";
                            return;
                        }

                        let getName = (code) => {
                            let node = this.GetOptionInfo(code);
                            return node == null ? "" : node.name;
                        };

                        if (!this.multiple) {
                            this.text = getName(v);
                        } else {
                            let t = [];
                            v.forEach((c) => {
                                let n = getName(c);
                                if (n) {
                                    t.push(n);
                                }
                            });
                            this.text = t.join(",");
                        }

                    });
                }
            },
            isVisible(v) {
                if (!v) {
                    return;
                }
                if (this.multiple) {
                    // 设置勾选
                    // this.$refs.tree.CheckAll(false);
                    Object.keys(this.$refs.tree.leaves).forEach((k) => {
                        this.$refs.tree.leaves[k] = (this.value || []).indexOf(k) > -1;
                    });
                    this.$refs.tree.SetCurrent(null);
                } else {
                    // 当前节点
                    this.$refs.tree.SetCurrent(this.value);
                }
            }
        },
        methods: {
            onConfirm() {
                this.isVisible = false;
                if (this.multiple) {
                    let checks = this.$refs.tree.GetChecks();
                    this.$emit("input", checks.length === 0 ? null : checks);
                } else {
                    let current = this.$refs.tree.GetCurrent();
                    this.$emit("input", current == null ? null : current);
                }
            },

            onCancel() {
                this.isVisible = false;
                if (this.clearable) {
                    this.$emit("input", null);
                }
            },

            ShowPop() {
                if (this.disabled || this.FORM_ITEM.readonly) {
                    return;
                }
                this.isVisible = true;
            },
            GetOptionInfo(code) {
                return this.$refs.tree.GetNode(code);
            }
        }
    };
</script>
