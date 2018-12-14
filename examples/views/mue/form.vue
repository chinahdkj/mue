<template>
    <mue-form v-model="model" @cancel="onCancel" @confirm="onConfirm">
        <mue-form-item-group title="基本信息" sub-title="自动保存" style="border-top: 0;">
            <div slot="help">11111</div>

            <mue-form-item label="客户名称" required field="name" :rules="[{min: 3}]">
                <mue-input placeholder="请输入" v-model.trim="model.name"></mue-input>
            </mue-form-item>
        </mue-form-item-group>

        <mue-form-item-group title="站点信息">

            <mue-form-item label="片区名称">
                <mue-select placeholder="请选择"></mue-select>
            </mue-form-item>

            <mue-form-item label="安装时间" required field="date">
                <mue-date-picker placeholder="请选择" v-model="model.date"></mue-date-picker>
            </mue-form-item>

            <mue-form-item label="站点图片" field="station.pics">
                <mue-img-upload multiple v-model="model.station.pics"></mue-img-upload>
            </mue-form-item>

            <mue-form-item label="备注">
                <mue-textarea placeholder="请输入备注"></mue-textarea>
            </mue-form-item>
        </mue-form-item-group>

        <mue-form-item label="站点类型">
            <mue-select placeholder="请选择"></mue-select>
        </mue-form-item>

        <a href="https://github.com/yiminghe/async-validator" target="_blank">验证规则定义参考</a>
    </mue-form>
</template>

<script>


    export default {
        components: {},
        data(){
            return {
                model: {
                    name: "",
                    station: {
                        pics: []
                    }
                }
            };
        },
        methods: {
            onCancel(){
                alert("点击取消");
            },
            onConfirm(promise){
                promise.then((v) => {
                    alert("表单验证成功")
                }).catch(() => {

                });
            }
        }
    }
</script>