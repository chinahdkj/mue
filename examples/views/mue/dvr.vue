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
                        code: "tx", name: "公司",
                        children: [
                            {
                                code: "1", name: "rtsp摄像头", type: "",
                                rtsp: "rtsp://admin:admin12345@192.168.100.101:554/Streaming/Channels/001"
                            }
                        ]
                    },
                    {
                        code: "ys", name: "萤石",
                        children: [
                            {
                                code: "2", name: "萤石摄像头",
                                rtsp: "rtmp://rtmp.open.ys7.com/openlive/4314e2a1dee64f12aa392186f2a9acc7"
                            }
                        ]
                    }
                ]
            };
        },
        methods: {}
    };
</script>
