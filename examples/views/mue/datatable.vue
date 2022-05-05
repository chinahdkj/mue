<template>
    <van-tabs class="no-flex">
        <van-tab title="demo">
            <mue-popover ref="pop" placement="bottom">
                <div style="padding: 10px;">99999</div>
            </mue-popover>
            <div style="height: 400px; padding: 5px;" v-loading="loading">
                <mue-datatable ref="table" :columns="columns" :min-col-width="minColWidth"
                               :noborder="noborder" :border-effect="borderEffect"
                               :data="data" :sort="sort" :total="total" :row-class="rowClass"
                               :stripe="stripe" :row-key="rowKey" :row-height="rowHeight"
                               :header="header" :page-size="pageSize" @sort-change="onSortChange"
                               @refresh="onRefresh" @load-more="onLoadMore" :virtual="true"
                               @row-click="onRowClick" @cell-click="onCellClick"
                               @selection-change="onSelectionChange">
<!--                    <template slot="row" slot-scope="{row, cols, no}">-->
<!--                        <tr>-->
<!--                            <td v-for="c in cols" :key="c.field">-->
<!--                                {{no}}{{row[c.field]}}-->
<!--                            </td>-->
<!--                        </tr>-->
<!--                    </template>-->

                    <template slot="aa" slot-scope="{row, col, value, no}">
                        <a v-popover:pop>{{col.field}} -- {{value}}</a>
                    </template>

                    <div slot="toast" slot-scope="{row, col, value, no}" @click="$toast(value)">
                        toast-{{value}}
                    </div>
                </mue-datatable>
            </div>
            <van-button size="small" @click="toLeft" type="primary">滚动到最左边</van-button>
            <van-button size="small" @click="getSelection" type="primary">返回选中数据</van-button>

            <van-actionsheet v-model="show"
                    :actions="[{ name: '选项'}]"/>
        </van-tab>

        <van-tab title="定义">
            header: 是否显示表头[true, false]<br/>
            columns: 列定义<br/>
            data: 数据<br/>
            total: 总行数 number；为0时显示为无数据<br/>
            minColWidth: 列最小宽度， 列未设置宽度时，按照可视区域与此宽度计算列宽<br/>
            rowKey: 行数据主键<br/>
            rowClass: 行样式类 string、function(row, no)<br/>
            rowHeight: 行高 number 默认40<br/>
            noborder: 不显示边框[false, true]<br/>
            stripe: 斑马线[false, true], 暂无样式支持<br/>
            sort: 排序{field, order}, 支持sync<br/>
            pageSize: 分页大小 number<br/>
            rowNo: 行序号 string、function(row, no); string 取行属性; 缺省为 no + 1<br/>
            virtual: 虚拟渲染[true, false], 默认开启，开启时，只渲染部分行，其余留白。<br/>

            pageSize > 0 可视区域最后一行的rowNo 计算当前页码， 页码 > 1时 显示右下角分页按钮，点击返回顶部。
            <br/>
            <!-- selection: 是否启用表格多选功能[true,false]<br/> -->
        </van-tab>

        <van-tab title="列定义">
            field: 列字段 <br/>
            title: 列标题 <br/>
            width: 列宽度 number <br/>
            fixed: 是否锁定列[false, true] <br/>
            align: 对齐方式["center", "left", "right"] <br/>
            hide: 是否隐藏[false, true] <br/>
            children: 子列定义(合并表头) <br/>
            slot: 表头单元格的插槽名称 <br/>
            tmpl: 行单元格的作用域插槽名称 {row, col, value, no} <br/>
            type: 类型字段 默认/多选selection 可选，不填为默认，填了selection开启多选框，一个columns定义多个只会共享一个selection-change事件<br/>
        </van-tab>

        <van-tab title="作用域插槽">
            row: 行数据渲染插槽, 使用此插槽将覆盖默认的td渲染，{row, cols, no}。
        </van-tab>

        <van-tab title="Events">
            sort-change: 排序变化 参数: {field, order}(排序规则) <br/>
            refresh: 顶部下拉刷新 参数: func(回调方法，执行完以后调用) <br/>
            load-more: 底部上拉刷新加载 参数: func(回调方法，执行完以后调用) <br/>
            row-click: 行点击 参数: row(行数据), no(行索引) <br/>
            cell-click: 单元格点击 参数: value(单元格数据), row(行数据), col(列定义), no(行索引), event<br/>
            selection-change: 表格多选选中触发 无参数，返回选中的数据<br/>
        </van-tab>

        <van-tab title="Method">
            ScrollLeft: 设置table 滚动部分的左滚动距离，参数: Number(距离)
            ScrollTop: 设置table 滚动部分的上滚动距离，参数: Number(距离)
            LoadSuccess: 数据加载完成时调用，类似refresh 和 load-more 的func参数，主要用于检查数据是否已填充满
            getSelection: 返回已选中数据
        </van-tab>
    </van-tabs>
</template>

<script>
    import uuid from "../../../src/utils/uuid";

    export default {
        data(){
            return {
                show: false,
                loading: false,
                pageNo: 0,
                noborder: false, borderEffect: "both",

                header: true, // 显示表头
                columns: [ // 列定义
                    {width: 50, type:'selection',fixed:true},
                    {field: "a", title: "列1", width: 120, fixed: true, align: "left"},
                    {field: "b", title: "列2", width: 120, tmpl: "aa"},
                    {field: "c", title: "列3", width: 120, tmpl: "toast", sortable: true},
                    {
                        title: "合并", children: [
                            {field: "d", title: "列4", width: 120},
                            {field: "e", title: "列5", width: 120},
                        ]
                    },
                    {field: "f", title: "列6"},
                    {field: "g", title: "列7", hide: true}
                ],
                data: [], // 数据
                total: -1, // 总行数
                sort: {field: "c", order: "asc"}, // 排序
                minColWidth: 80, // 未设置宽度的列的最小宽度
                rowKey: "_id", // 行的主键字段，可不设
                rowClass: (r, i) => { // 行样式类，可以试function，也可以是string
                    return i % 2 === 0 ? "tr0" : "tr1";
                },
                rowHeight: 48, // 行高 缺省40
                stripe: true, // 斑马线 样式暂无
                pageSize: 20 // 分页大小
            };
        },
        components: {},
        methods: {
            loadData(){
                let start = this.pageSize * (this.pageNo - 1);
                let rows = Array.from({length: this.pageSize}).map((r, i) => {
                    return {
                        _id: uuid(4, 8), a: `a${start + i}`, b: `b${start + i}`,
                        c: `c${start + i}`, d: `d${start + i}`
                    };
                });

                return {rows: rows, total: 1000};


            },

            onSortChange(sort){
                // 排序变化
                this.sort = sort;
                this.pageNo = 1;
                this.loading = true;
                let self = this;
                setTimeout(() => {
                    let temp = self.loadData();
                    self.data = temp.rows;
                    self.total = temp.total;
                    self.loading = false;
                }, 1000);
            },

            onRefresh(success){
                // 下拉刷新
                this.pageNo = 1;
                this.loading = true;
                let self = this;
                setTimeout(() => {
                    let temp = self.loadData();
                    self.data = temp.rows;
                    self.total = temp.total;
                    self.loading = false;

                    success();
                }, 2000);
            },

            onLoadMore(success){
                // 底部加载更多
                // 当data.length >= total 则不再触发
                this.pageNo += 1;
                this.loading = true;
                let self = this;
                setTimeout(() => {
                    let temp = self.loadData();
                    self.data = self.data.concat(temp.rows);
                    self.total = temp.total;
                    self.loading = false;

                    success && success();
                }, 2000);
            },

            onRowClick(row, index){
                console.info([JSON.stringify(row), index]);
                // alert([JSON.stringify(row), index]);
            },

            toLeft(){
                this.$refs.table.ScrollLeft();
            },

            getSelection(){
                const checks = this.$refs.table.getSelection()
                console.log(checks)
            },

            onCellClick(value, row, col, no, event){
                this.show = true;
                // console.info(value);
                // alert(value);
            },

            onSelectionChange(selects){
                console.log({selects})
            }
        },
        mounted(){
            this.onLoadMore();
        }
    };
</script>

<style lang="less" scoped>
    .van-tabs {
        /deep/ .van-tabs__wrap:after {
            border-top: 0;
        }
    }
</style>
