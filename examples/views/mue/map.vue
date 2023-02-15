<template>
    <mue-map
        :data="data" 
        @marker-click="markerClick"
        >
        <!-- 搜索和放大缩小之间的插槽 -->
        <div slot="tools" class="mue-map-tool">
            <i class="iconfont icon-qiehuan"></i><span>切换</span>
        </div>
    </mue-map>
</template>

<script>
    export default {
        components: {},
        data(){
            return {
                //传入站点数据
                data: [
                    {
                        id: 1,
                        name: '点1',
                        latlng: [30.746814, 120.755623],
                        iconUrl: 'http://192.168.100.156:8082/unianalysis/upload/0e17d2babdeeb7d398f01e11ae218d6b.png',//图标地址
                        iconSize: [40, 40],//图标宽高，默认[30, 30]
                        iconAnchor: [20, 20]//图标定位，相对于左上角，默认[15, 30]
                    },
                    {
                        id: 2,
                        name: '点2',
                        latlng: [30.756814, 120.755623],
                        iconUrl: 'http://192.168.100.156:8082/unianalysis/upload/0e17d2babdeeb7d398f01e11ae218d6b.png',
                        iconSize: [40, 40],
                        iconAnchor: [20, 20]
                    }
                ]
            };
        },
        methods: {
            //点击站点抛出
            markerClick(data) {
                console.log(data)
            }
        },
        mounted(){
        }
    };
</script>
