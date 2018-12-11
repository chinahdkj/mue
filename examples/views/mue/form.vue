<template>
    <mue-form>
        <mue-form-item-group title="基本信息" sub-title="自动保存" style="border-top: 0;">
            <div slot="help">11111</div>

            <mue-form-item label="客户名称">
                <mue-input placeholder="请输入"></mue-input>
            </mue-form-item>
        </mue-form-item-group>

        <mue-form-item-group title="站点信息">

            <mue-form-item label="片区名称">
                <mue-select placeholder="请选择"></mue-select>
            </mue-form-item>

            <mue-form-item label="安装时间">
                <mue-date-picker placeholder="请选择"></mue-date-picker>
            </mue-form-item>

            <mue-form-item label="站点图片">
                <mue-img-upload multiple v-model="model.station.pics"></mue-img-upload>
            </mue-form-item>

            <mue-form-item label="备注">
                <mue-textarea placeholder="请选择"></mue-textarea>
            </mue-form-item>
        </mue-form-item-group>

        <mue-form-item label="客户名称">
            <mue-select placeholder="请选择"></mue-select>
        </mue-form-item>
    </mue-form>
</template>

<script>
    import MueImgUpload from '../../../packages/Form/img-upload/index';

    export default {
        components: {MueImgUpload},
        data(){
            return {
                model: {
                    station: {
                        pics: []
                    }
                }
            };
        },
        methods: {}
    }
</script>