<template>
    <img v-bind="$attrs" :src="path"/>
</template>

<script>
    export default {
        name: "MueImage",
        inheritAttrs: false,
        props: ["src"],
        data(){
            return {};
        },
        computed: {
            path(){
                if(!this.src){
                    return "";
                }
                if(this.src.startsWith("/upload")){
                    // return `http://192.168.100.179:8081${path}`;
                    return `${this.$comm.getHost()}${this.src}?appid=${this.$comm.getAppId()}`;
                }
                return this.src;
            }
        },
        methods: {},
        components: {},
    };
</script>
