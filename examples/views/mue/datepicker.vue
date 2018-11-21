<template>
    <div>
        <mue-date-picker bar v-model="value" format="YYYY-MM-DD" @confirm="onConfirm"
                         @arrow="onArrow">
        </mue-date-picker>

        <mue-date-picker bar v-model="year" format="YYYY" @confirm="onConfirm"
                         @arrow="onArrow">
        </mue-date-picker>

        <mue-date-picker v-model="value" format="YYYY-MM-DD"></mue-date-picker>
    </div>

</template>

<script>
    export default {
        components: {},
        data(){
            return {
                value: "",
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
