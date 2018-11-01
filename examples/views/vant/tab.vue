<template>
    <div>
        <mue-panel title="基础用法">
            <van-tabs v-model="a0">
                <van-tab title="标签1">内容1</van-tab>
                <van-tab title="标签2">内容2</van-tab>
                <van-tab title="标签3">内容3</van-tab>
                <van-tab title="标签4">内容4</van-tab>
                <van-tab title="标签5">内容5</van-tab>
                <van-tab title="标签6">内容6</van-tab>
            </van-tabs>
        </mue-panel>


        <mue-panel title="card风格">
            <van-tabs v-model="a1" type="card">
                <van-tab title="标签1">内容1</van-tab>
                <van-tab title="标签2">内容2</van-tab>
                <van-tab title="标签3">内容3</van-tab>
                <van-tab title="标签4">内容4</van-tab>
                <van-tab title="标签5">内容5</van-tab>
                <van-tab title="标签6">内容6</van-tab>
            </van-tabs>
        </mue-panel>

        <a href="https://youzan.github.io/vant/#/zh-CN/tab" target="_blank">配置方法</a>
    </div>
</template>

<script>
    export default {
        components: {},
        data(){
            return {a0: 0, a1: 0};
        },
        methods: {}
    }
</script>

<style>

</style>
