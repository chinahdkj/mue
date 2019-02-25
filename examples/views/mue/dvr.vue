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
                        thumb: "https://timgsa.baidu.com/timg?image&quality=80&size=b9999_10000&sec=1551256806&di=ec68b6eb21b7756be9ef60a2b73f86d8&imgtype=jpg&er=1&src=http%3A%2F%2Fimgsrc.baidu.com%2Fimgad%2Fpic%2Fitem%2Fd50735fae6cd7b89d27c81a7052442a7d9330e85.jpg",
                        rtsp: "rtsp://admin:admin12345@192.168.100.101:554/Streaming/Channels/001"
                    },
                    {
                        code: "2", name: "测试摄像头2",
                        thumb: "https://timgsa.baidu.com/timg?image&quality=80&size=b10000_10000&sec=1550652020&di=3713f95e3963321b024a4138abf8219d&src=http://imgsrc.baidu.com/imgad/pic/item/e61190ef76c6a7ef4361690ef6faaf51f3de6657.jpg",
                        rtsp: "rtsp://admin:admin12345@192.168.100.101:554/Streaming/Channels/001"
                    }
                ]
            };
        },
        methods: {}
    }
</script>