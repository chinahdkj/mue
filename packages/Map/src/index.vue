<template>
    <div class="mue-map">
        <l-map
            class="mue-map-map"
            ref="map"
            :center="center"
            :zoom="zoom"
            :min-zoom="minZoom"
            :max-zoom="maxZoom"
            :options="{...{attributionControl: false, zoomControl: false}, ...options}"
            @ready="mapReady()"
            >
            <l-layer-group
                layer-type="base"
                >
                <l-tile-layer
                    v-for="layer in layers"
                    :key="layer._url"
                    :url="layer._url"
                    :options="layer.options"
                    />
            </l-layer-group>

            <l-marker
                v-for="d in data"
                :key="d.id"
                :lat-lng="d.latlng"
                :options="{ data: d }"
                @click="markerClick"
                >
                <l-icon
                    :icon-url="d.iconUrl"
                    :icon-size="d.iconSize || [30, 30]"
                    :icon-anchor="d.iconAnchor ? d.iconAnchor : (d.iconSize ? [d.iconSize[0] / 2, d.iconSize[1]] : [15, 30])"
                    :class-name="clickMarkerId == d.id ? 'shanshuo-icon' : ''"
                    >
                </l-icon>
            </l-marker>

            <l-marker
                v-if="locationLatlng"
                :lat-lng="locationLatlng"
            >
                <l-icon>
                    <div class="shanshuo-marker"></div>
                </l-icon>
            </l-marker>
        </l-map>

        <div class="mue-map-search" v-if="search.show">
            <form action="/">
                <van-search v-model="search.value" :placeholder="searchPlaceholder" @search="onSearch" @cancel="onCancel">
                    <template #left-icon><span></span></template>
                </van-search>
            </form>
            <div class="mue-map-tool" @click="search.show = !search.show">
                <i class="iconfont icon-sousuokuang-copy"></i><span>搜索</span>
            </div>
        </div>
        <div class="mue-map-tools">
            <div :class="{'hide': search.show}" class="mue-map-tool" @click="search.show = !search.show">
                <i class="iconfont icon-sousuokuang-copy"></i><span>搜索</span>
            </div>

            <slot name="tools"></slot>

            <div class="mue-map-tool-group">
                <div class="mue-map-tool" @click="onZoom('In')">
                    <i class="iconfont icon-tianjia1-copy"></i><span>放大</span>
                </div>
                <div class="mue-map-tool" @click="onZoom('Out')">
                    <i class="iconfont icon-jianquminus25-copy"></i><span>缩小</span>
                </div>
            </div>
            <div class="mue-map-tool" @click="onLocation">
                <i class="iconfont icon-dingwei1-copy"></i><span>定位</span>
            </div>
        </div>

        <van-popup
            v-model="search.popup"
            closeable
            position="bottom"
            :style="{ maxHeight: '50%' }"
            >
            <van-cell v-for="s in search.data" :key="s.id" @click="cellClick(s)">
                <template slot="title">
                    <slot name="title" :model="s">
                        {{ s.name }}
                    </slot>
                </template>
            </van-cell>
        </van-popup>
    </div>
</template>

<script>
import {localeMixin, t} from "../../../src/locale";
import { LMap, LLayerGroup, LTileLayer, LMarker, LIcon } from 'vue2-leaflet';
import '../../Form/gis-draw-layer/leaflet.ChineseTmsProviders';
export default {
    mixins: [localeMixin],
    name: "MueMap",
    components: {
        LMap, LLayerGroup, LTileLayer, LMarker, LIcon
    },
    props: {
        //地图中心
        center: {
            type: Array,
            default() {
                return [30.746814, 120.755623]
            }
        },
        //地图默认级别
        zoom: {
            type: Number,
            default: 12
        },
        //地图最小级别
        minZoom: {
            type: Number,
            default: 5
        },
        //地图最大级别
        maxZoom: {
            type: Number,
            default: 18
        },
        //地图扩展参数
        options: {
            type: Object,
            default() {
                return {}
            }
        },
        //底图类型
        mapType: {
            type: String,
            default: 'GaoDe-Normal'
        },
        //落点数据
        data: {
            type: Array,
            default() {
                return []
            }
        },
        //搜索落点字段
        searchKey: {
            type: String,
            default: 'name'
        },
        //搜索placeholder提示内容
        searchPlaceholder: {
            type: String,
            default: '请输入搜索名称'
        },
        //点击点闪烁
        twinkle: {
            type: Boolean,
            default: true
        }
    },
    data(){
        return {
            map: null,
            search: {
                show: false,
                value: '',
                popup: false,
                data: []
            },
            locationLatlng: null,
            clickMarkerId: null
        }
    },
    computed: {
        layers() {
            if(this.mapType == 'GaoDe-Normal') {
                return [L.tileLayer.chinaProvider('GaoDe.Normal.Map')]
            }else if(this.mapType == 'GaoDe-Satellite') {
                return [L.tileLayer.chinaProvider('GaoDe.Satellite.Map'), L.tileLayer.chinaProvider('GaoDe.Satellite.Annotion')]
            }else if(this.mapType == 'TianDiTu-Normal') {
                return [L.tileLayer.chinaProvider('TianDiTu.Normal.Map'), L.tileLayer.chinaProvider('TianDiTu.Normal.Annotion')]
            }else if(this.mapType == 'TianDiTu-Satellite') {
                return [L.tileLayer.chinaProvider('TianDiTu.Satellite.Map'), L.tileLayer.chinaProvider('TianDiTu.Satellite.Annotion')]
            }else if(this.mapType == 'Google-Normal') {
                return [L.tileLayer.chinaProvider('Google.Normal.Map')]
            }else if(this.mapType == 'Google-Satellite') {
                return [L.tileLayer.chinaProvider('Google.Satellite.Map'), L.tileLayer.chinaProvider('Google.Satellite.Annotion')]
            }else {
                return [L.tileLayer.chinaProvider(this.mapType.replace(/-/g, '.'))]
            }
        }
    },
    watch: {

    },
    methods: {
        mapReady() {
            this.map = this.$refs.map.mapObject
        },
        onZoom(type) {
            this.map[`zoom${type}`]()
        },
        onLocation() {
            this.$native.getLocation({
                params: {},
                cb: (result) => {
                    let latlng = [result.lat, result.lng]
                    this.location(latlng)
                }
            });
            // this.location([30, 120])
        },
        location(latlng) {
            if(this.locationTimer) {
                clearTimeout(this.locationTimer)
            }
            this.map.panTo(latlng)
            this.locationLatlng = latlng
            this.locationTimer = setTimeout(()=> {
                this.locationLatlng = null
            }, 5000)
        },
        onSearch(){
            if(!this.search.value) {
                this.search.data = []
            }else {
                this.search.data = this.data.filter(d=> d[this.searchKey].indexOf(this.search.value) > -1)
            }
            if(this.search.data.length > 0){
                this.search.popup = true
            }else{
                this.$toast('未搜索到数据')
            }
        },
        onCancel(){
            this.search.value = ''
            this.search.show = false
            this.search.data = []
        },
        markerClick(e) {
            let data = e.target.options.data
            this.mClick(data)
        },
        mClick(data) {
            if(this.twinkle) {
                this.clickMarkerId = data.id
            }
            this.$emit('marker-click', data)
        },
        cellClick(s) {
            this.mClick(s)
            this.map.setView(s.latlng, this.map.getMaxZoom() - 1)
            this.search.popup = false
            this.search.show = false
        }
    }
};
</script>

<style lang="less">
.mue-map{
    height: 100%;
    width: 100%;
    position: relative;
    .mue-map-map{
        z-index: 1;
    }
    .mue-map-tool{
        width: 40px;
        height: 40px;
        box-sizing: border-box;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        font-size: 10px;
        color: #212121;
        border-radius: 4px;
        background: #ffffff;
        box-shadow: 0px 0px 6px 0px rgba(0,0,0,0.42);
        margin-top: 12px;
        .iconfont{
            font-size: 22px;
            color: #4796E3;
        }
        &.hide{
            opacity: 0;
        }
    }
    .mue-map-tools{
        z-index: 10;
        position: absolute;
        top: 0;
        right: 12px;
        .mue-map-tool-group{
            border-radius: 4px;
            box-shadow: 0px 0px 6px 0px rgba(0,0,0,0.42);
            overflow: hidden;
            margin-top: 12px;
            .mue-map-tool{
                margin-top: 0;
                box-shadow: none;
                border-radius: 0;
                position: relative;
                &~.mue-map-tool:before{
                    content: '';
                    position: absolute;
                    top: -0.5px;
                    width: 100%;
                    height: 1px;
                    background: #E5E5E5;
                }
            }
        }
    }
    .mue-map-search{
        z-index: 15;
        position: absolute;
        top: 12px;
        left: 12px;
        width: calc(~"100% - 24px");
        box-shadow: 0px 0px 6px 0px rgba(0,0,0,0.42);
        border-radius: 4px;
        overflow: hidden;
        display: flex;
        .mue-map-tool{
            margin: 0;
            box-shadow: none;
            border-radius: 0;
        }
        form{
            flex: 1;
            .van-search{
                padding: 3px 4px 3px 0;
            }
        }
    }

    .shanshuo-marker{
        width: 12px;
        height: 12px;
        background-color: #0099CB;
        border-radius: 100%;
        position: relative;
        &::before{
            animation: shanshuo 2s infinite;
            position: absolute;
            width: 12px;
            height: 12px;
            border-radius: 50%;
            content: '';
            background-color: #0099CB;
        }
    }
    @keyframes shanshuo{0%{ transform: scale(1); opacity:.9}100%{ transform: scale(6); opacity: 0;}}

    .shanshuo-icon{
        animation: shanshuo2 1s infinite;
    }
    @keyframes shanshuo2{0%{ opacity:1}100%{ opacity: 0.3;}}
}
</style>
