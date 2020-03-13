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
                return this.$comm.getUploadPath(this.src);
            }
        },
        methods: {},
        components: {},
    };
</script>
