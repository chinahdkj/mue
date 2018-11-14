<template>
    <div>
        <mue-date-picker bar v-model="value" format="YYYY-MM-DD" @confirm="onConfirm"
                         @arrow="onArrow">
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
            },
            onArrow(t){
                alert(t);
            }
        }
    }
</script>

<style>

</style>
