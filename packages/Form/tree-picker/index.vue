<template>
    <div class="mue-tree-picker">
        <div class="mue-form-input has-suffix" @click="showTreePicker">
            <input type="text" class="input__inner" readonly :value="text" :disabled="disabled"
                   :placeholder="placeholder" onfocus="this.blur()"/>
            <i class="input__suffix input__suffix_icon iconfont icon-arrows-copy-copy"></i>
        </div>
        <van-popup class="mue-tree-picker-popup" v-model="isVisible" position="right" :overlay="true"
                   @opened="openedHandler" :lazy-render="false"><!--get-container="body"-->
            <tree-picker-pop ref="treePicker" v-model="value" :data="data" @confirm="confirmHandler" @select="selectHandler"
                             @cancel="cancelHandler" :close="hideTreePicker" :multiple="multiple"></tree-picker-pop>
        </van-popup>
    </div>
</template>

<script>
    import TreePickerPop from './tree-picker-pop.vue';

    export default {
        name: 'MueTreePicker',
        components: {TreePickerPop},
        inject: {
            FORM_ITEM: {
                from: "FORM_ITEM",
                default() {
                    return {};
                }
            }
        },
        props: {
            data: {type: Array, default() {return []}},
            value: {default: null},
            clearable: {type: Boolean, default: false},
            disabled: {type: Boolean, default: false},
            placeholder: {type: String, default: ""},
            multiple: {type: Boolean, default: false}
        },
        data() {
            return {
                text: '',
                isVisible: false,
                data: [
                    /*{
                        code: "c1", name: "选项1", children: [
                            {
                                code: "d1", name: "1-1", children: [
                                    {code: "e1", name: "1-1-1"},
                                    {code: "e2", name: "1-1-2"},
                                    {code: "e3", name: "1-1-3"},
                                    {code: "e4", name: "1-1-4"},
                                    {code: "e5", name: "1-1-5"},
                                ]
                            },
                            {code: "d2", name: "1-2"},
                            {code: "d3", name: "1-3"},
                            {code: "d4", name: "1-4", disabled: true},
                            {code: "d5", name: "1-5"},
                        ]
                    },
                    {code: "c2", name: "选项2"},
                    {
                        code: "c3", name: "选项3", disabled: true,
                        children: [
                            {code: "cd1", name: "3-1"},
                            {code: "cd2", name: "3-2"},
                            {code: "cd3", name: "3-3"},
                            {code: "cd4", name: "3-4"},
                            {code: "cd5", name: "3-5"},
                        ]
                    },
                    {code: "c4", name: "选项4"},
                    {code: "c5", name: "选项5"}*/
                ],
            }
        },
        methods: {
            showTreePicker() {
                if (this.disabled || this.FORM_ITEM.readonly) {
                    return;
                }
                this.isVisible = true;
            },
            hideTreePicker() {
                this.isVisible = false;
            },
            confirmHandler(opt) {
                console.log('提交后触发');
                if (opt instanceof Array && opt.length) {
                    this.text = opt.length > 1 ? `${opt[0].name}...` : opt[0].name;
                    let codes = opt.map((v) => {
                        return v.code;
                    });
                    this.$emit("confirm", {
                        checkedKeys: codes,
                        checkedOpts: opt
                    });
                } else {
                    if(opt) {
                        this.text = opt.name;
                        this.$emit("confirm", {
                            checkedKeys: opt.code,
                            checkedOpts: opt
                        });
                    }
                }
            },
            selectHandler(opt) {
                console.log(opt);
                this.$emit("select", opt);
            },
            openedHandler() {
                this.$emit("opened");
                console.log('打开后触发');
            },
            cancelHandler() {
                this.$emit("cancel");
                console.log('取消后触发');
            },
        },
        mounted() {
            if (this.value) {
                if (!this.multiple) {
                    this.text = this.$refs.treePicker.dict[this.value].name;
                } else {
                    this.text = `${this.$refs.treePicker.dict[this.value[0]].name}...`;
                }

            }
        }
    };
</script>
