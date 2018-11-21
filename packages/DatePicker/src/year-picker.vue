<template>
    <van-picker ref="picker" :columns="columns" show-toolbar @confirm="onConfirm"
                @cancel="onCancel" :cancel-button-text="cancelButtonText" :title="title"/>
</template>

<script>
    export default {
        props: {
            title: {type: String, default: ""},
            value: {type: String},
            cancelButtonText: {type: String, default: "取消"},
        },
        components: {},
        data(){
            let n = new Date().getFullYear();
            let vs = [];
            for(let i = n - 10; i <= n + 10; i++){
                vs.push(String(i));
            }
            return {
                columns: vs
            };
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
    }
</script>