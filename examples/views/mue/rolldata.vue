<template>
    <div>
        <mue-panel title="单个">
            <mue-roll-data title="日水量(吨)" :value="value"/>
        </mue-panel>

        <mue-panel title="两个">
            <mue-roll-data-group>
                <mue-roll-data title="日水量(吨)" :value="value"/>
                <mue-roll-data title="日水量(吨)" :value="value"/>
            </mue-roll-data-group>
        </mue-panel>

        <mue-panel title="三个">
            <mue-roll-data-group>
                <mue-roll-data title="日水量(吨)" :value="value"/>
                <mue-roll-data title="日水量(吨)" :value="value"/>
                <mue-roll-data title="日水量(吨)" :value="value"/>
            </mue-roll-data-group>
        </mue-panel>

        <mue-panel title="组合">
            <mue-roll-data title="日水量(吨)" :value="value"/>
            <mue-roll-data-group split>
                <mue-roll-data title="日水量(吨)" :value="value"/>
                <mue-roll-data title="日水量(吨)" :value="value"/>
            </mue-roll-data-group>
            <mue-roll-data-group split>
                <mue-roll-data title="日水量(吨)" :value="value"/>
                <mue-roll-data title="日水量(吨)" :value="value"/>
                <mue-roll-data title="日水量(吨)" :value="value"/>
            </mue-roll-data-group>
        </mue-panel>
    </div>

</template>

<script>
    export default {
        components: {},
        data(){
            return {
                value: "9999"
            };
        },
        methods: {
            updateValue(){
                this.value = new Date().getTime() % 10000;
                setTimeout(() => {
                    this.updateValue();
                }, 2238);
            }
        },
        mounted(){
            setTimeout(() => {
                this.updateValue();
            }, 2238);
        }
    }
</script>

<style>

</style>
