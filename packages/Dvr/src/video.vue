<template>
    <div class="mue-dvr-video">

        <div class="mue-dvr-video__content" :style="{height: height + 'px', width: width + 'px'}"
             v-loading="client && loading" @click="Stop">

            <template v-if="!rtsp">
                <van-icon v-if="$listeners.choose" name="add-o" @click.stop="choose"/>
            </template>

            <template v-else-if="version === 'hik-ys'">
                <van-icon v-if="!client" name="play-circle-o" @click.stop="Play"></van-icon>
                <video v-show="client" ref="ys_video" loop muted preload webkit-playsinline="true"
                       playsinline="true" autoplay></video>
            </template>

            <template v-else>
                <van-icon v-if="!client" name="play-circle-o" @click.stop="Play"></van-icon>
                <canvas ref="canvas"></canvas>
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
                loading: false,
            };
        },
        computed: {
            version(){
                if(this.rtsp && this.rtsp.indexOf("open.ys7.com") > -1){
                    return "hik-ys";
                }
                else{
                    return "ffmpeg";
                }
            },
        },
        watch: {
            rtsp: {
                immediate: true,
                handler(){
                    this.Stop();
                    this.autoPlay && this.$nextTick(() => {
                        this.Play();
                    });
                }
            }
        },
        methods: {
            getThumb(){
                let host = sessionStorage.getItem("host") || "";
                return `${host}/socket.io.thumb?p=${this.rtsp}&t=${uuid(8)}`;
            },
            choose(){
                this.$emit("choose");
            },

            Stop(){
                if(!this.client){
                    return;
                }

                if(this.version === "hik-ys"){
                    this.client.pause();
                    this.client.src = "";
                }
                else{
                    this.client.close();
                }
                this.client = null;
                this.loading = false;
            },
            Play(){
                this.Stop();

                if(!this.rtsp){
                    return;
                }

                if(this.version === "hik-ys"){
                    let src = this.rtsp;
                    if(src.startsWith("rtmp://")){
                        src = src.replace(
                            "rtmp://rtmp.open.ys7.com", "http://hls01open.ys7.com") + ".m3u8";
                    }

                    this.$refs.ys_video.onplay = () => {
                        this.loading = false;
                    };

                    this.$refs.ys_video.src = src;

                    this.client = this.$refs.ys_video;
                    this.loading = true;
                    return;
                }


                this.loading = true;
                let needUpdate = false;
                let previous = 0;

                let draw = (loop = false) => {
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
                        } catch(e){

                        }
                        loop && draw();
                    };
                    img.crossOrigin = "anonymous";
                    img.src = src;
                };
                let src = this.getThumb();

                this.client = socketIo(`${sessionStorage.getItem("host") || ""}/ffmpeg`, {
                    query: {stream: this.rtsp, width: this.width, height: this.height}
                });

                this.client.on("DATA", (data) => {
                    this.loading = false;
                    let index, base64;
                    try{
                        let temp = JSON.parse(data);
                        index = temp.index;
                        base64 = temp.base64;
                        if(!base64){
                            needUpdate = true;
                        }
                    } catch(e){
                        needUpdate = true;
                    }

                    if(needUpdate){
                        let context = this.$refs.canvas.getContext("2d");
                        context.font = "14px normal 黑体";
                        context.fillStyle = "#fff";
                        context.textAlign = "center";
                        context.textBaseline = "middle";
                        context.fillText("视频服务需要升级", this.width / 2, 10);

                        this.Stop();
                        return;
                    }
                    if(index <= previous){
                        return;
                    }
                    previous = index;
                    src = base64;
                    draw(true);
                });

                this.client.on("ERROR", (data) => {
                    console.error(data);
                    this.Stop();
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