<template>
    <mue-container>
        <mue-main>
            <mue-panel title="单选">
                <mue-tree-picker placeholder="请选择" :data="data" v-model="single"
                                 clearable/>
            </mue-panel>

            <mue-panel title="多选">
                <mue-tree-picker placeholder="请选择" multiple :data="data" v-model="multiple"
                                 clearable searchable/>
            </mue-panel>

            <mue-panel title="单选过滤">
                <mue-tree-picker placeholder="请选择" :data="data" v-model="single_f"
                                 clearable :selectable="filter"/>
            </mue-panel>

            <mue-panel title="多选过滤">
                <mue-tree-picker placeholder="请选择" multiple :data="data" v-model="multiple_f"
                                 clearable :selectable="filter"/>
            </mue-panel>
        </mue-main>
    </mue-container>

</template>

<script>

    import Panel from '../../../packages/Tree/src/panel';

    export default {
        components: {Panel},
        data(){
            return {
                data: [],
                single: "330109",
                single_f: "330102",
                multiple: ["330100", "330102"],
                multiple_f: ["330100", "330102"]
            };
        },
        methods: {
            filter(data, node){
                return !data.city;
            }
        },
        mounted(){
            this.$nextTick(() => {
                this.data = [
                    {
                        code: "330100", name: "杭州市", city: true, children: [
                            {code: "330102", name: "上城区"},
                            {code: "330103", name: "下城区"},
                            {code: "330104", name: "江干区"},
                            {code: "330105", name: "拱墅区"},
                            {code: "330106", name: "西湖区"},
                            {code: "330108", name: "滨江区"},
                            {code: "330109", name: "萧山区"},
                            {code: "330110", name: "余杭区"},
                            {code: "330111", name: "富阳区"},
                            {code: "330122", name: "桐庐县"},
                            {code: "330127", name: "淳安县"},
                            {code: "330182", name: "建德市"},
                            {code: "330185", name: "临安市"}
                        ]
                    },
                    {
                        code: "330200", name: "宁波市", city: true, children: [
                            {code: "330203", name: "海曙区"},
                            {code: "330204", name: "江东区"},
                            {code: "330205", name: "江北区"},
                            {code: "330206", name: "北仑区"},
                            {code: "330211", name: "镇海区"},
                            {code: "330212", name: "鄞州区"},
                            {code: "330225", name: "象山县"},
                            {code: "330226", name: "宁海县"},
                            {code: "330281", name: "余姚市"},
                            {code: "330282", name: "慈溪市"},
                            {code: "330283", name: "奉化市"}
                        ]
                    },
                    {
                        code: "330300", name: "温州市", city: true, children: [
                            {code: "330302", name: "鹿城区"},
                            {code: "330303", name: "龙湾区"},
                            {code: "330304", name: "瓯海区"},
                            {code: "330305", name: "洞头区"},
                            {code: "330324", name: "永嘉县"},
                            {code: "330326", name: "平阳县"},
                            {code: "330327", name: "苍南县"},
                            {code: "330328", name: "文成县"},
                            {code: "330329", name: "泰顺县"},
                            {code: "330381", name: "瑞安市"},
                            {code: "330382", name: "乐清市"}
                        ]
                    },
                    {
                        code: "330400", name: "嘉兴市", city: true, children: [
                            {code: "330402", name: "南湖区"},
                            {code: "330411", name: "秀洲区"},
                            {code: "330421", name: "嘉善县"},
                            {code: "330424", name: "海盐县"},
                            {code: "330481", name: "海宁市"},
                            {code: "330482", name: "平湖市"},
                            {code: "330483", name: "桐乡市"}
                        ]
                    }
                ];
            });
        }
    }
</script>
