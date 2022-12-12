<template>
    <div class="mue-draw-layer">
        <div style="width: 100%;height: 100%;">
            <mue-map :options="options" @ready="afterRenderMap" :gwt-option="gwtOption" :offOption="offOption" @center-zoom="centerZoom"/>
        </div>
        <div class="edit-content" v-if="!readonly">
            <van-button class="edit-button" @click="edit" title="编辑">
                <van-icon name="edit" />
            </van-button>
            <van-button class="edit-button" :disabled="!selectlayer" @click="del" title="删除">
                <van-icon name="delete" />
            </van-button>
            <van-button class="edit-button" @click="clear" title="清空">
                <van-icon name="cross" />
            </van-button>
        </div>
    </div>
</template>

<script>
import 'leaflet-editable';
import './leaflet.geometryutil.js';
import 'leaflet-snap';
import MueMap from "./mue-map.vue";
export default {
    name: "mue-draw-layer",
    components:{
       MueMap
    },
    props:{
        value: Array,
        layers: Array,
        type: {
            type: String,
            default: 'polyline'
        },
        options: [Object, Promise],
        gwtOption: Object,
        offOption: { type: Object, default: null },
        readonly: false
    },
    data() {
        return {
            map: null,
            featuresLayer: null,
            selectlayer:'',
            latlngs_input: ''
        }
    },
    methods:{
        onConfirm () {
            if(!this.latlngs_input) return
            this.clear()
            let latlngs = this.latlngs_input.split(',').map(l => l.split(' ').reverse())
            this.draw(this.map, latlngs)
            this.getLatlngs()
        },
        draw (map, latlngs) {
            this.map = map
            window.map = map
            map.editTools = new L.Editable(map)
            this.featuresLayer = map.editTools.featuresLayer || new L.featureGroup().addTo(map)
            if(latlngs && latlngs.length > 0){
                let multi = !L.Polyline._flat(latlngs)

                multi ? latlngs.forEach(latlng => this.addLayer(latlng)) : this.addLayer(latlngs)

                if(!this.readonly) {
                    this.edit()
                }
                map.fitBounds(this.featuresLayer.getLayers()[0].getBounds())
            }
            this.drawSavedLayers()
        },
        addLayer (latlngs) {
            let layer = null
            layer = L[this.type](latlngs, {
                color:'#3388ff',
                weight:3
            }).addTo(this.featuresLayer)
            if(!this.readonly) {
                layer.enableEdit();
            }
        },
        afterRenderMap(map){
            let mapObject = map.mapObject
            this.snap = new L.Handler.MarkerSnap(mapObject);
            mapObject.on('editable:vertex:dragstart', e=> {
                this.snap.watchMarker(e.vertex);
            });
            mapObject.on('editable:vertex:dragend', e=> {
                this.snap.unwatchMarker(e.vertex);
            });
            this.draw(mapObject, this.value)
        },
        drawSavedLayers () {
            this.layers.forEach(layer => {
                if(layer.latlngs && layer.latlngs.toString() == this.value && this.value.toString())  return true

                if(layer.latlngs){
                    let polyline = L[this.type](layer.latlngs, {
                        color: layer.color || '#666666',
                        weight:3
                    }).addTo(this.map)
                    this.snap.addGuideLayer(polyline);
                }
            })
        },
        edit(){
            if(this.map){
                let map = this.map;
                this.featuresLayer = map.editTools.featuresLayer || new L.featureGroup().addTo(map)

                if(this.type == 'rectangle') {
                    if(!this.featuresLayer.getLayers().length) {
                        map.editTools.startRectangle()
                    }
                }else {
                    this.type == 'polyline' ? map.editTools.startPolyline() : map.editTools.startPolygon()
                }

                this.featuresLayer.eachLayer(l => l.on('click',() => this.selectlayer = l))
                map.off('editable:editing')
                map.on('editable:editing', this.getLatlngs)
            }
        },
        del(){
            this.featuresLayer.removeLayer(this.selectlayer)
            this.selectlayer = null
            this.getLatlngs()
        },
        clear(){
            this.featuresLayer && this.featuresLayer.clearLayers()
            this.selectlayer = null
            this.getLatlngs()
        },
        getLatlngs(){
            let latlngs = []
            let layers = this.featuresLayer
            if(this.type == 'rectangle') {
                if(layers) {
                    let bounds = layers.getLayers()[0].getBounds()
                    latlngs = [
                        [bounds._northEast.lat, bounds._northEast.lng],
                        [bounds._southWest.lat, bounds._southWest.lng]
                    ]
                }
            }else {
                layers && layers.eachLayer(l => {
                    let geoJson = l.toGeoJSON()
                    let multi = !L.Polyline._flat(geoJson['geometry']['coordinates'])
                    if(multi){
                        geoJson['geometry']['coordinates'][0].pop()
                        latlngs.push(geoJson['geometry']['coordinates'].map(d => d.map(c => c && c.reverse())))
                    } else {
                        latlngs.push(geoJson['geometry']['coordinates'].map(d => d && d.reverse()))
                    }
                })
            }

            this.featuresLayer.eachLayer(l => l.on('click',() => this.selectlayer = l))
            // latlngs.length == 1 ? this.$emit("input", ...latlngs) : this.$emit("input", latlngs)
            latlngs.length == 1 ? this.$emit("change", ...latlngs) : this.$emit("change", latlngs)
            // latlngs.length == 1 ? this.$emit("change", ...latlngs[0]) : this.$emit("change", ...latlngs)
        },
        centerZoom(center, zoom) {
            this.$emit('center-zoom', center, zoom)
        }

    }
}
</script>

<style scoped lang="less">
.mue-draw-layer{
    width: 100%;
    height: 100%;
    position: relative;
    .edit-content{
        position: absolute;
        top: 0;
        right: 10px;
        z-index: 1000;
        .edit-button{
            width: 32px;
            height: 32px;
            line-height: 32px;
            display: block;
            text-align: center;
            text-decoration: none;
            box-shadow: 0 1px 5px rgba(0,0,0,0.65);
            border-radius: 4px;
            padding: 0;
            margin: 0;
            margin-top: 10px;
        }
    }
}
</style>