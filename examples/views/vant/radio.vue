<template>
    <div>
        <mue-panel title="默认">
            <van-radio-group v-model="radio">
                <van-radio name="1">单选框 1</van-radio>
                <van-radio name="2">单选框 2</van-radio>
            </van-radio-group>
        </mue-panel>

        <mue-panel title="禁用">
            <van-radio-group v-model="radio" disabled>
                <van-radio name="1">单选框 1</van-radio>
                <van-radio name="2">单选框 2</van-radio>
            </van-radio-group>
        </mue-panel>
        <a href="https://youzan.github.io/vant/#/zh-CN/radio" target="_blank">配置方法</a>
    </div>

</template>

<script>
    export default {
        components: {},
        data(){
            return {radio: "1"};
        },
        methods: {}
    }
</script>

<style lang="less" scoped>
    .van-radio{
        margin-bottom: 5px;
        margin-left: 10px;
    }
</style>
