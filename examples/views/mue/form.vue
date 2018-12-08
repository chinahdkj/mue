<template>
    <mue-form>
        <mue-form-item-group title="基本信息" sub-title="自动保存">
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
    import MueFormItem from '../../../packages/Form/src/form-item';
    export default {
        components: {MueFormItem},
        data(){
            return {};
        },
        methods: {}
    }
</script>