
const proj4 = require('proj4')
import coordtransform from 'coordtransform'
import {DynamicMapLayer} from 'esri-leaflet'
import L from 'leaflet'

L.GWT = L.ImageOverlay.extend({
    initialize: function (url, bounds, options, map) {
        this._bounds = L.latLngBounds(bounds)
        this.map = map
        L.setOptions(this, options)
        this.server_path = url
        this._url = this._getUrl(url, bounds)
        let self = this
        map.on("moveend", function () {
            self.render()
        })
        this.on("load", function () {
            self.setBounds(map.getBounds())
        })
    },
    _getUrl: function (path, bounds) {
        let northEast, southWest
        if (this.options.type == 'wgsTogd') {
            northEast = coordtransform.gcj02towgs84(bounds._northEast.lng, bounds._northEast.lat)
            southWest = coordtransform.gcj02towgs84(bounds._southWest.lng, bounds._southWest.lat)
        } else {
            northEast = [bounds._northEast.lng, bounds._northEast.lat]
            southWest = [bounds._southWest.lng, bounds._southWest.lat]
        }
        if(this.options.proj){
            northEast = proj4.default(this.options.proj).forward(northEast)
            southWest = proj4.default(this.options.proj).forward(southWest)
        }
        let ll = southWest.concat(northEast)

        let size = this.map.getSize()
        let str = size.x + ',' + size.y

        const getParam = (param) => {
            let _param = this.options.param.split('&').find(p => p.includes(param))
            if(_param) {
                return _param.split('=')[1]
            }
        }
        
        let format = getParam('format') || 'png8'

        // exportTYpe: export | DynamicAnnotationMapExport | exportGCJ02 ...
        return `${path}/${this.options.exportType || 'export'}?bbox=${ll.join(',')}&size=${str}&dpi=96&format=${format}&transparent=true&f=image&${this.options.param || ''}`
    },
    render: function () {
        let bounds = this.map.getBounds()
        let url = this._getUrl(this.server_path, bounds)
        this.setUrl(url)
    }
})

L.GWTEsri = DynamicMapLayer.extend({
    _buildExportParams: function () {
        let bounds = this._map.getBounds(), n, s
        if (this.options.type == 'wgsTogd') {
            // 坐标转换
            n = coordtransform.gcj02towgs84(bounds._northEast.lng, bounds._northEast.lat)
            s = coordtransform.gcj02towgs84(bounds._southWest.lng, bounds._southWest.lat)
        } else {
            n = [bounds._northEast.lng, bounds._northEast.lat]
            s = [bounds._southWest.lng, bounds._southWest.lat]
        }

        // let crs = new L.Proj.CRS('EPSG:3857', '+proj=tmerc +lat_0=0 +lon_0=114 +k=1 +x_0=500000 +y_0=0 +ellps=krass +towgs84=15.8,-154.4,-82.3,0,0,0,0 +units=m +no_defs')
        // let ne = crs.project({lat: n[1], lng: n[0]})
        // let sw = crs.project({lat: s[1], lng: s[0]})

        let ne = this._map.options.crs.project({lat: n[1], lng: n[0]})
        let sw = this._map.options.crs.project({lat: s[1], lng: s[0]})
    
        let sr = parseInt(this._map.options.crs.code.split(':')[1], 10)
        const getParam = (param) => {
            let _param = this.options.param.split('&').find(p => p.includes(param))
            if(_param) {
                return _param.split('=')[1]
            }
        }
        let layers = getParam('layers'),
            format = getParam('format')
        let params = {
            bbox: [sw.x, sw.y, ne.x, ne.y].join(','),
            size: this._calculateImageSize(),
            format: format || this.options.format,
            transparent: this.options.transparent,
            bboxSR: sr,
            imageSR: sr,
            f: 'image',
            layers,
        }
        this.options.f = 'image'
        return params
    }
})