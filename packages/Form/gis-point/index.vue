<template>
	<div class="mue-gis-point">
		<div class="mue-form-input has-suffix"
			@click="showPop"
			:class="{'mue-form-input__is-disabled': disabled}">
			<input type="text"
				class="input__inner"
				readonly
				:value="text"
				:disabled="disabled"
				:placeholder="placeholder"
				unselectable="on"
				onfocus="this.blur()" />
			<i class="input__suffix input__suffix_icon iconfont icon-dingwei4"
				@click.stop="rePos" />
		</div>
		<van-popup ref="pop"
			class="mue-gis-point-pop"
			v-model="pop"
			position="bottom"
			:lazy-render="true"
			get-container="body"
			:close-on-click-overlay="false"
			@click-overlay="pop = false">
			<div class="van-picker"
				v-loading="!pos">
				<div v-if="!isReadonly"
					class="van-hairline--top-bottom van-picker__toolbar">
					<div class="van-picker__cancel"
						@click="onCancel">
						{{cancelButtonText}}
					</div>
					<div class="van-picker__confirm"
						@click="onConfirm">{{ t('mue.common.confirm') }}</div>
				</div>
				<div class="mue-gis-point-pop--info">
					<label>{{ t('mue.form.gis.longText')}}</label><span>{{(pos || {}).lng | round}}</span>
					<label>{{ t('mue.form.gis.latText')}}</label><span>{{(pos || {}).lat | round}}</span>
				</div>
				<div class="mue-gis-point-pop--map">
					<div class="lh-map-wrap" v-if="showlhsw">
						<div id="map"
							style="height:100%">
						</div>
						<div class="lh-boxshow" v-if="!showGisList"></div>
						<div class="lh-gxtype-change" v-if="!showGisList">
							<div class="gxtype-item" :class="{active:gxType=='排水'}" @click.stop="handleGxType('排水')">排水</div>
							<div class="gxtype-item" :class="{active:gxType=='供水'}" @click.stop="handleGxType('供水')">供水</div>
						</div>
					</div>
					
					<l-map ref="Lmap"
						v-if="pos&&!showlhsw"
						:zoom="zoom"
						:min-zoom="8"
						:max-zoom="18"
						:options="{zoomControl: false, attributionControl: false}"
						:center="pos"
						@leaflet:load="mapReady"
						@update:center="updateCenter">
						<l-control position="topright"
							class="get-location"
							v-if="!isReadonly">
							<div class="btn-con"
								@click.stop="getLocation">
								<van-loading type="spinner"
									size="24px"
									v-if="loading" />
								<i v-else
									class="iconfont icon-dingwei1"></i>
								<span class="title">{{ t('mue.form.gis.positionText')}}</span>
							</div>
						</l-control>
						
						<l-control-zoom position="topright"
							:zoomInText="zoomInIcon"
							:zoomOutText="zoomOutIcon"></l-control-zoom>
						<l-tile-layer :options="{subdomains: ['1', '2', '3','4']}"
							:url="tileLayerUrl" />
						<l-marker v-if="isReadonly"
							:lat-lng="pos" />
						<l-circle v-if="limit"
							:lat-lng="limit.center"
							:radius="limit.radius"
							color="#4796e3" />
					</l-map>
					<div class="mue-gis-point-pop--marker"
						:style="markerOpt.style">
						<img class="--shadow"
							v-bind="shandowOpt" />
						<img :src="markerOpt.src" />
						<span v-if="exceedArea"
							class="exceed-area"></span>
					</div>
				</div>
			</div>
		</van-popup>
	</div>
</template>

<script>
import {
	LCircle,
	LControl,
	LControlZoom,
	LMap,
	LMarker,
	LTileLayer
} from "vue2-leaflet";
import "leaflet/dist/leaflet.css";
import { coordtransform } from './coordtransform'
import { MarkerIcon } from "../../../src/utils/gis";
import { localeMixin, t } from "../../../src/locale";
import L from "leaflet"
import leaflettilelayerwmtssrc from "../../../src/lib/leaflet-tilelayer-wmts-src";
const esri = require("esri-leaflet");
// import "leaflet.chinatmsproviders";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({ ...MarkerIcon });
L.TileLayer.WMTS = L.TileLayer.extend({
	defaultWmtsParams: {
		service: "WMTS",
		request: "GetTile",
		version: "1.0.0",
		layer: "",
		style: "",
		tilematrixset: "",
		format: "image/jpeg",
		ident: 0
	},

	initialize: function(url, options) {
		// (String, Object)
		this._url = url;
		var lOptions = {};
		var cOptions = Object.keys(options);
		cOptions.forEach(element => {
			lOptions[element.toLowerCase()] = options[element];
		});
		var wmtsParams = L.extend({}, this.defaultWmtsParams);
		var tileSize = lOptions.tileSize || this.options.tileSize;
		if (lOptions.detectRetina && L.Browser.retina) {
			wmtsParams.width = wmtsParams.height = tileSize * 2;
		} else {
			wmtsParams.width = wmtsParams.height = tileSize;
		}
		for (var i in lOptions) {
			// all keys that are in defaultWmtsParams options go to WMTS params
			if (wmtsParams.hasOwnProperty(i) && i != "matrixIds") {
				wmtsParams[i] = lOptions[i];
			}
		}
		this.wmtsParams = wmtsParams;
		this.matrixIds = options.matrixIds || this.getDefaultMatrix();
		L.setOptions(this, options);
	},

	onAdd: function(map) {
		this._crs = this.options.crs || map.options.crs;
		L.TileLayer.prototype.onAdd.call(this, map);
	},

	getTileUrl: function(coords) {
		// (Point, Number) -> String
		var tileSize = this.options.tileSize;
		var nwPoint = coords.multiplyBy(tileSize);
		nwPoint.x += 1;
		nwPoint.y -= 1;
		var sePoint = nwPoint.add(new L.Point(tileSize, tileSize));
		var zoom = this._tileZoom;
		var nw = this._crs.project(this._map.unproject(nwPoint, zoom));
		var se = this._crs.project(this._map.unproject(sePoint, zoom));
		var tilewidth = se.x - nw.x;
		var ident = this.matrixIds[zoom].identifier;
		var tilematrix = Number(ident) + this.options.ident;
		var X0 = this.matrixIds[zoom].topLeftCorner.lng;
		var Y0 = this.matrixIds[zoom].topLeftCorner.lat;
		var tilecol = Math.floor((nw.x - X0) / tilewidth);
		var tilerow = -Math.floor((nw.y - Y0) / tilewidth);
		var url = L.Util.template(this._url, { s: this._getSubdomain(coords) });
		return (
			url +
			L.Util.getParamString(this.wmtsParams, url) +
			"&tilematrix=" +
			tilematrix +
			"&tilerow=" +
			tilerow +
			"&tilecol=" +
			tilecol
		);
	},

	setParams: function(params, noRedraw) {
		L.extend(this.wmtsParams, params);
		if (!noRedraw) {
			this.redraw();
		}
		return this;
	},

	getDefaultMatrix: function() {
		/**
		 * the matrix3857 represents the projection
		 * for in the IGN WMTS for the google coordinates.
		 */
		var matrixIds3857 = new Array(22);
		for (var i = 0; i < 22; i++) {
			matrixIds3857[i] = {
				identifier: "" + i,
				topLeftCorner: new L.LatLng(20037508.3428, -20037508.3428)
			};
		}
		return matrixIds3857;
	}
});

L.tileLayer.wmts = function(url, options) {
	return new L.TileLayer.WMTS(url, options);
};
L.TileLayer.ChinaProvider = L.TileLayer.extend({
	initialize: function(type, options) { // (type, Object)
		var providers = L.TileLayer.ChinaProvider.providers;
		var parts = type.split('.');
		var providerName = parts[0];
		var mapName = parts[1];
		var mapType = parts[2];
		var url = providers[providerName][mapName][mapType];
		options.subdomains = providers[providerName].Subdomains;
		L.TileLayer.prototype.initialize.call(this, url, options);
	}
});

L.TileLayer.ChinaProvider.providers = {
	TianDiTu: {
		Normal: {
			Map: "http://t{s}.tianditu.gov.cn/vec_w/wmts?service=wmts&request=GetTile&version=1.0.0&LAYER=vec&tileMatrixSet=w&TileMatrix={z}&TileRow={y}&TileCol={x}&style=default&tk=c38f91e944f94664d9bf40d8da1667f0",
			Annotion: "http://t{s}.tianditu.gov.cn/cva_w/wmts?service=wmts&request=GetTile&version=1.0.0&LAYER=cva&tileMatrixSet=w&TileMatrix={z}&TileRow={y}&TileCol={x}&style=default&tk=c38f91e944f94664d9bf40d8da1667f0",
		},
		Satellite: {
			Map: "http://t{s}.tianditu.gov.cn/img_w/wmts?service=wmts&request=GetTile&version=1.0.0&LAYER=img&tileMatrixSet=w&TileMatrix={z}&TileRow={y}&TileCol={x}&style=default&tk=c38f91e944f94664d9bf40d8da1667f0",
			Annotion: "http://t{s}.tianditu.gov.cn/cia_w/wmts?service=wmts&request=GetTile&version=1.0.0&LAYER=cia&tileMatrixSet=w&TileMatrix={z}&TileRow={y}&TileCol={x}&style=default&tk=c38f91e944f94664d9bf40d8da1667f0",
		},
		Terrain: {
			Map: "http://t{s}.tianditu.gov.cn/ter_w/wmts?service=wmts&request=GetTile&version=1.0.0&LAYER=ter&tileMatrixSet=w&TileMatrix={z}&TileRow={y}&TileCol={x}&style=default&tk=c38f91e944f94664d9bf40d8da1667f0",
			Annotion: "http://t{s}.tianditu.gov.cn/cta_w/wmts?service=wmts&request=GetTile&version=1.0.0&LAYER=cta&tileMatrixSet=w&TileMatrix={z}&TileRow={y}&TileCol={x}&style=default&tk=c38f91e944f94664d9bf40d8da1667f0",
		},
		Subdomains: ['0', '1', '2', '3', '4', '5', '6', '7']
	},

	GaoDe: {
		Normal: {
			Map: 'http://webrd0{s}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}',
		},
		Satellite: {
			Map: 'http://webst0{s}.is.autonavi.com/appmaptile?style=6&x={x}&y={y}&z={z}',
			Annotion: 'http://webst0{s}.is.autonavi.com/appmaptile?style=8&x={x}&y={y}&z={z}'
		},
		Subdomains: ["1", "2", "3", "4"]
	},

	Google: {
		Normal: {
			Map: "http://mt2.google.cn/maps/vt/lyrs=m@189&gl=cn&x={x}&y={y}&z={z}"
		},
		Satellite: {
			Map: "http://mt3.google.cn/maps/vt/lyrs=y@189&gl=cn&x={x}&y={y}&z={z}"
		},
		Subdomains: []
	},

	Geoq: {
		Normal: {
			Map: "http://map.geoq.cn/ArcGIS/rest/services/ChinaOnlineCommunity/MapServer/tile/{z}/{y}/{x}",
			Color: "http://map.geoq.cn/ArcGIS/rest/services/ChinaOnlineStreetColor/MapServer/tile/{z}/{y}/{x}",
			PurplishBlue: "http://map.geoq.cn/ArcGIS/rest/services/ChinaOnlineStreetPurplishBlue/MapServer/tile/{z}/{y}/{x}",
			Gray: "http://map.geoq.cn/ArcGIS/rest/services/ChinaOnlineStreetGray/MapServer/tile/{z}/{y}/{x}",
			Warm: "http://map.geoq.cn/ArcGIS/rest/services/ChinaOnlineStreetWarm/MapServer/tile/{z}/{y}/{x}",
			Cold: "http://map.geoq.cn/ArcGIS/rest/services/ChinaOnlineStreetCold/MapServer/tile/{z}/{y}/{x}",
			Eng: "http://map.geoq.cn/arcgis/rest/services/ChinaOnlineCommunityENG/MapServer/tile/{z}/{y}/{x}"
		},
		Subdomains: []

	},

	Baidu: {
		Normal: {
			Map: '//online{s}.map.bdimg.com/onlinelabel/?qt=tile&x={x}&y={y}&z={z}&styles=pl&scaler=1&p=1'
		},
		Satellite: {
			Map: '//shangetu{s}.map.bdimg.com/it/u=x={x};y={y};z={z};v=009;type=sate&fm=46',
			Annotion: '//online{s}.map.bdimg.com/tile/?qt=tile&x={x}&y={y}&z={z}&styles=sl&v=020'
		},
		Subdomains: '0123456789',
		tms: true
	}
};

L.tileLayer.chinaProvider = function(type, options) {
	return new L.TileLayer.ChinaProvider(type, options);
};
const ROUND = v => {
	return Number(Number(v).toFixed(8));
};

const VALID_POS = v => {
	if (!v) {
		return null;
	}
	if (typeof v === "string") {
		v = v.split(",");
	}
	if (Array.isArray(v)) {
		return v.length === 2 ? { lng: Number(v[0]), lat: Number(v[1]) } : null;
	}
	return typeof v === "object" && v.lng != null && v.lat != null
		? { lng: Number(v.lng), lat: Number(v.lat) }
		: null;
};

export default {
	mixins: [localeMixin],
	name: "MueGisPoint",
	components: { LMap, LTileLayer, LMarker, LControlZoom, LCircle, LControl },
	inject: {
		FORM_ITEM: {
			from: "FORM_ITEM",
			default() {
				return {};
			}
		}
	},
	props: {
		value: { default: null },
		clearable: { default: false, type: Boolean },
		disabled: { type: Boolean, default: false },
		readonly: { type: Boolean, default: false },
		placeholder: { type: String, default: "" },
		datatype: {
			type: String,
			default: "string",
			validator(v) {
				return ["string", "array", "object"].indexOf(v) > -1;
			}
		},
		zoom: { type: Number, default: 18 },
		limit: { type: Object, default: null },
		currentLocation: { type: Boolean, default: false }, //初始化获取并赋值当前经纬度
		tileLayerUrl: {
			type: String,
			default:
				"http://webrd0{s}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}"
		},
		
		gislist: { type: Array, default: null },
		lhsw:{ type: Boolean, default: false}
	},
	data() {
		return {
			loading: false,
			pop: false,
			pos: null,
			distance: null,
			exceedArea: false,
			zoomInIcon: `<i class=\"iconfont icon-tianjia1-copy\"></i><span class=\"title\">${t(
				"mue.form.gis.zoomInText"
			)}</span>`,
			zoomOutIcon: `<i class=\"iconfont icon-jianquminus25-copy\"></i><span class=\"title\">${t(
				"mue.form.gis.zoomOutText"
			)}</span>`,
			map: null,
			showlhsw: false,
			showGisList:false,
			gxType:'供水',
		};
	},
	computed: {
		text() {
			let pos = VALID_POS(this.value);
			return !pos ? "" : `${ROUND(pos.lng)},${ROUND(pos.lat)}`;
		},
		cancelButtonText() {
			return this.clearable ? t("mue.common.clear") : t("mue.common.cancel");
		},
		isReadonly() {
			return this.FORM_ITEM.readonly || this.readonly;
		},
		markerOpt() {
			return {
				src: MarkerIcon.iconRetinaUrl,
				style: {
					height: `${MarkerIcon.iconSize[1]}px`,
					width: `${MarkerIcon.iconSize[0]}px`,
					transform: `translate3d(-${MarkerIcon.iconAnchor[0]}px, -${MarkerIcon.iconAnchor[1]}px, 0)`
				}
			};
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
			};
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
					cb: pos => {
						this.pos = pos ? { lat: pos.lat, lng: pos.lng } : { lat: 30, lng: 120 };
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
		getLocation() {
			this.loading = true;
			this.$native.getLocation({
				cb: ({ lat, lng }) => {
					this.pos = { lat, lng };
					this.loading = false;
				}
			});
		},
		rePos() {
			if (this.isReadonly) {
				return;
			}
			this.$native.getLocation({
				cb: pos => {
					this.pos = pos ? { lat: pos.lat, lng: pos.lng } : { lat: 30, lng: 120 };
					this.$nextTick(() => {
						this.onConfirm();
					});
				}
			});
		},
		updateCenter(v) {
			if (!this.isReadonly) {
				this.pos = v;
			}
		},
		mapReady() {
			let map = this.$refs.Lmap.mapObject;
			// if (!!this.gislist) {
			// 	this.gislist.forEach(e => {
			// 		let gx = new esri.dynamicMapLayer({
			// 				url: e.url,
			// 				format: e.format,
			// 				f: "image",
			// 				layers: e.layers
			// 			})
			// 			.addTo(map);
			// 	});
			// }
		},
		showPop() {
			if (this.disabled) {
				return;
			}
			this.pop = true;

			if (this.lhsw) {
				this.showlhsw = true;
				this.handleGxType(this.gxType)
			}else if(this.gislist){
				let _this = this;
				this.showGisList = true;
				this.showlhsw = true;
				var normalm = L.tileLayer.chinaProvider("GaoDe.Normal.Map", {
					maxZoom: 18,
					minZoom: 8
				});
				var normal = L.layerGroup([normalm]);
				this.$nextTick(() => {
					let mapOption = {
						center: _this.pos,
						zoom: _this.zoom,
						attributionControl: false,
						zoomControl: true,
						layers:[normal],
						minZoom: 8,
						maxZoom: 18
					};
					if (!this.map) {
						let map = L.map("map", mapOption);
						map.on("drag", function(e) {
							_this.pos = map.getCenter();
							_this.loading = false;
						});
						_this.gislist.forEach(e=>{
							esri
								.dynamicMapLayer({
									url: e.url,
									format: e.format,
									f: "image",
									layers: e.layers
								})
								.addTo(map);
						})
						this.map = map;
					} else {
						this.map.setView(_this.pos);
					}
				});
			}
		},
		handleGxType(value){
			let _this = this;
			_this.gxType = value
			if(this.map){
				this.map.off();
				this.map.remove();
			}
			setTimeout(() => {
				let gbjpos = coordtransform.gcj02towgs84(Number(_this.pos.lng),Number(_this.pos.lat))
				let mapOption = {
					center: {lat:String(gbjpos[1]),lng:String(gbjpos[0])},
					zoom: 10,
					attributionControl: false,
					zoomControl: true,
					minZoom: 6,
					maxZoom: 19,
					tap:false,
					crs: L.CRS.EPSG4326
				};
				let map = L.map("map", mapOption);
				map.on("drag", function(e) {
					_this.pos = map.getCenter();
					_this.loading = false;
				});
				let matrixIds = new Array(22);
				for (var i = 0; i < 22; i++) {
					matrixIds[i] = {
						identifier: "" + i,
						topLeftCorner: new L.LatLng(90, -180)
					};
				}
				let layer1 = L.tileLayer.wmts(
					"http://ditu.zjzwfw.gov.cn/services/wmts/emap/default/oss?token=2c92920471b56e640171be7444540073",
					{
						layer: "emap",
						style: "default",
						tilematrixSet: "esritilematirx",
						format: "image/png",
						maxZoom: 20,
						ident: 1,
						matrixIds
					}
				);
				let layer2 = L.tileLayer.wmts(
					"http://ditu.zjzwfw.gov.cn/services/wmts/emap_lab/default/oss?token=2c92920471b56e640171be7537bd0074",
					{
						layer: "emap",
						style: "default",
						tilematrixSet: "esritilematirx",
						format: "image/png",
						maxZoom: 20,
						ident: 1,
						matrixIds
					}
				);
				let layer = L.layerGroup([layer1, layer2]).addTo(map);
				if(value==='排水') {
					esri
					.dynamicMapLayer({
						url: "http://111.1.5.8:6080/arcgis/rest/services/LH_PS_GWT1/MapServer",
						// url: "http://111.1.5.8:6080/arcgis/rest/services/LM_LH_WATER01/MapServer",
						f: "image"
					})
					.addTo(map);
				}else{
					esri
					.dynamicMapLayer({
						//url: "http://111.1.5.8:6080/arcgis/rest/services/LH_PS_GWT1/MapServer",
						url: "http://111.1.5.8:6080/arcgis/rest/services/LM_LH_WATER01/MapServer",
						f: "image"
					})
					.addTo(map);
				}
				this.map = map;
			},500);
			
		},
		onConfirm() {
			if (this.distance && this.exceedArea) {
				this.$toast.fail(t("mue.form.gis.rangeOutText"));
				return;
			}

			this.pop = false;
			if (!this.pos) {
				this.$emit("input", null);
				this.$emit("change", null);
				this.getAddress(null);
				return;
			}
			let value;
			if (this.datatype === "string") {
				value = `${ROUND(this.pos.lng)},${ROUND(this.pos.lat)}`;
			} else if (this.datatype === "array") {
				value = [ROUND(this.pos.lng), ROUND(this.pos.lat)];
			} else {
				value = { lat: ROUND(this.pos.lat), lng: ROUND(this.pos.lng) };
			}
			this.$emit("input", value);
			this.$emit("change", value);
			this.getAddress(`${ROUND(this.pos.lng)},${ROUND(this.pos.lat)}`);
		},
		onCancel() {
			this.pop = false;
			if (this.clearable) {
				this.$emit("input", null);
				this.$emit("change", null);
				this.getAddress(null);
			}
		},
		getAddress(pos) {
			//通过经纬度获取地址详细信息
			if (!pos) {
				this.$emit("on-confirm", null);
				return;
			}
			$.ajax({
				type: "get",
				url: "https://restapi.amap.com/v3/geocode/regeo",
				data: {
					location: pos,
					key: "5f222dee3e0f7eee71b86a8eee0e4a54"
				},
				async: true,
				cache: false,
				dataType: "json",
				success: res => {
					if (res.status === "1") {
						this.$emit("on-confirm", res.regeocode);
					}
				},
				error: data => {
					console.log(data);
				}
			});
		}
	},
	created() {},
	mounted() {
		
		if (this.currentLocation && !this.value) {
			this.$native.getLocation({
				cb: pos => {
					this.pos = pos ? { lat: pos.lat, lng: pos.lng } : { lat: 30, lng: 120 };
					this.$nextTick(() => {
						this.onConfirm();
					});
				}
			});
		}
	}
};
</script>
