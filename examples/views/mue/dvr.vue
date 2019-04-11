<template>
    <mue-dvr :cameras="cameras" selectable></mue-dvr>
</template>

<script>
    export default {
        components: {},
        data(){
            return {
                cameras: [
                    {
                        code: "1", name: "rtsp摄像头",
                        rtsp: "rtsp://admin:admin12345@192.168.100.101:554/Streaming/Channels/001"
                    },
                    {
                        code: "2", name: "萤石摄像头",
                        rtsp: "rtmp://rtmp.open.ys7.com/openlive/4816b8e1421340898d01d1272a9f54fd"
                    }
                ]
            };
        },
        methods: {}
    }
</script>