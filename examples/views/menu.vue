<template>
    <div>
        <h3>ICON</h3>
        <van-cell-group border>
            <van-cell value="HEDA" @click="open('/static/font/demo_fontclass.html', true)"/>
            <van-cell value="AWESOME" @click="open('http://www.fontawesome.com.cn/faicons/',
            true)"/>
        </van-cell-group>

        <h3>VANT-UI</h3>
        <van-cell-group border>
            <van-cell value="BUTTON" @click="open('/vant/button')"/>
            <van-cell value="CHECKBOX" @click="open('/vant/checkbox')"/>
            <van-cell value="RADIO" @click="open('/vant/radio')"/>
            <van-cell value="TAB" @click="open('/vant/tab')"/>
        </van-cell-group>

        <h3>MUE</h3>
        <van-cell-group border>
            <van-cell value="CONTAINER" @click="open('/mue/container')"/>
            <van-cell value="PANEL" @click="open('/mue/panel')"/>
            <van-cell value="CHART" @click="open('/mue/chart')"/>
            <van-cell value="ROLL-DATA" @click="open('/mue/rolldata')"/>
            <van-cell value="DATE-PICKER" @click="open('/mue/datepicker')"/>
            <van-cell value="DATE-RANGE-PICKER" @click="open('/mue/daterangepicker')"/>
            <van-cell value="SEARCH" @click="open('/mue/search')"/>
            <van-cell value="POPOVER" @click="open('/mue/popover')"/>
            <van-cell value="TABS" @click="open('/mue/tabs')"/>
            <van-cell value="LOADING" @click="open('/mue/loading')"/>
            <van-cell value="DATATABLE" @click="open('/mue/datatable')"/>
        </van-cell-group>
    </div>
</template>

<script>
    export default {
        data(){
            return {};
        },
        methods: {
            open(p, _blank){
                this.$emit("open", p, _blank);
            }
        }
    }
</script>
