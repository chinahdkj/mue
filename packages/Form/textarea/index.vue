<template>
    <div class="mue-textarea">
        <textarea class="textarea__inner" v-model="ipt" :readonly="readonly" :disabled="disabled"
                  :placeholder="placeholder" :rows="rows"/>
    </div>
</template>

<script>
    export default {
        name: "MueTextarea",
        components: {},
        props: {
            value: {default: null},
            disabled: {type: Boolean, default: false},
            readonly: {type: Boolean, default: false},
            placeholder: {type: String, default: ""},
            rows: {type: Number, default: "2"}
        },
        data(){
            return {
                ipt: ""
            };
        },
        watch: {
            value: {
                immediate: true,
                handler(v){
                    this.ipt = v;
                }
            },
            ipt(v, ov){
                this.$emit("input", v);
                this.$emit("change", v, ov);
            }
        },
        methods: {},
        mounted(){

        }
    }
</script>