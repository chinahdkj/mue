<template>
    <div>
        <mue-select style="margin: 10px;" :data="select.data" v-model="select.value"
                    @change="selectChange"></mue-select>
    </div>
</template>

<script>
    export default {
        components: {},
        data(){
            return {
                select: {
                    value: "c2",
                    data: [
                        {code: "c1", name: "选项1"},
                        {code: "c2", name: "选项2"},
                        {code: "c3", name: "选项3", disabled: true},
                        {code: "c4", name: "选项4"},
                        {code: "c5", name: "选项5"},
                    ]
                }
            };
        },
        methods: {
            selectChange(value, option){
                console.info("select", value, option);
            }
        },
    }
</script>
