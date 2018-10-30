<template>
    <div>
        <mue-date-range-picker bar :begin.sync="begin" :end.sync="end"
                               format="yyyy-MM-dd" @confirm="onConfirm">

        </mue-date-range-picker>
    </div>

</template>

<script>
    export default {
        components: {},
        data(){
            return {
                ischart: true,
                begin: "2018-06-10",
                end: "2018-07-10"
            };
        },
        methods: {
            onConfirm(begin, end){
                alert(`${begin}, ${end}`);
            }
        }
    }
</script>

<style>

</style>
