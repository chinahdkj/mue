<template>
    <div>
        <h3>VANT-UI</h3>
        <van-cell-group border>
            <van-cell value="BUTTON" @click="open('BUTTON', '/vant/button')"/>
            <van-cell value="CHECKBOX" @click="open('CHECKBOX', '/vant/checkbox')"/>
            <van-cell value="RADIO" @click="open('RADIO', '/vant/radio')"/>
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
            <van-cell value="SEARCH" @click="open('SEARCH', '/mue/search')"/>
            <van-cell value="POPOVER" @click="open('POPOVER', '/mue/popover')"/>
            <van-cell value="TABS" @click="open('TABS', '/mue/tabs')"/>
            <van-cell value="LOADING" @click="open('LOADING', '/mue/loading')"/>
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
