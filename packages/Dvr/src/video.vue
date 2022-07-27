<template>
    <div class="mue-dvr-video" v-loading.fullscreen="fullLoading">

        <div class="mue-dvr-video__content" :style="{height: height + 'px', width: width + 'px'}">

            <template v-if="!rtsp">
                <van-icon v-if="$listeners.choose" name="add-o" @click.stop="choose"/>
            </template>

            <template v-else>
                <video v-if="version === 'hik-ys' || version === 'hls'" loop muted preload webkit-playsinline="true"
                       playsinline="true" autoplay :src="src"></video>

                <template v-else>
                    <van-icon v-if="!playing" name="play-circle-o" @click.stop="Play"></van-icon>

                    <template v-else>
                        <iframe frameborder="0" scrolling="no" :src="src"></iframe>
                        <i class="mue-dvr-video__masker" @click="Stop">
                            <!--<i class="fa fa-arrows-alt" @click.stop="Full"></i>-->
                            <i class="fa fa-arrows-alt" @click.stop="onVideoOpen"></i>
                        </i>
                    </template>
                </template>

            </template>

        </div>

        <div v-if="!nobar" class="mue-dvr-video__bar" :style="{width: width + 'px', height: nameHigher ? '42px' : '', padding: nameHigher ? '6px 0' : ''}"
             :class="{'mue-dvr-video__bar-selectable': !!$listeners.choose}">
            <span class="mue-dvr-video__bar-name" :style="showSwitchCn ? 'width: calc(100% - 64px)' : ''">
                <i v-if="width >= 300" class="iconfont icon-jiankongshipin"/>
                {{!rtsp ? t('mue.dvr.tooltip') : name}}
            </span>
            <a v-if="showSwitchCn" @click="choose" style="line-height: 30px;">切换视频</a>
            <a v-else class="mue-dvr-video__bar-btn iconfont icon-gengduo1" @click="choose"/>
        </div>

        <van-popup v-model="video.visible" :overlay="false" @closed="onVideoClosed" get-container="body"
                   class="mue-dvr-video__pop" :class="{'rotate-screen': video.rotate}">
            <iframe v-if="video.path" :src="video.path" frameborder="0" scrolling="no"></iframe>
            <a class="fa fa-times" @click="video.visible = false"></a>
        </van-popup>

    </div>
</template>

<script>

    // import uuid from "../../../src/utils/uuid";

    import {localeMixin, t} from "../../../src/locale";
    import {GetQueryString} from "../../../src/lib/common";

    export default {
        name: "MueDvrVideo",
        mixins: [localeMixin],
        components: {},
        props: {
            height: {type: Number, default: 0},
            width: {type: Number, default: 0},
            nobar: {type: Boolean, default: false},
            name: {type: String, default: ""},
            rtsp: {type: String, default: ""},
            type: {type: String, default: ""},
            autoPlay: {type: Boolean, default: false},
            nameHigher: {type: Boolean, default: false},
            showSwitchCn: {type: Boolean, default: false},
            definition: {type: String, default: "ordinary"},
            defaulturl: {type: Boolean, default: false}
        },
        data() {
            return {
                playing: false,
                fullLoading: false,
                video: {
                    visible: false,
                    path: null,
                    rotate: false
                }
            };
        },
        computed: {
            version() {
                if (this.rtsp && this.rtsp.indexOf("open.ys7.com") > -1 && this.$comm.isIos()) {
                    return "hik-ys";
                }
                if (this.rtsp && this.rtsp.endsWith(".m3u8")) {
                    return "hls";
                }
                return {ffmpeg: "img", flv: "flv"}[String(this.type).toLowerCase()] || "h264";
            },
            src() {
                let rtsp = this.rtsp || "";
                if (!this.rtsp) {
                    return "";
                }
                if(this.defaulturl || this.version === "hls" || rtsp.startsWith("http://")) {
                    return rtsp
                }
                if (this.version === "hik-ys") {
                    // 萤石rtmp地址转换成hls地址
                    if (rtsp.startsWith("rtmp://")) {
                        return rtsp.replace("rtmp://rtmp.open.ys7.com", "http://hls01open.ys7.com") + ".m3u8";
                    }
                    return rtsp;
                }
                // 使用ffmpeg thumb地址播放
                let host = this.getVideoHost();
                // 清晰度调整
                let furl = "thumb";
                if (this.definition == "fluent") {
                    furl = "img";
                }else if(this.definition == "zlm"){
                    furl = "zlm";
                }else if(this.definition == "ezviz"){
                    furl = "zlm";
                    this.video.path = `${host}/hdfstatic/${furl}/index.html?stream=${encodeURIComponent(this.rtsp)}`;
                    return
                }
                return `${host}/fstatic/${furl}/index.html?stream=${encodeURIComponent(rtsp)}`;
            }
        },
        watch: {
            rtsp: {
                immediate: true,
                handler() {
                    this.Stop();
                    this.autoPlay && this.$nextTick(() => {
                        this.Play();
                    });
                }
            }
        },
        methods: {
            choose() {
                this.$emit("choose");
            },
            // Full(){
            //     let mid = uuid();
            //     this.fullLoading = true;
            //     // 添加iframe 获得直播源
            //     let host = sessionStorage.getItem("host") || "";
            //     // host = "http://10.18.40.226:7000";
            //     let src = `${host}/fstatic/hls/message.html?stream=${
            //         encodeURIComponent(this.rtsp)}&mid=${mid}`;
            //
            //     let receive = (e) => {
            //         try{
            //             if(typeof e.data !== "string" || !e.data.startsWith("*#LIVE-MSG#*")){
            //                 return;
            //             }
            //             let msg = JSON.parse(e.data.substring(12));
            //             if(msg.mid === mid){
            //
            //                 window.removeEventListener("message", receive, false);
            //                 this.fullLoading = false;
            //
            //                 this.$native.showVideo({
            //                     params: {path: host + msg.url, isTbs: true},
            //                     cb: () => {
            //                         $iframe.remove();
            //                     }
            //                 });
            //             }
            //
            //         } catch(error){
            //             console.error("接收直播消息指令失败", error);
            //         }
            //     };
            //     window.addEventListener("message", receive, false);
            //
            //     let $iframe = $(`<iframe src="${src}"></iframe>`).css({
            //         height: 0, width: 0, display: "none"
            //     }).appendTo(this.$el);
            //
            // },
            onVideoClosed() {
                this.video.path = null;
                this.$native.hideHeader({params: {hide: 0}});  // 显示app标题栏
            },
            onVideoOpen() {
                this.$native.hideHeader({params: {hide: 1}}); // 隐藏app标题栏
                let host = this.getVideoHost();
                this.video.rotate = document.body.clientWidth < document.body.clientHeight;
                this.video.visible = true;
                if(this.defaulturl) {
                    this.video.path = this.src
                }else {
                    // 清晰度调整
                    let furl = "thumb";
                    if (this.definition == "fluent") {
                        furl = "img";
                    }else if(this.definition == "zlm"){
                        furl = "zlm";
                    }else if(this.definition == "ezviz"){
                        furl = "zlm";
                        this.video.path = `${host}/hdfstatic/${furl}/index.html?stream=${encodeURIComponent(this.rtsp)}`;
                        return
                    }
                    this.video.path = `${host}/fstatic/${furl}/index.html?stream=${encodeURIComponent(this.rtsp)}`;
                }
            },
            Stop() {
                this.playing = false;
            },
            Play() {
                this.Stop();

                if (!this.rtsp) {
                    return;
                }
                this.$nextTick(() => {
                    this.playing = true;
                });
            },
            getVideoHost() {
                let location = window.location;
                let host = this.GetHost("host");
                if(host){
                    host = decodeURIComponent(host);
                    sessionStorage.setItem("host", host);
                }
                else{
                    host = sessionStorage.getItem("host") || "";
                }

                if(location.origin.toLowerCase() === "file://"){
                    return host;
                }
                let code = location.port.substring(1);
                let regex = new RegExp(`^${location.origin}/packages/${code}/`, "i");
                if(regex.test(location.href)){
                    return host;
                }
                return "";
            },
            GetHost(n) {
                let fn = (name, type) => {
                    let target;
                    if(type === "hash"){
                        target = window.location.hash.split("?")[1];
                    }
                    else{
                        target = window.location.search.substr(1);
                    }
                    if(!target){
                        return null;
                    }

                    // 针对不同ip和端口视频
                    let regVideo = new RegExp("(^|&)" + 'video' + "=([^&]*)(&|$)");
                    let rVideo = target.match(regVideo);
                    if(rVideo != null){
                        return rVideo[2];
                    }

                    let reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
                    let r = target.match(reg);
                    if(r != null){
                        return r[2];
                    }
                    return null;
                };
                return fn(n) || fn(n, "hash");
            }
        },
        beforeDestroy() {
            this.Stop();
        },
        deactivated() {
            this.video.visible = false;
            this.video.path = null;
            this.Stop();
        },
        activated() {
            if (this.rtsp && this.autoPlay && !this.playing) {
                this.Play();
            }
        }
    };
</script>
