<template>
    <div class="m-image-preview-wrap">
        <div class="zhishqi-ctr"><span>{{`${index + 1}/${images.length}`}}</span></div>
        <van-popup v-model="isShow" @closed="closed">
            <div class="m-image-preview-ctr" :style="{width:width+'px',height:height+'px'}">
                <van-swipe ref="swiper" @change="onChange" :show-indicators="false" :initial-swipe="startPosition" :touchable="false">
                    <van-swipe-item v-for="(item, key) in images" :key="key">
                        <canvas 
                            v-if="key == index"
                            id="canvas"
                            :width='width' 
                            :height='height' 
                            class="swiper-img"></canvas>
                        <div class="img-box" v-if="key == index">
                            <img
                                class="swiper-img" 
                                :src="item" 
                                data-id="canvas"
                                @load="handleImgLoad"
                                 :style="{width:width+'px'}"
                                ref="img">
                        </div>
                        
                    </van-swipe-item>
                </van-swipe>
            </div>
        </van-popup>
    </div>
</template>

<script>
import { fabric } from 'fabric'
export default {
    data() {
        return {
            width:window.innerWidth,
            index:0,
            canvas: '',
            height: '',
            color:"#E34F51",
            textbox:null,
            mouseFrom:{},
            mouseTo:{},
            doDrawing:false,
            moveCount:1,
            action:'pen'
        }
    },
    props: {
        images: {
            type: Array,
            default() {
                return []
            }
        },
        startPosition: {
            type: Number,
            default: 0
        },
        loop: {
            type: Boolean,
            default: true
        },
        value: {
            type: Boolean,
            default: false
        },
    },
    computed: {
        isShow: {
            get() {
                if(this.value){
                    this.index = this.startPosition
                }
                return this.value
            },
            set(nv) {
                this.$emit('update:visible', nv)
                return nv
            }
        }
    },
    methods: {
        initCanvas() {
            this.height = this.$refs.img[0].offsetHeight
            this.$nextTick(() => {
                this.canvas = new fabric.Canvas('canvas',{
                    isDrawingMode:true,
                    skipTargetFind: true,
                    selectable: false,
                    selection: false
                }) 

                this.canvas.freeDrawingBrush.color = this.color
                this.canvas.freeDrawingBrush.width = 2
                this.canvas.width = this.width 
                this.canvas.height = 300
                const imgInstance = this.addOriginImage(this.canvas)
                imgInstance.set('selectable', false)
                this.$nextTick(() => {
                    this.textbox = null
                    if(this.action === 'text') {
                        this.handleActions('text')
                    }
                    if(this.action === 'pen') {
                        this.handleActions('pen')
                    }
                })
                this.canvas.on("mouse:down", (options) => {
                    let xy = this.transformMouse(options.pointer.x, options.pointer.y)
                    this.mouseFrom.x = xy.x
                    this.mouseFrom.y = xy.y
                    this.doDrawing = true
                    if(this.action === 'text') {
                        this.drawing()
                    }
                })
                this.canvas.on("mouse:up", (options) =>{
                    let xy = this.transformMouse(options.pointer.x, options.pointer.y)
                    this.mouseTo.x = xy.x
                    this.mouseTo.y = xy.y
                    this.moveCount = 1
                    this.doDrawing = false
                })
                this.canvas.on("mouse:move", (options) => {
                    if (this.moveCount % 2 && !this.doDrawing) {
                        return
                    }
                    this.moveCount++
                    let xy = this.transformMouse(options.pointer.x, options.pointer.y)
                    this.mouseTo.x = xy.x
                    this.mouseTo.y = xy.y
                    this.drawing()
                })
            })
        },
        addOriginImage (canvas) {
            const imgInstance = new fabric.Image(this.$refs.img[0], {
                left: 0,
                top: 0,
                angle: 0
            })
            imgInstance.scaleToWidth(this.width)
            imgInstance.scaleToHeight(this.height)
            canvas.add(imgInstance)
            return imgInstance
        },
        drawing() {
            let index = this.index
            switch (this.action) {
                case 'left':
                    if(index === 0) {
                        index = this.images.length - 1
                    }else {
                        index -= 1
                    }
                    this.$refs.swiper.swipeTo(index)
                    this.action = 'pen'
                break
                case 'right':
                    if(index === this.images.length) {
                        index = 0
                    }else {
                        index += 1
                    }
                    this.action = 'pen'
                    this.$refs.swiper.swipeTo(index)
                break
                case 'save':
                    this.save()
                break
                case 'pen':
                    this.canvas.isDrawingMode = true
                break
                case 'text':
                    this.canvas.isDrawingMode = false
                    this.textbox = new fabric.Textbox("", {
                        left: this.mouseFrom.x,
                        top: this.mouseFrom.y,
                        width: 150,
                        fontSize: 18,
                        borderColor: "#2c2c2c",
                        fill: this.color,
                        hasControls: false
                    })
                    this.canvas.add(this.textbox)
                    this.textbox.enterEditing()
                    this.textbox.hiddenTextarea.focus()
                break
            }
        },
        handleActions(action) {
            // if (this.loading) return;
            this.action = action
            this.canvas.isDrawingMode = false
            if (this.textbox) {
                this.textbox.exitEditing()
                this.textbox = null;
            }
            if (action !== "pen") {
                this.canvas.skipTargetFind = true
                this.canvas.selection = false
            }
            this.drawing(action)
        },
        save() {
            let base64 = this.canvas.toDataURL()
            this.$emit('save',{base64,index:this.index})
        },
        dataURLtoBlob (dataurl) {
            let arr = dataurl.split(',')
            let mime = arr[0].match(/:(.*?);/)[1]
            let bstr = atob(arr[1])
            let n = bstr.length
            let u8arr = new Uint8Array(n)
            while (n--) {
                u8arr[n] = bstr.charCodeAt(n)
            }
            return new Blob([u8arr], { type: mime })
        },
        blobToFile (theBlob, fileName) {
            theBlob.lastModifiedDate = new Date()
            theBlob.name = fileName
            return theBlob
        },
        handleImgLoad() {
            // this.loading = false;
            
            this.$nextTick(() => {
                this.initCanvas()
            })
        },
        transformMouse(mouseX, mouseY) {
            return { x: mouseX , y: mouseY };
        },
        onChange(index) {
            if(this.canvas){
                this.canvas.dispose()
            }
            this.$emit('change', index)
            this.index = index
        },
        handleBindId(key) {
            return `canvas${key}`
        },
        closed() {
            if(this.canvas){
                this.canvas.dispose()
            }
        }
    }
}
</script>

<style lang="less" scoped>
    .zhishqi-ctr{
        position: fixed;
        top:6px;
        left: 0;
        right: 0;
        text-align: center;
        color: #fff;
        font-size: 14px;
        letter-spacing: 2px;
        z-index: 9999;
    }
    .m-image-preview-ctr{
        width: 100%;
        .van-swipe{
            width: 100%;
            height: 100%;
            .img-box{
                width: 0;
                height: 0;
                overflow: hidden;
            }
        }
    }
</style>