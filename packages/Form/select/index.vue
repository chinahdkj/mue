<template>
    <div class="mue-select">
        <div class="mue-form-input" @click="showPop">
            <input type="text" class="input__inner" readonly :value="text"/>
            <i class="input__suffix iconfont icon-arrows-copy-copy"></i>
        </div>
        <van-popup ref="pop" class="mue-select-pop" v-model="pop" position="bottom"
                   :lazy-render="false">
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
        props: {
            group: {default: false, type: Boolean},
            value: {default: null},
            clearable: {default: false, type: Boolean},
            data: {type: Array, default: []},
            disabled: {type: Boolean, default: false},
        },
        data(){
            return {
                pop: false,
                col0: [],
                col1: [],
                idx0: 0,
                idx1: 0
            };
        },
        computed: {
            cancelButtonText(){
                return this.clearable ? "清空" : "取消";
            },
            dict(){
                let col0 = [], col1 = [], dict = {};
                let data = this.data || [];
                for(let i = 0; i < data.length; i++){
                    let d = data[i];
                    if(this.group){
                        col0.push({
                            name: d.name, disabled: d.disabled
                        });
                        let opts = (d.values || []).map((o, j) => {
                            dict[o.code] = {index: [i, j], text: o.name, data: o};
                            return {
                                code: o.code, name: o.name, data: o, disabled: o.disabled
                            };
                        });
                        col1.push(opts);
                    }
                    else{
                        dict[d.code] = {index: [i], text: d.name, data: d};
                        col0.push({
                            code: d.code, name: d.name, data: d, disabled: d.disabled
                        });
                    }
                }
                this.col0 = col0;
                this.col1 = col1;
                return dict;
            },
            columns(){
                if(!this.group){
                    return this.col0;
                }
                return [
                    {values: this.col0, defaultIndex: this.idx0},
                    {values: this.col1[this.idx0 || 0] || [], defaultIndex: this.idx1}
                ];
            },
            text(){
                return (this.dict[this.value] || {}).text || "";
            }
        },
        watch: {
            pop(v){
                if(!v){
                    return;
                }
                let idx = (this.dict[this.value] || {}).index || [];
                this.idx0 = idx[0] || 0;
                this.idx1 = idx[1] || 0;
            },
            idx0(v){
                this.$nextTick(() => {
                    this.$refs.picker.setIndexes([v, this.idx1]);
                });
            }
        },
        methods: {
            showPop(){
                if(this.disabled){
                    return;
                }
                this.pop = true;
            },
            onConfirm(){
                this.pop = false;
                let ixs = this.$refs.picker.getIndexes();
                let temp = this.group ? (this.col1[ixs[0]] || [])[ixs[1]] : this.col0[ixs[0]];

                let v = (temp || {}).code;
                let opt = (temp || {}).data;
                this.$emit("input", v);
                this.$emit("change", v, opt);
            },
            onCancel(){
                this.pop = false;
                if(this.clearable){
                    this.text = "";
                    this.$emit("input", null);
                    this.$emit("change", null, null);
                }
            },
            onChange(picker){
                if(!this.group){
                    return;
                }
                let pidx = picker.getIndexes();
                if(this.idx0 === pidx[0]){
                    this.idx1 = pidx[1];
                }
                else{
                    this.idx0 = pidx[0];
                    let idx = (this.dict[this.value] || {}).index || [];
                    this.idx1 = idx[0] === pidx[0] ? idx[1] : 0;
                }
            }
        },
        mounted(){
            $(this.$refs.pop.$el).appendTo("body");
        }
    }
</script>