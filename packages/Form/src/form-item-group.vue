<template>
    <div class="mue-form-item-group">
        <div class="mue-form-item-group-title">
            <span>
                <slot name="prefix">
                    <i v-if="prefix" class="__icon" :class="prefix" aria-hidden="true"></i>
                </slot>
                {{title}}
            </span>
            <span>
                {{subTitle}}

                <template v-if="$listeners['icon-click']">
                    <i class="__icon" :class="icon" aria-hidden="true"
                       @click="$emit('icon-click')"></i>
                </template>

                <template v-if="$slots.help">
                    <mue-popover placement="bottom" popper-class="mue-form-help">
                        <i class="__icon" slot="reference" :class="icon" aria-hidden="true"></i>
                        <slot name="help"></slot>
                    </mue-popover>
                </template>
            </span>
        </div>
        <slot></slot>
    </div>
</template>

<script>
    export default {
        name: "MueFormItemGroup",
        components: {},
        props: {
            title: {type: String, default: ""},
            subTitle: {type: String, default: ""},
            prefix: {type: String, default: ""},
            icon: {type: String, default: "iconfont icon-icon_wenhao"},
            labelWidth: {type: Number, default: 0}
        },
        provide(){
            return {
                GROUP: this
            };
        },
        data(){
            return {};
        },
        methods: {}
    }
</script>