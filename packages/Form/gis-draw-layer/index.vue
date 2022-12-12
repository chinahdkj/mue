<template>
    <div class="mue-gis-draw-layer">
        <div class="mue-form-input has-suffix" :class="{'mue-form-input__is-disabled': disabled}"
             @click.stop="showDialog">
            <input type="text" class="input__inner" readonly :value="model" :disabled="disabled" unselectable="on"/>
            <i class="input__suffix input__suffix_icon iconfont icon-dingwei4"/>
        </div>
        <van-popup ref="pop" class="mue-gis-draw-layer-pop" v-model="pop" position="bottom"
                   get-container="body" :close-on-click-overlay="false"
                   @click-overlay="pop = false" @open="onOpen" @close="onClose">
            <div class="mue-gis-draw-layer-pop-header">绘制图层</div>
            <div class="mue-gis-draw-layer-pop-content">
                <mue-draw-layer v-if="ready" :type="type" v-model="latlngs" :options="options" :gwt-option="gwtOption" :offOption="offOption"
                                @change="onDrawed" @center-zoom="centerZoom"
                                :readonly="readonly"
                                :layers="layerList" style="width: 100%;height: 100%;"/>
            </div>
            <div class="mue-gis-draw-layer-pop-footer">
                <van-button native-type="button" size="large" plain @click="pop = false">取消</van-button>
                <van-button native-type="button" size="large" type="primary" @click="confirm">确定</van-button>
            </div>
        </van-popup>
    </div>
</template>

<script>
import MueDrawLayer from "./mue-draw-layer.vue";
export default {
    name: "MueGisDrawLayer",
    componentName: "MueGisDrawLayer",
    components: {
        MueDrawLayer
    },
    inject: {
        FORM_ITEM: {
            from: "FORM_ITEM",
            default(){
                return {};
            }
        }
    },
    props: {
        value: {
            type: [String, Array],
            default() {
                return [];
            }
        },
        type: {
            type: String,
            default: 'polygon'
        },
        layerList: {
            type: Array,
            default() {
                return []
            }
        },
        gwtOption: Object,
        options: {
            type: [Object, Promise],
            default () {
                return {
                    gis: {}
                }
            }
        },
        disabled: {
            type: Boolean,
            default: false
        },
        lsLnglat: { //是否经度在前，维度在后
            type: Boolean,
            default: false
        },
        edit: { //支持手输，目前仅支持绘制一块区域
            type: Boolean,
            default: false
        },
        offOption: { type: Object, default: null },//离线地图配置
        readonly: {
            type: Boolean,
            default: false
        },//可查看不可编辑
    },
    computed:{
        model: {
            get() {
                if(!this.value) {
                    return ""
                }
                let v = $.extend(true, [], this.value)
                return String(v);
            },
            set(nv) {
                let arr = nv.split(",");
                let temp = [];
                try {
                    for(let i=0; i<arr.length; i+=2) {
                        temp.push(arr.slice(i, i+2))
                    }
                    this.$emit("input", [temp])
                } catch (e) {
                    this.$emit("input", [])
                }
            }
        }
    },
    data(){
        return {
            latlngs: [], //传入cue-draw-layer始终需要【维,经】模式
            ready: false,
            pop: false,
        };
    },
    methods:{
        onOpen() {
            //兼容数据，如果结果集数组的深度为2,转化为3
            let level = this.getLevels(this.value)
            let v = this.value;
            if(level === 2) {
                v = [v]
            }

            this.initValues(v)
            this.ready = true;

        },
        onClose() {
            this.pop = false;
            this.ready = false
            this.initValues(this.value)
        },
        initValues(v) {
            if(!v) {
                return
            }
            let latlngs = $.extend(true, [], v)
            if(this.lsLnglat) {
                this.latlngs = this.format(latlngs)
            } else {
                this.latlngs = latlngs
            }
        },
        format(lnglat) { //经纬度对调，影响model和value
            // console.log("lnglat", lnglat)
            if(!lnglat || !lnglat.length) {
                return []
            }

            let newData = $.extend(true, [], lnglat);
            //一个区域和多块区域时数据结构存在差异，需要区分处理
            if(newData.length === 1) {
                newData[0].forEach(f => {
                    let lng = f[0], lat = f[1]
                    f[0] = lat;
                    f[1] = lng;
                })
                return newData
            } else {
                newData.forEach(arr => {
                    arr[0].forEach(f => {
                        let lng = f[0], lat = f[1]
                        f[0] = lat;
                        f[1] = lng;
                    })
                })
                return newData
            }
        },
        //获取数组深度
        getLevels(arr) {
            if(!arr) {
                return 0
            }
            let max = 0;
            function fetch(data, step) {
                data.forEach(e => {
                    if (step > max) {
                        max = step;
                    }
                    if (Array.isArray(e)) {
                        fetch(e, step + 1)
                    }
                })
            }
            fetch(arr, 1);
            return max;
        },
        onDrawed(v) {
            this.latlngs = v
            this.$emit('onDrawed',v)
        },
        showDialog() {
            if(!this.disabled){
                this.pop = true;
            }
        },
        confirm() {
            let latlngs = $.extend(true, [], this.latlngs)
            if(this.lsLnglat) {
                this.$emit('input', this.format(latlngs))
            } else {
                this.$emit('input', latlngs)
            }
            this.pop = false;
        },
        centerZoom(center, zoom) {
            this.$emit('center-zoom', center, zoom)
        }
    }
}
</script>

<style scoped lang="less">
.mue-gis-draw-layer-pop-header{
    height: 44px;
    text-align: center;
    line-height: 44px;
}
.mue-gis-draw-layer-pop-content{
    height: calc(100vh - 150px);
}
.mue-gis-draw-layer-pop-footer{
    height: 44px;
    text-align: center;
    display: flex;
    .van-button{
        flex: 1;
        border: none;
        border-radius: 0;
    }
}
</style>