<template>
    <div class="mue-form-item"
         :class="{'is-required': !readonly && isRequired, 'is-readonly': readonly,
         'is-label-hidden': labelHidden, 'not-inline': !labelInline}">
        <label :class="{'is-error': isError}"
               :style="labelStyle">{{label}}</label>
        <div class="mue-form-item-content" :class="contentClass"
             :style="[labelInline ? {'padding-left': '0px'} : null, contentStyle]">
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
            //标签是否内联模式，与cue相反
            inline: {
                type: [Boolean, Object], default: null, validator(v){
                    return typeof v === "boolean" || v == null;
                }
            },
            labelHidden: {type: Boolean, default: false},
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
            labelInline(){
                return this.inline === null ? this.FORM.inline : this.inline;
            },
            labelStyle() {
                if (this.labelHidden) {
                    return {display: 'none'};
                }
                if (this.labelInline) {
                    return {'width': this.paddingLeft};
                } else {
                    return null
                }
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
            if(this.FORM){
                this.FORM.addItem(this);
            }
        },
        beforeDestroy(){
            if(this.FORM){
                this.FORM.removeItem(this);
            }
        }
    };
</script>