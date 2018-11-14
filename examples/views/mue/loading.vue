<template>
    <div style="height: 100%;">
        <div style="height: 200px; background: yellow" v-loading="true">
        </div>

        <van-button @click="Loading" type="primary">服务模式</van-button>
    </div>
</template>

<script>
    export default {
        name: "loading",
        components: {},
        data(){
            return {};
        },
        methods: {
            Loading(){
                let loading = this.$loading();
                setTimeout(() => {
                    loading.close();
                }, 5000);
            }
        }
    }
</script>