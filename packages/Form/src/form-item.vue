<template>
    <div class="mue-form-item"
         :class="{'is-required': !readonly && isRequired, 'is-readonly': readonly,
         'not-inline': !inline}">
        <label :class="{'is-error': isError}"
               :style="inline ? {'max-width': paddingLeft} : null">{{label}}</label>
        <div class="mue-form-item-content" :class="contentClass"
             :style="[inline ? {'padding-left': paddingLeft} : null, contentStyle]">
            <slot></slot>
        </div>
        <!--<i v-if="isError" class="error-icon fa fa-exclamation-circle" aria-hidden="true"></i>-->
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
        provide(){
            return {
                FORM_ITEM: this
            };
        },
        props: {
            label: {type: String, default: ""},
            field: {type: String, default: ""},
            labelWidth: {type: Number, default: 0},
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
                let w = this.labelWidth || this.GROUP.labelWidth || this.FORM.labelWidth || 110;
                return `${w}px`;
            },
            inline(){
                return this.FORM.inline;
            },
            isRequired(){
                return this.required || this.rules.filter((r) => {
                    return !!r.required;
                }).length > 0;
            },
            readonly(){
                return this.FORM.readonly;
            }
        },
        methods: {},
        mounted(){
            debugger
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