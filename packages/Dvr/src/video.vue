<template>
    <div class="mue-dvr-video">

        <div class="mue-dvr-video__content" :style="{height: height + 'px', width: width + 'px'}">

            <template v-if="!rtsp">
                <van-icon v-if="$listeners.choose" name="add-o" @click.stop="choose"/>
            </template>

            <template v-else-if="!playing">
                <van-icon name="play-circle-o" @click.stop="Play"></van-icon>
            </template>

            <template v-else>
                <video v-if="version === 'hik-ys'" loop muted preload webkit-playsinline="true"
                       playsinline="true" autoplay :src="src"></video>

                <iframe v-else frameborder="0" scrolling="no" :src="src"></iframe>
                <i class="mue-dvr-video__masker" @click="Stop"></i>
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
    export default {
        name: "MueDvrVideo",
        components: {},
        props: {
            height: {type: Number, default: 0},
            width: {type: Number, default: 0},
            nobar: {type: Boolean, default: false},
            name: {type: String, default: ""},
            rtsp: {type: String, default: ""},
            type: {type: String, default: ""},
            autoPlay: {type: Boolean, default: false}
        },
        data(){
            return {
                playing: false
            };
        },
        computed: {
            version(){
                if(this.rtsp && this.rtsp.indexOf("open.ys7.com") > -1){
                    return "hik-ys";
                }
                return {ffmpeg: "img", flv: "flv"}[String(this.type).toLowerCase()] || "h264";
            },
            src(){
                let rtsp = this.rtsp || "";
                if(!this.rtsp){
                    return "";
                }
                if(this.version === "hik-ys"){
                    if(rtsp.startsWith("rtmp://")){
                        return rtsp.replace("rtmp://rtmp.open.ys7.com", "http://hls01open.ys7.com")
                            + ".m3u8";
                    }
                    return rtsp;
                }

                let ver = this.version;
                if(this.$comm.isIos() && ver !== "img"){
                    ver = "hls";
                }

                return (sessionStorage.getItem("host") || "") + "/fstatic/" + ver +
                    "/index.html?stream=" + encodeURIComponent(rtsp);
            }
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
            choose(){
                this.$emit("choose");
            },

            Stop(){
                this.playing = false;
            },
            Play(){
                this.Stop();

                if(!this.rtsp){
                    return;
                }
                this.$nextTick(() => {
                    this.playing = true;
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