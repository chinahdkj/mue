<template>
    <div class="mue-input">
        <span class="mue-form-text" v-if="FORM_ITEM.readonly">{{value}}</span>

        <div class="mue-form-input" :class="{'has-suffix': icon}" v-else>
            <input v-if="readonly" :type="type" class="input__inner" readonly
                   :disabled="disabled" v-model="ipt" :placeholder="placeholder" unselectable="on"
                   onfocus="this.blur()"/>
            <input v-else :type="type" class="input__inner" :disabled="disabled"
                   v-model="ipt" :placeholder="placeholder"/>

            <i class="input__suffix" :class="icon" v-if="icon" @click="$emit('icon-click')"></i>
        </div>
    </div>
</template>

<script>
    export default {
        name: "MueInput",
        components: {},
        props: {
            value: {default: null},
            disabled: {type: Boolean, default: false},
            readonly: {type: Boolean, default: false},
            placeholder: {type: String, default: ""},
            icon: {type: String, default: ""},
            type: {type: String, default: "text"}
        },
        inject: {
            FORM_ITEM: {
                from: "FORM_ITEM",
                default(){
                    return {};
                }
            }
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