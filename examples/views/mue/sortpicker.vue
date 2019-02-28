<template>
    <div style="padding: 10px 0;">
        <mue-sort-picker :data="data"></mue-sort-picker>
    </div>
</template>

<script>
    export default {
        components: {},
        data(){
            return {
                data: [
                    {code: "price", name: "价格"},
                    {code: "sate", name: "状态"},
                    {code: "age", name: "新旧"},
                    {code: "height", name: "高度"},
                    {code: "width", name: "宽度"},
                    {code: "power", name: "功耗"},
                ]
            };
        },
        methods: {}
    }
</script>