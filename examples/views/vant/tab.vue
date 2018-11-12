<template>
    <div>
        <mue-panel title="基础用法">
            <van-tabs v-model="a0">
                <van-tab v-for="i in c" :title="'标签' + i" :key="i">内容{{i}}</van-tab>
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

        <mue-panel title='添加class="no-flex"'>
            <van-tabs v-model="a2" class="no-flex">
                <van-tab title="标签1">
                    与基础用法差别：<br/>
                    1、滚动阈值swipe-threshold，设置将不起作用, 标签不再等分宽度<br/>
                    2、底部条宽度line-width，设置将不起作用, 固定2px
                </van-tab>
                <van-tab title="标签2"></van-tab>
                <van-tab title="标签3标签3"></van-tab>
                <van-tab title="标签4标签4标签4"></van-tab>
                <van-tab title="标签5"></van-tab>
                <van-tab title="标签6"></van-tab>
            </van-tabs>
        </mue-panel>

        <a href="https://youzan.github.io/vant/#/zh-CN/tab" target="_blank">配置方法</a>
    </div>
</template>

<script>
    export default {
        components: {},
        data(){
            return {c: 5, a0: 0, a1: 0, a2: 0};
        },
        methods: {}
    }
</script>

<style>

</style>
