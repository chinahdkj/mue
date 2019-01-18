<template>
    <div>
        <mue-panel hairline="normal" title="select">
            <mue-select style="margin: 10px;" :data="select.data" v-model="select.value"
                        @change="selectChange"></mue-select>
        </mue-panel>


        <mue-panel hairline="normal" title="input">
            <mue-input style="margin: 10px;" type="text" v-model="input.value"
                       placeholder="请输入"/>
            <mue-input style="margin: 10px;" type="password" v-model="input.value"
                       placeholder="请输入" icon="iconfont icon-tongxunlu" @icon-click="pwdIconClick"/>
            <mue-input style="margin: 10px;" type="number" v-model.number="input.number"
                       placeholder="请输入数字"/>
        </mue-panel>

        <mue-panel hairline="normal" title="图片单张上传" style="height:120px;">
            <mue-img-upload style="margin-left: 5px;" v-model="img.single" base64 :quality="0.5"/>
        </mue-panel>

        <mue-panel hairline="normal" title="图片批量上传" style="height:120px;">
            <mue-img-upload style="margin-left: 5px;" v-model="img.multiple" multiple/>
        </mue-panel>

    </div>
</template>

<script>

    export default {
        components: {},
        data(){
            return {
                select: {
                    value: "c3",
                    data: [
                        {
                            code: "c1", name: "选项1", children: [
                                {code: "d1", name: "1-1"},
                                {code: "d2", name: "1-2"},
                                {code: "d3", name: "1-3"},
                                {code: "d4", name: "1-4"},
                                {code: "d5", name: "1-5"},
                            ]
                        },
                        {code: "c2", name: "选项2"},
                        {code: "c3", name: "选项3", disabled: true},
                        {code: "c4", name: "选项4"},
                        {code: "c5", name: "选项5"},
                    ]
                },
                input: {number: 0, value: ""},
                img: {
                    single: "",
                    multiple: []
                }
            };
        },
        methods: {
            selectChange(value, option){
                console.info("select", value, option);
            },
            pwdIconClick(){
                alert(this.input.value);
            }
        },
    }
</script>
