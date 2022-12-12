<template>
    <l-map v-if="isLoad" class="mue-map" :zoom="mapOpitons.level" :crs="mapOpitons.crs"
           :min-zoom="mapOpitons.minZoom" :max-zoom="mapOpitons.maxZoom"
           :options="{...{attributionControl: false}, ...options}"
           @moveend="moveend"
           :center="mapOpitons.center" ref="mueMap">
        <template v-if="layers.show">
            <l-tile-layer v-if="offOption && offOption.service" :url="offOption.service" :options="offOption.options || {}" />
            <template v-else>
                <l-layer-group v-for="item in layers.items"
                               :visible="item.visible"
                               :name="item.name"
                               :key="item.name"
                               layer-type="base">
                    <l-tile-layer
                        :url="item.url"
                        :options="item.options"/>
                    <l-tile-layer v-if="item.Annotion"
                                  :url="item.Annotion"
                                  :options="item.options"/>
                </l-layer-group>
            </template>
        </template>
        <gwt
            v-if="gwtOption"
            :mode="gwtOption.mode"
            :url="gwtOption.url"
            :proj="gwtOption.proj"
            :param="gwtOption.param"
            :type="gwtOption.type"
            :exportType="gwtOption.exportType">
        </gwt>
        <slot/>
    </l-map>
</template>

<script>
import proj4 from 'proj4';
import { setOptions } from 'leaflet';
import 'proj4leaflet';
import 'leaflet.chinatmsproviders';
import gwt from './gwtOverlay/gwt'
import { LMap, LTileLayer, LLayerGroup } from 'vue2-leaflet';
const transToPromise = origin => {
    if(origin instanceof Promise){
        return origin
    }else if(typeof origin == 'object'){
        return Promise.resolve(JSON.parse(JSON.stringify(origin)))
    }
}
export default {
    name: "mueMap",
    components: {gwt, LMap, LTileLayer, LLayerGroup},
    props: ['options', 'gwtOption', 'offOption'],
    data () {
        return {
            mapOpitons: null,
            layers: {
                show: false,
                items: []
            },
            isLoad: false,
            isNormal: true
        }
    },
    methods:{
        _initMap () {
            if(this.options) {
                this.layers.show = false
                if(this.$refs['mueMap']) {
                    let map = this.$refs['mueMap'].mapObject
                    map.stop()
                }
                transToPromise(this.options).then(data => {
                    if(data) {
                        this.mapOpitons = data.gis
                        this.mapOpitons.level = data.gis.level || data.gis.zoom || 8
                        this.mapOpitons.center = data.gis.center || null
                        this._initBaseLayers(data.gis.map || '0')
                    }
                })
            }
        },
        _initBaseLayers (mapType) {
            let norma = {}, normala = {}, imgm = {}, imga = {},
                maxZoom = this.mapOpitons.maxZoom || 18,
                minZoom = this.mapOpitons.minZoom || 0,
                subdomains = [1, 2, 3, 4], crs = null, center = this.mapOpitons.center

            switch (mapType) {
                case 'amap':
                case '0':
                    norma = L.tileLayer.chinaProvider('GaoDe.Normal.Map', { maxZoom, minZoom })
                    imgm = L.tileLayer.chinaProvider('GaoDe.Satellite.Map', { maxZoom, minZoom })
                    imga = L.tileLayer.chinaProvider('GaoDe.Satellite.Annotion', { maxZoom, minZoom })
                    break
                case '1':
                    norma = L.tileLayer.chinaProvider('TianDiTu.Normal.Map', { subdomains, minZoom, maxZoom })
                    normala = L.tileLayer.chinaProvider('TianDiTu.Normal.Annotion', { subdomains, minZoom, maxZoom })
                    imgm = L.tileLayer.chinaProvider('TianDiTu.Satellite.Map', { subdomains, minZoom, maxZoom })
                    imga = L.tileLayer.chinaProvider('TianDiTu.Satellite.Annotion', { subdomains, minZoom, maxZoom })
                    break
                case '2':
                    let mapUrl = this.mapOpitons.off, sateUrl = this.mapOpitons.sate
                    if(mapUrl){
                        norma = L.tileLayer(`${mapUrl}/{z}/{x}/{y}.png`, { subdomains, minZoom, maxZoom })
                    }
                    if(sateUrl){
                        imgm = L.tileLayer(`${sateUrl}/{z}/{x}/{y}.png`, { subdomains, minZoom, maxZoom })
                    }
                    break
                case '3':
                    norma = L.tileLayer.chinaProvider('Google.Normal.Map', { maxZoom, minZoom })
                    imgm = L.tileLayer.chinaProvider('Google.Satellite.Map', { maxZoom, minZoom })
                    break
                case 'arcgis':
                    if(this.mapOpitons.service){
                        if(this.mapOpitons.proj4){
                            norma = L.tileLayer(`${this.mapOpitons.service}/tile/{z}/{y}/{x}`, { subdomains, minZoom, maxZoom })

                            crs = new L.Proj.CRS('EPSG:2435', this.mapOpitons.proj4, {
                                origin: this.mapOpitons.origin ? this.mapOpitons.origin.split(',').map(Number) : [],
                                resolutions: this.mapOpitons.resolution ? this.mapOpitons.resolution.split(',').map(Number) : []
                            })
                            center = this.getCenterByRegion(this.mapOpitons.region, this.mapOpitons.proj4)
                        } else {
                            norma = tiledMapLayer({url: this.mapOpitons.service})
                            center = this.getCenterByRegion(this.mapOpitons.region)
                        }
                    }
                    break
                default:
                    break
            }
            this.layers.items = [
                {
                    name: '地图',
                    visible: this.isNormal,
                    options: norma.options,
                    url: norma._url,
                    Annotion: normala._url
                }, {
                    name: '影像',
                    visible: !this.isNormal,
                    options: imgm.options,
                    url: imgm._url,
                    Annotion: imga._url
                }
            ]

            if(this.$refs['mueMap']) {
                let map = this.$refs['mueMap'].mapObject
                map.options.crs = crs || L.CRS.EPSG3857
                setOptions(map, {
                    minZoom: this.mapOpitons.minZoom,
                    maxZoom: this.mapOpitons.maxZoom
                })
                setTimeout(() => {
                    map.setView(this.getCenter(center).reverse(), this.mapOpitons._level)
                }, 100);
            } else {
                this.mapOpitons.crs = crs
                this.$set(this.mapOpitons, 'center', this.getCenter(center).reverse())
            }
            this.$nextTick(() => {
                this.isLoad = true
                this.layers.show = true
            })
        },
        getCenterByRegion (region, proj) {
            if(!region) return null
            let _region = region.split(',').map(Number)
            let _center = [(_region[0] + _region[2])/2, (_region[1] + _region[3])/2]
            return proj ? proj4(proj).inverse(_center) : _center
        },
        getCenter (center) {
            if(this.mapOpitons.lat && this.mapOpitons.lng) {
                let proj = this.mapOpitons.proj4
                let _center = [+this.mapOpitons.lng, +this.mapOpitons.lat]
                return proj ? proj4(proj).inverse(_center) : _center
            }
            if(!center) {
                return [120.750865, 30.762653]
            }
            return center
        },
        moveend(e) {

            this.$emit('center-zoom', e.target.getCenter(), e.target.getZoom())
        }
    },
    beforeDestroy () {
        this.$emit('before-destroy', this.mueMap)
    },
    watch: {
        isLoad (val) {
            if(val){
                this.$nextTick(() => {
                    this.$emit('ready', this.mueMap)
                })
            }
        },
        options: {
            deep: true,
            handler(v, ov) {
                if(JSON.stringify(v) === JSON.stringify(ov)) {
                    return
                }
                this._initMap()
            },
            immediate: true
        }
    },
    computed: {
        mueMap () {
            return this.$refs['mueMap']
        }
    }

}
</script>

<style scoped>

</style>