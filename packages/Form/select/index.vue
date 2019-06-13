<template>
    <div class="mue-select">
        <div class="mue-form-input has-suffix" @click="ShowPop">
            <input type="text" class="input__inner" readonly :value="text" :disabled="disabled"
                   :placeholder="placeholder" unselectable="on" onfocus="this.blur()"/>
            <i class="input__suffix input__suffix_icon iconfont icon-arrows-copy-copy"></i>
        </div>
        <van-popup ref="pop" class="mue-select-pop" v-model="pop" position="bottom"
                   get-container="body" :close-on-click-overlay="false"
                   @click-overlay="pop = false">
            <van-picker ref="picker" :columns="columns" show-toolbar @confirm="onConfirm"
                        @cancel="onCancel" :cancel-button-text="cancelButtonText"
                        value-key="name" @change="onChange"/>
        </van-popup>
    </div>
</template>

<script>
    export default {
        name: "MueSelect",
        components: {},
        inject: {
            FORM_ITEM: {
                from: "FORM_ITEM",
                default(){
                    return {};
                }
            }
        },
        props: {
            value: {default: null},
            clearable: {default: false, type: Boolean},
            data: {
                type: Array, default(){
                    return [];
                }
            },
            disabled: {type: Boolean, default: false},
            placeholder: {type: String, default: ""},
            pickLv: {
                type: String, default: "last", validator(v){
                    return ["last", "any"].indexOf(v) > -1;
                }
            },
            textLv: {
                type: String, default: "last", validator(v){
                    return ["last", "all"].indexOf(v) > -1;
                }
            }
        },
        data(){
            return {
                pop: false,
                depth: 0,
                dict: {},
                columns: []
            };
        },
        computed: {
            cancelButtonText(){
                return this.clearable ? "清空" : "取消";
            },
            text(){
                let temp = this.dict[this.value] || {};
                if(this.textLv === "last"){
                    return temp.code == null ? "" : temp.name;
                }
                let text = [];
                while(temp.code != null){
                    text.splice(0,0, temp.name);
                    temp = this.dict[temp.$parent] || {};
                }
                return text.join(",");
            }
        },
        watch: {
            pop(v){
                if(!v){
                    return;
                }
                let opt = this.dict[this.value] || {};
                this.initCols(opt.disabled ? null : opt.$road);
            },
            data: {
                deep: true, immediate: true,
                handler(v){
                    let dict = {}, depth = 0;

                    let feach = (opts, road, disabled) => {
                        let lv = road.length;
                        if(lv > depth){
                            depth = lv;
                        }
                        opts.forEach((opt, i) => {
                            let clone = {
                                ...opt, $lv: lv, $index: i, $road: [...road, opt.code],
                                $parent: road.length === 0 ? null : road[road.length - 1],
                                disabled: disabled || opt.disabled
                            };
                            delete clone.children;
                            dict[opt.code] = clone;

                            feach(opt.children || [], clone.$road, clone.disabled);
                        });

                    };

                    feach(v, [], false);
                    this.depth = depth;
                    this.dict = dict;
                }
            }
        },
        methods: {
            initCols(road){
                road = road || [];
                let cols = [];
                for(let i = 0; i < this.depth; i++){
                    let parent = null;
                    if(i !== 0){
                        let {values, defaultIndex} = cols[i - 1];
                        parent = (values[defaultIndex] || {}).code;

                    }
                    let values = Object.values(this.dict).filter((o) => {
                        return o.$parent === parent && o.$lv === i;
                    });

                    if(i > 0 && this.pickLv === "any"){
                        values.splice(0, 0, {name: "", code: undefined});
                    }

                    let index = values.findIndex((o) => {
                        return o.code === road[i];
                    });

                    cols.push({values, defaultIndex: Math.max(0, index)});

                    this.columns = cols;

                }
                this.columns = cols;
            },
            onConfirm(){
                this.pop = false;
                let values = this.$refs.picker.getValues();
                let last = null;
                for(let i = 0; i < values.length; i++){
                    if(values[i] == null || values[i].code === undefined){
                        break;
                    }
                    last = values[i];
                }
                // this.text = (last || {}).name;
                this.$emit("input", last.code);
                this.$emit("change", last.code, last);
            },
            onCancel(){
                this.pop = false;
                if(this.clearable){
                    // this.text = "";
                    this.$emit("input", null);
                    this.$emit("change", null, null);
                }
            },
            onChange(picker){
                let road = picker.getValues();
                this.initCols(road.map((r) => {
                    return (r || {}).code;
                }));
            },

            ShowPop(){
                if(this.disabled || this.FORM_ITEM.readonly){
                    return;
                }
                this.pop = true;
            },
            GetOptionInfo(code){
                return this.dict[code];
            }
        }
    }
</script>