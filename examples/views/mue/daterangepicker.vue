<template>
    <div>
        <br/>
        <mue-date-range-picker bar :begin.sync="begin" :end.sync="end" format="YYYY-MM-DD"
                               @confirm="onConfirm" @arrow="onArrow">
        </mue-date-range-picker>
    </div>

</template>

<script>
    export default {
        components: {},
        data(){
            return {
                begin: "2018-06-10",
                end: "2018-07-10"
            };
        },
        methods: {
            onConfirm(begin, end){
                alert(`${begin}, ${end}`);
            },
            onArrow(t){
                alert(t);
            }
        }
    }
</script>

<style>

</style>
