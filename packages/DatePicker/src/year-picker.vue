<template>
    <van-picker ref="picker" :columns="columns" show-toolbar @confirm="onConfirm"
                @cancel="onCancel" :cancel-button-text="cancelButtonText" :title="title"/>
</template>

<script>
    import {localeMixin, t} from "../../../src/locale";

    export default {
        mixins: [localeMixin],
        props: {
            title: {type: String, default: ""},
            value: {type: String},
            cancelButtonText: {type: String, default: () => {
                return t("mue.common.cancel");
            }},
            minDate: {default: null},
            maxDate: {default: null}
        },
        components: {},
        data(){
            return {};
        },
        computed: {
            columns(){
                let s = this.minDate ? this.minDate.getFullYear() : (new Date().getFullYear() - 10);
                let e = this.maxDate ? this.maxDate.getFullYear() : (new Date().getFullYear() + 10);
                let vs = [];
                for(let i = s; i <= e; i++){
                    vs.push(String(i));
                }
                return vs;
            }
        },
        watch: {
            value: {
                handler(v){
                    this.setVal(v);
                }
            }
        },
        methods: {
            onCancel(){
                this.$emit("cancel");
            },
            onConfirm(){
                this.$emit("confirm", this.$refs.picker.getColumnValue(0));
            },
            setVal(v){
                this.$refs.picker &&
                this.$refs.picker.setColumnValue(0, v || String(new Date().getFullYear()));
            }
        },
        mounted(){
            this.setVal(this.value);
        }
    };
</script>
