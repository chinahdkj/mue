<script>
import { optionsMerger, propsBinder, findRealParent, ImageOverlayMixin } from 'vue2-leaflet'
import { imageOverlay, DomEvent } from 'leaflet'
import L from 'leaflet'
import './leaflet.gwt'

export default {
    name: 'HdGwtOverlay',
    mixins: [ImageOverlayMixin],
    props: {
        url: String,
        proj: String,
        param: String,
        type: String,
        exportType: {
            type: String,
            default: 'export'
        },
        mode: {
            type: String,
            default: 'normal'
        }
    },
    mounted () {
        let _this = this
        _this.parentContainer = findRealParent(_this.$parent)
        let bounds  = _this.bounds || _this.parentContainer.mapObject.getBounds()

        const options = optionsMerger(_this.imageOverlayOptions, this)
        let {
            proj,
            param,
            type,
            exportType,
            mode
        } = _this
        if(mode == 'normal') {
            _this.mapObject = new L.GWT(_this.url, bounds, Object.assign({proj, param, type, exportType}, options), _this.parentContainer.mapObject)
        } else if (mode == 'esri') {
            _this.mapObject = new L.GWTEsri({
                url: _this.url,
                ...Object.assign({proj, param, type, exportType}, options)
            })
        }
        DomEvent.on(_this.mapObject, _this.$listeners)
        propsBinder(this, _this.mapObject, this.$options.props)
        
        _this.parentContainer.addLayer(this, !this.visible)
        _this.$nextTick(() => _this.$emit('ready', _this.mapObject))
    },
    render () {
        return null
    },
    beforeDestroy () {
        this.mapObject && this.mapObject.remove()
    }
}
</script>
