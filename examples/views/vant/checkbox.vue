<template>
    <div>
        <mue-panel title="默认">
            <van-checkbox v-model="checked">复选框</van-checkbox>
        </mue-panel>

        <mue-panel title="禁用">
            <van-checkbox v-model="checked" disabled>复选框</van-checkbox>
        </mue-panel>

        <mue-panel title="组">
            <van-checkbox-group v-model="vs">
                <van-checkbox v-for="i in 3" :key="i" :name="i">复选框{{i + 1}}</van-checkbox>
            </van-checkbox-group>
        </mue-panel>
        <a href="https://youzan.github.io/vant/#/zh-CN/checkbox" target="_blank">配置方法</a>
    </div>

</template>

<script>
    export default {
        components: {},
        data(){
            return {checked: true, vs: []};
        },
        methods: {}
    }
</script>

<style lang="less" scoped>
    .van-checkbox {
        margin-bottom: 5px;
        margin-left: 10px;
    }
</style>
