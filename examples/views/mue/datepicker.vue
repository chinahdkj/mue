<template>
    <div>
        <mue-date-picker bar v-model="value" format="YYYY-MM-DD" @confirm="onConfirm"
                         @arrow="onArrow">
        </mue-date-picker>

        <mue-date-picker bar v-model="year" format="YYYY" @confirm="onConfirm"
                         @arrow="onArrow">
        </mue-date-picker>

        <mue-date-picker style="margin: 10px;" v-model="value" format="YYYY-MM-DD">
        </mue-date-picker>
    </div>

</template>

<script>
    export default {
        components: {},
        data(){
            return {
                value: "2018-01-01",
                year: "2016",
            };
        },
        methods: {
            onConfirm(v){
                alert(`${v}`);
            },
            onArrow(t){
                alert(t);
            }
        }
    }
</script>

<style>

</style>
