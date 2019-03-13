<template>
    <div class="mue-dvr-video">

        <div class="mue-dvr-video__content" :style="{height: height + 'px', width: width + 'px'}"
             v-loading="client && loading" @click="Stop">

            <template v-if="needUpdate">
                <span>视频服务需要升级，请联系服务器管理员！</span>
            </template>

            <template v-else-if="!rtsp">
                <van-icon v-if="$listeners.choose" name="add-o" @click="choose"/>
            </template>

            <template v-else>
                <template v-if="!client">
                    <van-icon name="play-circle-o" @click.stop="Play"></van-icon>
                    <img :src="getThumb()">
                </template>

                <canvas v-if="client" ref="canvas"></canvas>
            </template>

        </div>

        <div v-if="!nobar" class="mue-dvr-video__bar" :style="{width: width + 'px'}"
             :class="{'mue-dvr-video__bar-selectable': !!$listeners.choose}">
            <span class="mue-dvr-video__bar-name">
                <i v-if="width >= 300" class="iconfont icon-jiankongshipin"/>
                {{!rtsp ? '请添加视频' : name}}
            </span>
            <a class="mue-dvr-video__bar-btn iconfont icon-gengduo1" @click="choose"/>
        </div>

    </div>
</template>

<script>

    import socketIo from "socket.io-client"
    import uuid from "../../../src/utils/uuid";

    export default {
        name: "MueDvrVideo",
        components: {},
        props: {
            height: {type: Number, default: 0},
            width: {type: Number, default: 0},
            nobar: {type: Boolean, default: false},
            name: {type: String, default: ""},
            rtsp: {type: String, default: ""},
            autoPlay: {type: Boolean, default: false}
        },
        data(){
            return {
                client: null,
                needUpdate: false,
                loading: false,
                src: ""
            };
        },
        watch: {
            rtsp: {
                immediate: true,
                handler(){
                    this.Stop();
                    this.src = "";
                    this.autoPlay && this.$nextTick(() => {
                        this.Play();
                    });
                }
            },
            src(v, ov){
                if(v && !ov){
                    this.draw();
                }
            },
        },
        methods: {
            getThumb(){
                let host = sessionStorage.getItem("host") || "";
                return `${host}/socket.io.thumb?p=${this.rtsp}&t=${uuid(8)}`;
            },
            choose(){
                this.$emit("choose");
            },
            draw(thumb){
                if(!this.$refs.canvas){
                    return;
                }
                let img = new Image();
                img.onload = () => {
                    try{
                        this.$refs.canvas.height = this.height;
                        this.$refs.canvas.width = this.width;
                        let ctx = this.$refs.canvas.getContext("2d");
                        ctx.drawImage(img, 0, 0, this.width, this.height);
                        !thumb && requestAnimationFrame(() => {
                            this.draw();
                        });
                    } catch(e){

                    }
                };
                img.crossOrigin = "anonymous";
                img.src = thumb || this.src;
            },

            Stop(){
                if(this.client){
                    this.client.close();
                    this.client = null;
                    this.loading = false;
                    this.src = "";
                }
            },
            Play(){
                this.Stop();

                if(!this.rtsp){
                    return;
                }

                this.needUpdate = false;
                this.loading = true;
                let previous = 0;

                this.client = socketIo(`${sessionStorage.getItem("host") || ""}/ffmpeg`, {
                    query: {stream: this.rtsp, width: this.width, height: this.height}
                });

                this.client.on("DATA", (data) => {
                    let index, base64;
                    try{
                        let temp = JSON.parse(data);
                        index = temp.index;
                        base64 = temp.base64;
                        if(!base64){
                            this.needUpdate = true;
                        }
                    } catch(e){
                        this.needUpdate = true;
                    }

                    if(this.needUpdate){
                        this.Stop();
                        return;
                    }

                    if(index <= previous){
                        return;
                    }
                    previous = index;
                    this.loading = false;
                    this.src = base64;
                });

                this.client.on("ERROR", (data) => {
                    console.error(data);
                    this.Stop();
                });

                this.$nextTick(() => {
                    this.draw(this.getThumb());
                });

            }
        },
        beforeDestroy(){
            this.Stop();
        },
        deactivated(){
            this.Stop();
        }
    }
</script>