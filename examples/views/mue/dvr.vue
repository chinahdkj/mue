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
                        code: "1", name: "测试摄像头1",
                        rtsp: "rtsp://admin:admin12345@192.168.100.101:554/Streaming/Channels/001"
                    },
                    {
                        code: "2", name: "测试摄像头2",
                        rtsp: "rtsp://admin:admin12345@192.168.100.101:554/Streaming/Channels/001"
                    }
                ]
            };
        },
        methods: {}
    }
</script>