<template>
    <div class="mue-chart"></div>
</template>

<script>
    import ECharts from "echarts";
    import {addResizeListener, removeResizeListener} from "../../../src/utils/resize-event";
    import {registerTheme} from './echart-themes';

    registerTheme(ECharts);

    const ACTION_EVENTS = [
        "legendselectchanged",
        "legendselected",
        "legendunselected",
        "datazoom",
        "datarangeselected",
        "timelinechanged",
        "timelineplaychanged",
        "restore",
        "dataviewchanged",
        "magictypechanged",
        "geoselectchanged",
        "geoselected",
        "geounselected",
        "pieselectchanged",
        "pieselected",
        "pieunselected",
        "mapselectchanged",
        "mapselected",
        "mapunselected",
        "axisareaselected",
        "focusnodeadjacency",
        "unfocusnodeadjacency",
        "brush",
        "brushselected"
    ];

    const MOUSE_EVENTS = [
        "click",
        "dblclick",
        "mouseover",
        "mouseout",
        "mousedown",
        "mouseup",
        "globalout"
    ];

    export default {
        name: "MueChart",
        props: {
            options: Object,
            theme: [String, Object],
            group: String,
            autoResize: Boolean
        },
        data(){
            return {
                chart: null
            };
        },
        computed: {
            thm(){
                let isNight = this.$root.theme === "night";
                return `${isNight ? "dark" : "light"}-${(this.theme || "default")}`;
            }
        },
        watch: {
            options: {
                deep: true,
                handler(options){
                    if(!this.chart){
                        this.init()
                    }
                    else{
                        if(options){
                            this.chart.setOption(options, true);
                        }
                        else{
                            this.chart.clear();
                        }

                    }
                }
            },
            group(group){
                this.chart.group = group;
            },
            thm(){
                this.dispose();
                this.init();
            }
        },
        methods: {
            _callMethod(method, ...args){
                if(!this.chart){
                    return;
                }
                return this.chart[method](...args);
            },
            // 初始化chart
            init(){
                if(this.chart){
                    return;
                }
                let chart = ECharts.init(this.$el, this.thm);
                this.chart = chart;
                if(this.group){
                    chart.group = this.group;
                }

                try{
                    this.options && "series" in this.options && chart.setOption(this.options, true);
                } catch(e){

                }

                ACTION_EVENTS.forEach((event) => {
                    chart.on(event, (params) => {
                        this.$emit(event, params);
                    });
                });
                MOUSE_EVENTS.forEach((event) => {
                    chart.on(event, (params) => {
                        this.$emit(event, params);
                    });
                });
            },
            // 销毁chart
            dispose(){
                this._callMethod("dispose");
                this.chart = null;
            },
            resize(){
                this._callMethod("resize");
            },
            clear(){
                this._callMethod("clear");
            },
            mergeOptions(options){
                this._callMethod("setOption", options);
            },
            dispatchAction(payload){
                this._callMethod("dispatchAction", payload);
            },
            convertToPixel(finder, value){
                return this._callMethod("convertToPixel", finder, value);
            },
            convertFromPixel(finder, value){
                return this._callMethod("convertFromPixel", finder, value);
            },
            containPixel(finder, value){
                return this._callMethod("containPixel", finder, value);
            },
            showLoading(type, options){
                this._callMethod("showLoading", type, options);
            },
            hideLoading(){
                this._callMethod("hideLoading")
            },
            getDataURL(options){
                return this._callMethod("getDataURL", options);
            },
            getConnectedDataURL(options){
                return this._callMethod("getConnectedDataURL", options);
            },
            connect(group){
                if(typeof group != "string"){
                    group = group.map((chart) => chart.chart);
                }
                ECharts.connect(group);
            },
            disconnect(group){
                ECharts.disConnect(group);
            },
            registerMap(...args){
                ECharts.registerMap(...args);
            },
            registerTheme(...args){
                ECharts.registerTheme(...args);
            }
        },
        components: {},
        mounted(){
            // 添加resize监视
            if(this.autoResize){
                addResizeListener(this.$el, this.resize);
            }
            this.init();
        },
        beforeDestroy(){
            // 移除resize监视
            if(this.autoResize){
                removeResizeListener(this.$el, this.resize);
            }
        }
    }
</script>
