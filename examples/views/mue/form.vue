<template>
    <van-tabs v-loading="confirming" class="no-flex">
        <van-tab title="demo">
            <mue-form v-model="model" @cancel="onCancel" @confirm="onConfirm" :label-width="110"
                      :readonly="readonly">
                <mue-form-item-group title="基本信息" sub-title="自动保存" style="border-top: 0;">
                    <div slot="help">11111</div>

                    <mue-form-item label="客户名称" required field="name" :rules="[{min: 3}]">
                        <mue-input placeholder="请输入" v-model.trim="model.name"></mue-input>
                    </mue-form-item>
                </mue-form-item-group>

                <mue-form-item-group title="站点信息">

                    <mue-form-item label="片区名称" field="div">
                        <mue-select placeholder="请选择"></mue-select>
                    </mue-form-item>

                    <mue-form-item label="人员选择" field="div">
                        <mue-tree-picker placeholder="请选择" multiple :data="users" v-model="model.user" clearable/>
                    </mue-form-item>

                    <mue-form-item label="安装时间" required field="date">
                        <mue-date-picker placeholder="请选择" v-model="model.date"></mue-date-picker>
                    </mue-form-item>

                    <mue-form-item label="经纬度" required field="pos">
                        <mue-gis-point placeholder="请选择" v-model="model.pos"></mue-gis-point>
                    </mue-form-item>

                    <mue-form-item label="站点图片" field="station.pics"
                                   required :rules="[{type:'array'}]">
                        <mue-img-upload multiple v-model="model.station.pics" :quality="0.6"/>
                    </mue-form-item>

                    <mue-form-item label="文件上传" field="files">
                        <mue-upload multiple v-model="model.files"/>
                    </mue-form-item>

                    <mue-form-item label="备注" field="remark">
                        <mue-textarea placeholder="请输入备注" v-model="model.remark"
                        :templates="[{code: '模板内容1', name: '模板1'}, {code: '模板内容2', name: '模板2'}]"/>
                    </mue-form-item>
                </mue-form-item-group>

                <mue-form-item label="数字验证" field="valid.number"
                               :rules="[{type:'number', min: 10, max: 80}]">
                    <mue-input type="number" v-model.number="model.valid.number">
                        <template slot="suffix">只</template>
                    </mue-input>
                </mue-form-item>

                <mue-form-item label="自定义验证" field="valid.custom"
                               :rules="[{validator: rules.custom}]">
                    <mue-input type="text" v-model="model.valid.custom"/>
                </mue-form-item>

                <mue-form-item label="异步验证" field="valid.sync"
                               :rules="[{validator: rules.sync}]">
                    <mue-input type="text" v-model="model.valid.sync"/>
                </mue-form-item>

            </mue-form>
        </van-tab>

        <van-tab title="表单">
            <b>mue-form</b>
            <mue-panel title="props">
                labelWidth: 左侧label宽度 Number <br/>
                value: 表单数据对象 <br/>
                readonly: 只读模式 <br/>
                inline: label 和 输入框 同在一行 Boolean 默认true <br/>
                cancelText: 取消按钮显示文本 默认 取消<br/>
                confirmText: 提交按钮显示文本 默认 提交
            </mue-panel>

            <mue-panel title="event" hairline="normal">
                confirm: 点击确认按钮事件 参数promise <br/>
                cancel: 点击取消按钮事件 <br/>
                super-confirm: 点击确认按钮事件, 只是点击的回调，无任何业务处理 <br/>
                super-cancel: 点击确认按钮事件, 只是点击的回调，无任何业务处理
            </mue-panel>

            <mue-panel title="method" hairline="normal">
                Validate: 验证表单，参数验证回调，无参数是返回Promise；验证回调和Pormise回调的参数结构
                { result: [bool]是否成功, messages: [array]错误信息, inputs: [array]验证错误的输入项 }
                ClearValid: 清空验证错误信息 <br/>
                ShowError: 显示验证错误信息 参数{messages: [array]错误信息, inputs: [array]验证错误的输入项}
            </mue-panel>
        </van-tab>

        <van-tab title="输入项组">
            <b>mue-form-item-group</b>
            <mue-panel title="props">
                labelWidth: 左侧label宽度(覆盖form设置) Number <br/>
                title: 组标题 String <br/>
                subTitle: 组副标题 右侧 String <br/>
                prefix: 组标题左侧图标样式 String<br/>
                icon: 右侧按钮图标 String default: "iconfont icon-icon_wenhao"
            </mue-panel>

            <mue-panel title="slot" hairline="normal">
                prefix: 组标题 左侧插槽 此插槽覆盖prefix属性渲染 <br/>
                subTitle: 副标题插槽 此插槽覆盖subTitle属性渲染 <br/>
                help: 右侧图标点击弹出内容
            </mue-panel>

            <mue-panel title="event" hairline="normal">
                icon-click: 右侧图标点击事件（有此事件回调，将不触发help弹出）
            </mue-panel>
        </van-tab>

        <van-tab title="输入项">
            <b>mue-form-item</b>
            <mue-panel title="props">
                labelWidth: 左侧label宽度(覆盖form、group设置) Number <br/>
                label: 左侧label String,
                field: 表单字段 String,
                required: 必填项 Boolean,
                rules: 验证规则 Array
                contentStyle: 输入内容区域样式
                contentClass: 输入内容区域样式类
            </mue-panel>
            <br/>
            <a href="https://github.com/yiminghe/async-validator" target="_blank">验证规则定义参考</a>
        </van-tab>
    </van-tabs>
</template>

<script>

    // import MueTreePicker from "../../../packages/Form/tree-picker/index";

    export default {
        // components: {MueTreePicker},
        data(){
            return {
                readonly: false,
                confirming: false,

                users: [
                    {
                        code: "c1", name: "选项1", children: [
                            {
                                code: "d1", name: "1-1", children: [
                                    {code: "e1", name: "1-1-1"},
                                    {code: "e2", name: "1-1-2"},
                                    {code: "e3", name: "1-1-3"},
                                    {code: "e4", name: "1-1-4"},
                                    {code: "e5", name: "1-1-5"},
                                ]
                            },
                            {code: "d2", name: "1-2"},
                            {code: "d3", name: "1-3"},
                            {code: "d4", name: "1-4", disabled: true},
                            {code: "d5", name: "1-5"},
                        ]
                    },
                    {code: "c2", name: "选项2"},
                    {
                        code: "c3", name: "选项3", disabled: true,
                        children: [
                            {code: "cd1", name: "3-1"},
                            {code: "cd2", name: "3-2"},
                            {code: "cd3", name: "3-3"},
                            {code: "cd4", name: "3-4"},
                            {code: "cd5", name: "3-5"},
                        ]
                    },
                    {code: "c4", name: "选项4"},
                    {code: "c5", name: "选项5"}
                ],

                rules: {
                    custom(rule, value, callback){
                        if(value === "xx"){
                            callback(new Error("值不能为xx"));
                        }
                        callback();
                    },
                    sync(rule, value, callback){
                        setTimeout(() => {
                            if(value === "qq"){
                                callback(new Error("值不能为qq"));
                            }
                            callback();
                        }, 1000);
                    }
                },

                model: {
                    name: "",
                    station: {
                        pics: []
                    },
                    pos: "120,30",
                    user: null,
                    remark: "",
                    valid: {
                        number: 0,
                        custom: "xx",
                        sync: "qq"
                    },
                    files: []
                }
            };
        },
        methods: {
            onCancel(){
                this.$toast("点击取消");
            },
            onConfirm(promise){
                this.confirming = true;
                promise.then((v) => {
                    // 提交表单
                    setTimeout(() => {
                        this.confirming = false;
                        this.$toast("点击确定，提交表单");
                        console.info(v);
                    }, 1000);

                }).catch(() => {
                    this.confirming = false;
                });
            }
        }
    }
</script>