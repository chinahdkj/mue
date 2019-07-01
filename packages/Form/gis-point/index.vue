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
                <div v-if="!FORM_ITEM.readonly"
                     class="van-hairline--top-bottom van-picker__toolbar">
                    <div class="van-picker__cancel" @click="onCancel">
                        {{cancelButtonText}}
                    </div>
                    <div class="van-picker__confirm" @click="onConfirm">确认</div>
                </div>
                <div class="mue-gis-point-pop--info">
                    <label>经度</label><span>{{(pos || {}).lng | round}}</span>
                    <label>纬度</label><span>{{(pos || {}).lat | round}}</span>
                </div>
                <div class="mue-gis-point-pop--map">
                    <l-map v-if="pos" :zoom="zoom" :min-zoom="8" :max-zoom="18"
                           :options="{zoomControl: false, attributionControl: false}"
                           :center="pos" @update:center="updateCenter">
                        <l-control-zoom position="topright"></l-control-zoom>
                        <l-tile-layer :options="{subdomains: ['1', '2', '3','4']}"
                                      url="http://webrd0{s}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}"/>
                        <l-marker v-if="FORM_ITEM.readonly" :lat-lng="pos"/>
                        <l-circle v-if="limit" :lat-lng="limit.center" :radius="limit.radius" color="#4796e3"/>
                    </l-map>
                    <div class="mue-gis-point-pop--marker" v-if="!FORM_ITEM.readonly"
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
    import {LCircle, LControlZoom, LMap, LMarker, LTileLayer} from "vue2-leaflet";
    import "leaflet/dist/leaflet.css";
    import {MarkerIcon} from "../../../src/utils/gis";

    delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.mergeOptions({...MarkerIcon});

    const ROUND = (v) => {
        return Number(Number(v).toFixed(8));
    };

    const VALID_POS = (v) => {
        if (!v) {
            return null;
        }
        if (typeof v === "string") {
            v = v.split(",");
        }
        if (Array.isArray(v)) {
            return v.length === 2 ? {lng: Number(v[0]), lat: Number(v[1])} : null;
        }
        return typeof v === "object" && v.lng != null && v.lat != null
            ? {lng: Number(v.lng), lat: Number(v.lat)} : null;
    };

    export default {
        name: "MueGisPoint",
        components: {LMap, LTileLayer, LMarker, LControlZoom, LCircle},
        inject: {
            FORM_ITEM: {
                from: "FORM_ITEM",
                default() {
                    return {};
                }
            }
        },
        props: {
            value: {default: null},
            clearable: {default: false, type: Boolean},
            disabled: {type: Boolean, default: false},
            placeholder: {type: String, default: ""},
            datatype: {
                type: String, default: "string", validator(v) {
                    return ["string", "array", "object"].indexOf(v) > -1;
                }
            },
            zoom: {type: Number, default: 14},
            limit: {type: Object, default: null}
        },
        data() {
            return {
                pop: false,
                pos: null,
                distance: null,
                exceedArea: false
            };
        },
        computed: {
            text() {
                let pos = VALID_POS(this.value);
                return !pos ? "" : `${ROUND(pos.lng)},${ROUND(pos.lat)}`;
            },
            cancelButtonText() {
                return this.clearable ? "清空" : "取消";
            },
            markerOpt() {
                return {
                    src: MarkerIcon.iconRetinaUrl,
                    style: {
                        height: `${MarkerIcon.iconSize[1]}px`,
                        width: `${MarkerIcon.iconSize[0]}px`,
                        transform:
                            `translate3d(-${MarkerIcon.iconAnchor[0]}px, -${MarkerIcon.iconAnchor[1]}px, 0)`
                    }
                }
            },
            shandowOpt() {
                return {
                    src: MarkerIcon.shadowUrl,
                    style: {
                        height: `${MarkerIcon.shadowSize[1]}px`,
                        width: `${MarkerIcon.shadowSize[0]}px`,
                        right: `${MarkerIcon.shadowAnchor[0]}px`,
                        bottom: `${MarkerIcon.shadowAnchor[1]}px`
                    }
                }
            }
        },
        watch: {
            pop(v) {
                if (!v) {
                    return;
                }
                let pos = VALID_POS(this.value);
                if (!pos) {
                    this.pos = null;
                    this.$native.getLocation({
                        cb: ({lat, lng}) => {
                            this.pos = {lat, lng};
                        }
                    });
                    return;
                }

                this.pos = pos;
            },
            pos: {
                immediate: true,
                handler(v) {
                    if (!this.limit || !this.pos) {
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
            round(v) {
                return v == null ? "" : ROUND(v);
            }
        },
        methods: {
            rePos(){
                this.$native.getLocation({
                    cb: ({lat, lng}) => {
                        this.pos = {lat, lng};
                    }
                });
            },
            updateCenter(v) {
                if (!this.FORM_ITEM.readonly) {
                    this.pos = v;
                }
            },
            showPop() {
                if (this.disabled || (this.FORM_ITEM.readonly && !this.pos)) {
                    return;
                }
                this.pop = true;
            },
            onConfirm() {
                if (this.distance && this.exceedArea) {
                    this.$toast.fail('超出范围');
                    return;
                }

                this.pop = false;
                if (!this.pos) {
                    this.$emit("input", null);
                    this.$emit("change", null);
                    return;
                }
                let value;
                if (this.datatype === "string") {
                    value = `${ROUND(this.pos.lng)},${ROUND(this.pos.lat)}`;
                }
                else if (this.datatype === "array") {
                    value = [ROUND(this.pos.lng), ROUND(this.pos.lat)];
                }
                else {
                    value = {lat: ROUND(this.pos.lat), lng: ROUND(this.pos.lng)}
                }
                this.$emit("input", value);
                this.$emit("change", value);
            },
            onCancel() {
                this.pop = false;
                if (this.clearable) {
                    this.$emit("input", null);
                    this.$emit("change", null);
                }
            }
        }
    }
</script>