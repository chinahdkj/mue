<template>
    <div>
        <h3>VANT-UI</h3>
        <van-cell-group border>
            <van-cell value="BUTTON" @click="open('BUTTON', '/vant/button')"/>
            <van-cell value="TAB" @click="open('TAB', '/vant/tab')"/>
        </van-cell-group>

        <h3>MUE</h3>
        <van-cell-group border>
            <van-cell value="CHART" @click="open('CHART', '/mue/chart')"/>
            <van-cell value="PANEL" @click="open('PANEL', '/mue/panel')"/>
            <van-cell value="ROLL-DATA" @click="open('ROLL-DATA', '/mue/rolldata')"/>
            <van-cell value="DATE-PICKER" @click="open('DATE-PICKER',
            '/mue/datepicker')"/>
            <van-cell value="DATE-RANGE-PICKER" @click="open('DATE-RANGE-PICKER',
            '/mue/daterangepicker')"/>
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
