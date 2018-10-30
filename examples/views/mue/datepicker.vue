<template>
    <div>
        <mue-date-picker bar v-model="value" format="yyyy-MM-dd" @confirm="onConfirm">
        </mue-date-picker>
    </div>

</template>

<script>
    export default {
        components: {},
        data(){
            return {
                value: "2018-06-10",
            };
        },
        methods: {
            onConfirm(v){
                alert(`${v}`);
            }
        }
    }
</script>

<style>

</style>
