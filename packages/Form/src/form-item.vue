<template>
    <div class="mue-form-item" :class="{'is-required': isRequired}">
        <label>{{label}}</label>
        <div class="mue-form-item-content" :class="contentClass"
             :style="[{'padding-left': paddingLeft}, contentStyle]">
            <slot></slot>
        </div>
        <i v-if="isError" class="error-icon fa fa-exclamation-circle" aria-hidden="true"></i>
    </div>
</template>

<script>
    export default {
        name: "MueFormItem",
        components: {},
        inject: {
            FORM: {
                from: "FORM"
            },
            GROUP: {
                from: "GROUP",
                default(){
                    return {};
                }
            }
        },
        props: {
            label: {type: String, default: ""},
            field: {type: String, default: ""},
            labelWidth: {type: Number, default: 90},
            contentStyle: null,
            contentClass: null,

            required: {type: Boolean, default: false},
            rules: {
                type: Array, default(){
                    return [];
                }
            }
        },
        data(){
            return {
                isError: false
            };
        },
        computed: {
            paddingLeft(){
                let w = this.GROUP.labelWidth || this.FORM.labelWidth || this.labelWidth || 90;
                return `${w}px`;
            },
            isRequired(){
                return this.required || this.rules.filter((r)=>{
                    return !!r.required;
                }).length > 0;
            }
        },
        methods: {},
        mounted(){
            if(this.FORM){
                this.FORM.addItem(this);
            }
        },
        beforeDestroy(){
            if(this.FORM){
                this.FORM.removeItem(this);
            }
        }
    }
</script>