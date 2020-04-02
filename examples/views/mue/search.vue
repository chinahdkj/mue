<template>
    <div>
        <mue-search v-model="v" style="padding: 5px;"
                    @search="onSearch"></mue-search>
    </div>

</template>

<script>
    export default {
        components: {},
        data(){
            return {
                v: "",
                placeholder: "search"
            };
        },
        methods: {
            onSearch(v){
                this.$toast(v);
            }
        },
        mounted(){
        }
    };
</script>
