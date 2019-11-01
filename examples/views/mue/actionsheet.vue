<template>
    <div>
        <van-button size="small" @click="visible.normal = true" type="primary">默认</van-button>
        <mue-actionsheet v-model="visible.normal"
                         :actions="actions"
                         cancel-text="取消"
                         @select="onSelect">
        </mue-actionsheet>
    </div>
</template>

<script>
    export default {
        data() {
            return {
                visible: {
                    normal: false,
                },
                actions: [
                    {name: '设备调试', background: '#9c76dd', icon: 'iconfont icon-youtong'},
                    {name: '音频数据', background: '#42b2fa', icon: 'iconfont icon-yinpin'},
                    {name: '拆装记录', background: '#ff6364', icon: 'iconfont icon-zaixianjilu-xuanze'},
                    {name: '现场照片', background: '#0cc17c', icon: 'iconfont icon-tuxiang'},
                    {name: '拆卸', background: '#4686e8', icon: 'iconfont icon-gongju-1'},
                    {name: '导航', background: '#ffaa01', icon: 'iconfont icon-daohang1'},
                    {name: '人工分析', background: '#26c900', icon: 'iconfont icon-yejibaobiao', disabled: true}
                ]
            }
        },
        methods: {
            onSelect(action, index) {
                console.log('当前选中:', action, index);
                this.$toast(action.name);
                this.visible.normal = false;
            }
        }
    };
</script>

<style lang="less">

</style>
