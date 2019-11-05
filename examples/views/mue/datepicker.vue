<template>
    <div>
        <br/>
        <mue-date-picker bar v-model="value" format="YYYY-MM-DD" min-date="2000-01-01"
                         max-date="2049-12-31" @confirm="onConfirm" @arrow="onArrow">
        </mue-date-picker>

        <br/>
        <mue-date-picker bar v-model="year" format="YYYY" min-date="2000-01-01"
                         max-date="2049-12-31" @confirm="onConfirm" @arrow="onArrow">
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
