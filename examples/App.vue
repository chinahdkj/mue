<template>
    <div id="app">
        <header>
            <van-nav-bar :title="title" left-text="菜单" @click-left="pop=true" fixed
                         :right-text="source ? '示例' : ''" @click-right="openSouce"/>
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
            return {pop: false};
        },
        computed: {
            title(){
                let ps = (this.$route.path || "").split("/");
                ps.reverse();
                return ps[0] || "MUE";
            },
            source(){
                let p = (this.$route.path || "").substring(1);
                return !p ? "" :
                       `https://hub.hddznet.com/uniplatform/mue/src/master/examples/views/${p}.vue`;
            },
            theme(){
                return this.$route.query.theme || "";
            }
        },
        methods: {
            onOpen(p, _blank){
                this.pop = false;
                if(!p){
                    return;
                }
                if(_blank){
                    window.open(p);
                    return;
                }

                this.$router.push({path: p, query: {theme: this.theme}});
            },
            openSouce(){
                this.source && window.open(this.source);
            }
        },
        components: {vmenu}
    }
</script>
