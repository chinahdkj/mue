<template>
    <div class="mue-tree-picker">
        <div class="mue-form-input has-suffix height-auto" @click="ShowPop"
             :class="{'mue-form-input__is-disabled': disabled}">
<!--            <textarea type="text" class="input__inner text-area" readonly :value="text" :disabled="disabled"-->
<!--                   :placeholder="placeholder" onfocus="this.blur()"/>-->
            <van-field
                class="input__inner text-area"
                :value="text"
                type="textarea"
                :placeholder="placeholder"
                :disabled="disabled"
                rows="1"
                input-align="right"
                readonly
                autosize
                onfocus="this.blur()"
            />
            <slot name="icon">
                <i class="input__suffix input__suffix_icon iconfont icon-zhanlei"></i>
            </slot>
        </div>
        <van-popup class="mue-tree-picker-pop" v-model="isVisible" position="right"
                   :lazy-render="false" get-container="body" :close-on-click-overlay="false"
                   @click-overlay="isVisible = false">
            <mue-tree ref="tree" :data="data" :cancel-button-text="cancelButtonText"
                      @cancel="onCancel" :searchable="searchable"
                      @confirm="onConfirm" :multiple="multiple" :selectable="selectable">
                <template #node="{node}">
                    <slot name="node" :node="node">{{node.name}}</slot>
                </template>
            </mue-tree>
        </van-popup>
    </div>
</template>

<script>
    import {localeMixin, t} from "../../../src/locale";
    export default {
        mixins: [localeMixin],
        name: "MueTreePicker",
        inject: {
            FORM_ITEM: {
                from: "FORM_ITEM",
                default(){
                    return {};
                }
            }
        },
        props: {
            data: {
                type: Array, default(){
                    return []
                }
            },
            value: {default: null},
            clearable: {type: Boolean, default: false},
            disabled: {type: Boolean, default: false},
            placeholder: {type: String, default: ""},
            multiple: {type: Boolean, default: false},
            selectable: {type: Function, default: null},
            searchable: {type: Boolean, default: false},
            wholePath: {type: Boolean, default: false}, //是否显示全路径
            limit: {type: [Number, String], default: 0} //最多选中个数，默认无限个，多选时有效
        },
        data(){
            return {
                isVisible: false, text: ""
            }
        },
        computed: {
            cancelButtonText(){
                return this.clearable ? t('mue.common.clear') : t('mue.common.cancel');
            }
        },
        watch: {
            value: {
                deep: true, immediate: true,
                handler(){
                    this.getText();
                }
            },
            data: {
                deep: true, immediate: true,
                handler(){
                    this.getText();
                }
            },
            isVisible(v){
                if(!v){
                    return;
                }
                if(this.multiple){
                    // 设置勾选
                    // this.$refs.tree.CheckAll(false);
                    Object.keys(this.$refs.tree.leaves).forEach((k) => {
                        this.$refs.tree.leaves[k] = (this.value || []).indexOf(k) > -1;
                    });
                    this.$refs.tree.SetCurrent(null);
                }
                else{
                    // 当前节点
                    this.$refs.tree.SetCurrent(this.value);
                }
            }
        },
        methods: {
            getText(){
                this.$nextTick(() => {
                    if(this.value == null || this.value === "" || !this.$refs.tree){
                        this.text = "";
                        return;
                    }

                    let getName = (code) => {
                        let node = this.GetOptionInfo(code);
                        if(node == null) {
                            return ""
                        } else {
                            return this.wholePath ? node.$nameRoad.join("-") : node.name;
                        }
                    };

                    if(!this.multiple){
                        this.text = getName(this.value);
                    }
                    else{
                        let t = [];
                        (this.value || []).forEach((c) => {
                            let n = getName(c);
                            if(n){
                                t.push(n);
                            }
                        });
                        this.text = t.join(",");
                    }

                });
            },
            onConfirm(){
                if(this.multiple){
                    let checks = this.$refs.tree.GetChecks();
                    let limit = Number(this.limit);
                    if(limit > 0 && checks.length > limit) {
                        this.$toast(`选中不能超过${this.limit}`);
                        return
                    }
                    let v = checks.length === 0 ? null : checks;

                    let roadObj = {}
                    if(v) {
                        for(let item of v) {
                            roadObj[item] = this.$refs.tree.dict[item].$road
                        }
                    }

                    this.$emit("input", v);
                    v !== this.value && this.$emit("change", v, this.value, roadObj);
                }
                else{
                    let current = this.$refs.tree.GetCurrent();
                    let v = current == null ? null : current;
                    let road = v ? this.$refs.tree.dict[v].$road : []
                    this.$emit("input", v);
                    v !== this.value && this.$emit("change", v, this.value, road);
                }
                this.isVisible = false;
            },

            onCancel(){
                this.isVisible = false;
                if(this.clearable){
                    this.$emit("input", null);
                    null !== this.value && this.$emit("change", null, this.value);
                }
            },

            ShowPop(){
                if(this.disabled || this.FORM_ITEM.readonly){
                    return;
                }
                this.isVisible = true;
            },
            GetOptionInfo(code){
                return this.$refs.tree.GetNode(code);
            },
            GetNodeCheckState(node){
                return this.$refs.tree.GetNodeCheckState(node);
            }
        }
    };
</script>
