<template>
    <div class="mue-dvr-video">

        <div class="mue-dvr-video__content" :style="{height: height + 'px', width: width + 'px'}"
             v-loading="loading" @click="Stop">

            <template v-if="!rtsp">
                <van-icon v-if="$listeners.choose" name="add-o" @click="choose"/>
            </template>

            <template v-else>
                <template v-if="!client">
                    <van-icon name="play-circle-o" @click.stop="Play"></van-icon>
                </template>

                <img v-if="src || thumb" :src="src || thumb">

            </template>

        </div>

        <div class="mue-dvr-video__bar" :style="{width: width + 'px'}"
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

    const Base64ArrayBuffer = (arrayBuffer) => {
        let base64 = "";
        let encodings = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

        let bytes = new Uint8Array(arrayBuffer);
        let byteLength = bytes.byteLength;
        let byteRemainder = byteLength % 3;
        let mainLength = byteLength - byteRemainder;

        let a, b, c, d;
        let chunk;

        // Main loop deals with bytes in chunks of 3
        for(let i = 0; i < mainLength; i = i + 3){
            // Combine the three bytes into a single integer
            chunk = (bytes[i] << 16) | (bytes[i + 1] << 8) | bytes[i + 2];

            // Use bitmasks to extract 6-bit segments from the triplet
            a = (chunk & 16515072) >> 18; // 16515072 = (2^6 - 1) << 18
            b = (chunk & 258048) >> 12; // 258048   = (2^6 - 1) << 12
            c = (chunk & 4032) >> 6; // 4032     = (2^6 - 1) << 6
            d = chunk & 63;               // 63       = 2^6 - 1

            // Convert the raw binary segments to the appropriate ASCII encoding
            base64 += encodings[a] + encodings[b] + encodings[c] + encodings[d];
        }

        // Deal with the remaining bytes and padding
        if(byteRemainder === 1){
            chunk = bytes[mainLength];

            a = (chunk & 252) >> 2; // 252 = (2^6 - 1) << 2

            // Set the 4 least significant bits to zero
            b = (chunk & 3) << 4; // 3   = 2^2 - 1

            base64 += encodings[a] + encodings[b] + '==';
        }
        else if(byteRemainder === 2){
            chunk = (bytes[mainLength] << 8) | bytes[mainLength + 1];

            a = (chunk & 64512) >> 10; // 64512 = (2^6 - 1) << 10
            b = (chunk & 1008) >> 4; // 1008  = (2^6 - 1) << 4

            // Set the 2 least significant bits to zero
            c = (chunk & 15) << 2; // 15    = 2^4 - 1

            base64 += encodings[a] + encodings[b] + encodings[c] + '=';
        }

        return base64;
    };

    import socketIo from "socket.io-client"

    export default {
        name: "MueDvrVideo",
        components: {},
        props: {
            height: {type: Number, default: 180},
            width: {type: Number, default: 240},
            thumb: {type: String, default: ""},
            name: {type: String, default: ""},
            rtsp: {type: String, default: ""},
            autoPlay: {type: Boolean, default: false}
        },
        data(){
            return {
                client: null,
                src: ""
            };
        },
        computed: {
            loading(){
                return this.client && !this.src;
            }
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
            }
        },
        methods: {
            choose(){
                this.$emit("choose");
            },
            Stop(){
                if(this.client){
                    this.client.close();
                    this.client = null;
                }
            },
            Play(){
                if(!this.rtsp){
                    return;
                }

                this.client = socketIo("/ffmpeg", {query: {stream: this.rtsp}});

                this.client.on("DATA", (data) => {
                    let bytes = new Uint8Array(data);
                    this.src = `data:image/jpeg;base64,${Base64ArrayBuffer(bytes)}`;
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