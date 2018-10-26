<template>
    <div id="app">
        <header>
            <van-nav-bar :title="title" left-text="菜单" @click-left="pop=true"/>
        </header>
        <section>
            <router-view/>
        </section>
        <van-popup class="menubox" v-model="pop" position="left" :lazy-render="false">
            <vmenu @open="onOpen"/>
        </van-popup>
    </div>
</template>

<script>
    import vmenu from './views/menu';

    export default {
        name: 'App',
        data(){
            return {pop: false, title: "CUE"};
        },
        methods: {
            onOpen(n, p){
                this.pop = false;
                this.title = n;
                this.$router.push(p);
            }
        },
        components: {vmenu}
    }
</script>

<style lang="less">
    html {
        background: #f3f3f3;
    }
    header {
        height: 46px;
    }
    section {
        height: calc(~"100% - 46px");
    }
    .menubox {
        height: 100%;
        width: 80%;
    }
    .mue-panel {
        margin-bottom: 10px;
    }
</style>
