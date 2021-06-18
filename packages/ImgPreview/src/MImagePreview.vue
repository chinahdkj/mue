<template>
    <div class="m-image-preview-wrap">
        <div class="zhishqi-ctr"><span>{{`${index + 1}/${images.length}`}}</span></div>
        <van-popup v-model="isShow" @closed="closed">
            <div class="m-image-preview-ctr" :style="{width:width+'px',height:height+'px'}" v-if="isShow && isRotate">
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
                                crossOrigin="anonymous"
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
            action:'pen',
            loading:false,
            isRotate:false
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
    watch: {
        images(n) {
            this.isRotate = false
            this.$nextTick(() => {
                this.isRotate = true
            })
        }
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
            this.$nextTick(async () => {
                this.canvas = new fabric.Canvas('canvas',{
                    isDrawingMode:true,
                    skipTargetFind: true,
                    selectable: false,
                    selection: false,
                }) 

                this.canvas.freeDrawingBrush.color = this.color
                this.canvas.freeDrawingBrush.width = 2
                this.canvas.width = this.width 
                const imgInstance = await this.addOriginImage(this.canvas)
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
            return new Promise((resolve) => {
                 const image = new Image()
                image.setAttribute('crossOrigin', 'anonymous')
                image.onload =() => {
                    const imgInstance = new fabric.Image(image, {
                        left: 0,
                        top: 0,
                        angle: 0,
                    })
                    imgInstance.scaleToWidth(this.width)
                    imgInstance.scaleToHeight(this.height)
                    canvas.add(imgInstance)
                    resolve(imgInstance)
                }
                image.src = this.$refs.img[0].src
            })
           
            
        },
        drawing() {
            let index = this.index
            switch (this.action) {
                case 'prev':
                    if(index === 0) {
                        index = this.images.length - 1
                    }else {
                        index -= 1
                    }
                    this.$refs.swiper.swipeTo(index)
                    this.action = 'pen'
                break
                case 'next':
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
                case 'left':
                    
                break
            }
        },
        handleActions(action) {
            if (this.loading) return;
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
        getBase64() {
            if(this.canvas){
                try{
                    return this.canvas.toDataURL()
                }catch(err) {
                    console.log(err)
                }
            }
        },
        handleImgLoad() {
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