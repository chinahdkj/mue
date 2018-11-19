<template>
    <div id="app">
        <header>
            <van-nav-bar :title="title" left-text="菜单" @click-left="pop=true" fixed/>
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
                if(!p){
                    return;
                }
                if(!n){
                    window.open(p);
                    return;
                }
                this.title = n;
                this.$router.push(p);
            }
        },
        components: {vmenu}
    }
</script>
