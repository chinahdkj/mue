<template>
    <div>
        <h3>VANT-UI</h3>
        <van-cell-group border>
            <van-cell value="BUTTON" @click="open('BUTTON', '/vant/button')"/>
        </van-cell-group>

        <h3>MUE</h3>
        <van-cell-group border>
            <van-cell value="CHART" @click="open('CHART', '/mue/chart')"/>
            <van-cell value="PANEL" @click="open('PANEL', '/mue/panel')"/>
        </van-cell-group>
    </div>
</template>

<script>
    export default {
        data(){
            return {};
        },
        methods: {
            open(n, p){
                this.$emit("open", n, p);
            }
        }
    }
</script>
