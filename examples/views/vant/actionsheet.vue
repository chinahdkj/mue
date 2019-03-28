<template>
    <div>
        <van-button size="large" @click="visible = true" type="primary">打开</van-button>

        <van-actionsheet v-model="visible" :actions="actions" cancel-text="取消" @select="onSelect"/>
    </div>
</template>

<script>
export default {
    components: {},
    data() {
        return {
            visible: true,
            actions: [
                { name: "操作1" },
                { name: "操作2", subname: "详细" },
                { loading: true, name: "加载中", subname: "加载中" },
                { name: "禁用", disabled: true, subname: "禁用" }
            ]
        };
    },
    methods: {
        onSelect(item, index) {
            console.info(item, index);
        }
    }
};
</script>

<style>
</style>
