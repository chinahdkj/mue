<template>
    <div class="mue-form-item">
        <label>{{label}}</label>
        <div class="mue-form-item-content" :style="[{'padding-left': labelWidth}, contentStyle]">
            <slot></slot>
        </div>
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
            contentStyle: null,
            contentClass: null,
        },
        data(){
            return {};
        },
        computed: {
            labelWidth(){
                return `${this.GROUP.labelWidth || this.FORM.labelWidth || 90}px`;
            }
        },
        methods: {}
    }
</script>