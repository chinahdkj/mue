<template>
    <form class="mue-form">
        <slot></slot>

        <div class="mue-form-buttons">
            <van-button size="large" plain >取消</van-button>
            <van-button size="large" type="primary">提交</van-button>
        </div>
    </form>
</template>

<script>
    export default {
        name: "MueForm",
        components: {},
        props: {
            labelWidth: {type: Number, default: 90}
        },
        provide(){
            return {
                FORM: this
            };
        },
        data(){
            return {};
        },
        methods: {}
    }
</script>