<template>
    <div class="mue-gis-point">
        <div class="mue-form-input has-suffix" @click="showPop"
             :class="{'mue-form-input__is-disabled': disabled}">
            <input type="text" class="input__inner" readonly :value="text" :disabled="disabled"
                   :placeholder="placeholder" unselectable="on" onfocus="this.blur()"/>
            <i class="input__suffix input__suffix_icon iconfont icon-dingwei4"
               @click.stop="rePos"/>
        </div>
        <van-popup ref="pop" class="mue-gis-point-pop" v-model="pop" position="bottom"
                   :lazy-render="true" get-container="body" :close-on-click-overlay="false"
                   @click-overlay="pop = false">
            <div class="van-picker" v-loading="!pos">
                <div v-if="!isReadonly"
                     class="van-hairline--top-bottom van-picker__toolbar">
                    <div class="van-picker__cancel" @click="onCancel">
                        {{cancelButtonText}}
                    </div>
                    <div class="van-picker__confirm" @click="onConfirm">{{ t('mue.common.confirm') }}</div>
                </div>
                <div class="mue-gis-point-pop--info">
                    <label>{{ t('mue.form.gis.longText')}}</label><span>{{(pos || {}).lng | round}}</span>
                    <label>{{ t('mue.form.gis.latText')}}</label><span>{{(pos || {}).lat | round}}</span>
                </div>
                <div class="mue-gis-point-pop--map">
                    <l-map ref="Lmap" v-if="pos" :zoom="zoom" :min-zoom="8" :max-zoom="18"
                           :options="{zoomControl: false, attributionControl: false}"
                           :center="pos" @update:center="updateCenter">
                        <l-control position="topright" class="get-location" v-if="!isReadonly">
                            <div class="btn-con" @click.stop="getLocation">
                                <van-loading type="spinner" size="24px" v-if="loading"/>
                                <i v-else class="iconfont icon-dingwei1"></i>
                                <span class="title">{{ t('mue.form.gis.positionText')}}</span>
                            </div>
                        </l-control>
                        <l-control-zoom position="topright" :zoomInText="zoomInIcon"
                                        :zoomOutText="zoomOutIcon"></l-control-zoom>
                        <l-tile-layer :options="{subdomains: ['1', '2', '3','4']}"
                                      url="http://webrd0{s}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}"/>
                        <l-marker v-if="isReadonly" :lat-lng="pos"/>
                        <l-circle v-if="limit" :lat-lng="limit.center" :radius="limit.radius"
                                  color="#4796e3"/>
                    </l-map>
                    <div class="mue-gis-point-pop--marker" v-if="!isReadonly"
                         :style="markerOpt.style">
                        <img class="--shadow" v-bind="shandowOpt"/>
                        <img :src="markerOpt.src"/>
                        <span v-if="exceedArea" class="exceed-area"></span>
                    </div>
                </div>
            </div>
        </van-popup>
    </div>
</template>

<script>
    import {LCircle, LControl, LControlZoom, LMap, LMarker, LTileLayer} from "vue2-leaflet";
    import "leaflet/dist/leaflet.css";
    import {MarkerIcon} from "../../../src/utils/gis";

    import {localeMixin, t} from "../../../src/locale";


    delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.mergeOptions({...MarkerIcon});

    const ROUND = (v) => {
        return Number(Number(v).toFixed(8));
    };

    const VALID_POS = (v) => {
        if(!v){
            return null;
        }
        if(typeof v === "string"){
            v = v.split(",");
        }
        if(Array.isArray(v)){
            return v.length === 2 ? {lng: Number(v[0]), lat: Number(v[1])} : null;
        }
        return typeof v === "object" && v.lng != null && v.lat != null
            ? {lng: Number(v.lng), lat: Number(v.lat)} : null;
    };

    export default {
        mixins: [localeMixin],
        name: "MueGisPoint",
        components: {LMap, LTileLayer, LMarker, LControlZoom, LCircle, LControl},
        inject: {
            FORM_ITEM: {
                from: "FORM_ITEM",
                default(){
                    return {};
                }
            }
        },
        props: {
            value: {default: null},
            clearable: {default: false, type: Boolean},
            disabled: {type: Boolean, default: false},
            readonly: {type: Boolean, default: false},
            placeholder: {type: String, default: ""},
            datatype: {
                type: String, default: "string", validator(v){
                    return ["string", "array", "object"].indexOf(v) > -1;
                }
            },
            zoom: {type: Number, default: 18},
            limit: {type: Object, default: null}
        },
        data(){
            return {
                loading: false,
                pop: false,
                pos: null,
                distance: null,
                exceedArea: false,
                zoomInIcon: `<i class=\"iconfont icon-tianjia1-copy\"></i><span class=\"title\">${t('mue.form.gis.zoomInText')}</span>`,
                zoomOutIcon: `<i class=\"iconfont icon-jianquminus25-copy\"></i><span class=\"title\">${t('mue.form.gis.zoomOutText')}</span>`,
            };
        },
        computed: {
            text(){
                let pos = VALID_POS(this.value);
                return !pos ? "" : `${ROUND(pos.lng)},${ROUND(pos.lat)}`;
            },
            cancelButtonText(){
                return this.clearable ? t('mue.common.clear') : t('mue.common.cancel');
            },
            isReadonly(){
                return this.FORM_ITEM.readonly || this.readonly;
            },
            markerOpt(){
                return {
                    src: MarkerIcon.iconRetinaUrl,
                    style: {
                        height: `${MarkerIcon.iconSize[1]}px`,
                        width: `${MarkerIcon.iconSize[0]}px`,
                        transform:
                            `translate3d(-${MarkerIcon.iconAnchor[0]}px, -${MarkerIcon.iconAnchor[1]}px, 0)`
                    }
                };
            },
            shandowOpt(){
                return {
                    src: MarkerIcon.shadowUrl,
                    style: {
                        height: `${MarkerIcon.shadowSize[1]}px`,
                        width: `${MarkerIcon.shadowSize[0]}px`,
                        right: `${MarkerIcon.shadowAnchor[0]}px`,
                        bottom: `${MarkerIcon.shadowAnchor[1]}px`
                    }
                };
            }
        },
        watch: {
            pop(v){
                if(!v){
                    return;
                }
                let pos = VALID_POS(this.value);
                if(!pos){
                    this.pos = null;
                    this.$native.getLocation({
                        cb: (pos) => {
                            this.pos = pos ? {lat: pos.lat, lng: pos.lng} : {lat: 30, lng: 120};
                        }
                    });
                    return;
                }

                this.pos = pos;
            },
            pos: {
                immediate: true,
                handler(v){
                    if(!this.limit || !this.pos){
                        return;
                    }

                    let posCenter = L.latLng(v.lat, v.lng);
                    let limitCenter = L.latLng(this.limit.center.lat, this.limit.center.lng);
                    this.distance = L.CRS.Earth.distance(posCenter, limitCenter);
                    this.exceedArea = this.distance > this.limit.radius;
                }
            }
        },
        filters: {
            round(v){
                return v == null ? "" : ROUND(v);
            }
        },
        methods: {
            getLocation(){
                this.loading = true;
                this.$native.getLocation({
                    cb: ({lat, lng}) => {
                        this.pos = {lat, lng};
                        this.loading = false;
                    }
                });
            },
            rePos(){
                if(this.isReadonly){
                    return;
                }
                this.$native.getLocation({
                    cb: (pos) => {
                        this.pos = pos ? {lat: pos.lat, lng: pos.lng} : {lat: 30, lng: 120};
                        this.$nextTick(() => {
                            this.onConfirm();
                        });
                    }
                });
            },
            updateCenter(v){
                if(!this.isReadonly){
                    this.pos = v;
                }
            },
            showPop(){
                if(this.disabled){
                    return;
                }
                this.pop = true;
            },
            onConfirm(){
                if(this.distance && this.exceedArea){
                    this.$toast.fail(t('mue.form.gis.rangeOutText'));
                    return;
                }

                this.pop = false;
                if(!this.pos){
                    this.$emit("input", null);
                    this.$emit("change", null);
                    this.getAddress(null);
                    return;
                }
                let value;
                if(this.datatype === "string"){
                    value = `${ROUND(this.pos.lng)},${ROUND(this.pos.lat)}`;
                }
                else if(this.datatype === "array"){
                    value = [ROUND(this.pos.lng), ROUND(this.pos.lat)];
                }
                else{
                    value = {lat: ROUND(this.pos.lat), lng: ROUND(this.pos.lng)};
                }
                this.$emit("input", value);
                this.$emit("change", value);
                this.getAddress(`${ROUND(this.pos.lng)},${ROUND(this.pos.lat)}`);
            },
            onCancel(){
                this.pop = false;
                if(this.clearable){
                    this.$emit("input", null);
                    this.$emit("change", null);
                    this.getAddress(null);
                }
            },
            getAddress(pos) { //通过经纬度获取地址详细信息
                if(!pos) {
                    this.$emit("on-confirm", null);
                    return
                }
                $.ajax({
                    type: "get",
                    url: "https://restapi.amap.com/v3/geocode/regeo",
                    data: {
                        location: pos,
                        key: '5f222dee3e0f7eee71b86a8eee0e4a54',
                    },
                    async:true,
                    cache:false,
                    dataType: 'json',
                    success: (res) => {
                        if(res.status === '1') {
                            this.$emit("on-confirm", res.regeocode)
                        }
                    },
                    error: (data) => {

                        console.log(data);
                    }
                })
            },
        }
    };
</script>
