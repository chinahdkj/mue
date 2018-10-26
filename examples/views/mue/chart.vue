<template>
    <div>
        <mue-panel title="图表">
            <mue-chart style="width: 100%; height: 200px;"
                       :options="option"/>
        </mue-panel>
        <mue-panel title="自适应图表">
            <mue-chart style="width: 100%;" :style="{height: height + 'px'}"
                       :options="option" auto-resize/>
        </mue-panel>
    </div>

</template>

<script>
    export default {
        components: {},
        data(){
            return {
                height: 200,
                option: {
                    xAxis: {
                        type: 'category',
                        data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
                    },
                    yAxis: {
                        type: 'value'
                    },
                    series: [
                        {
                            data: [820, 932, 901, 934, 1290, 1330, 1320],
                            type: 'line',
                            smooth: true
                        }
                    ]
                }

            };
        },
        methods: {},
        mounted(){
            setInterval(() => {
                this.height += 50;
                if(this.height > 400){
                    this.height = 200;
                }
            }, 5000);
        }
    }
</script>

<style>

</style>
