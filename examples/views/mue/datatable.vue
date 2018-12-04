<template>
    <van-tabs>
        <van-tab title="demo">
            <div style="height: 400px;" v-loading="loading">
                <mue-datatable ref="table" :columns="columns" :min-col-width="minColWidth"
                               :data="data" :sort="sort" :total="total" :row-class="rowClass"
                               :stripe="stripe" :row-key="rowKey" :row-height="rowHeight"
                               :header="header" @sort-change="onSortChange" @refresh="onRefresh"
                               @load-more="onLoadMore" @row-click="onRowClick">
                    <!--<template slot="row" slot-scope="{row, cols, no}">-->
                    <!--<td v-for="c in cols" :key="c.field">-->
                    <!--{{no}}{{row[c.field]}}-->
                    <!--</td>-->
                    <!--</template>-->
                </mue-datatable>
            </div>
            <van-button size="small" @click="toLeft" type="primary">滚动到最左边</van-button>
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
            stripe: 斑马线[false, true], 暂无样式支持<br/>
            sort: 排序{field, order}, 支持sync
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
        </van-tab>

        <van-tab title="作用域插槽">
            row: 行数据渲染插槽, 使用此插槽将覆盖默认的td渲染，{row, cols, no}。
        </van-tab>

        <van-tab title="Events">
            sort-change: 排序变化 参数: {field, order}(排序规则) <br/>
            refresh: 顶部下拉刷新 参数: func(回调方法，执行完以后调用) <br/>
            load-more: 底部上拉刷新加载 参数: func(回调方法，执行完以后调用) <br/>
            row-click: 行点击 参数: row(行数据), no(行索引) <br/>
        </van-tab>

        <van-tab title="Method">
            ScrollLeft: 设置table 滚动部分的左滚动距离，参数: Number(距离)
        </van-tab>
    </van-tabs>
</template>

<script>
    import uuid from '../../../src/utils/uuid';

    export default {
        data(){
            return {
                loading: false,
                pageNo: 0,
                pageSize: 20,

                header: true, // 显示表头
                columns: [ // 列定义
                    {field: "a", title: "列1", width: 120, fixed: true, align: "left"},
                    {field: "b", title: "列2", width: 120},
                    {field: "c", title: "列3", width: 120, sortable: true},
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
                rowHeight: 40, // 行高 缺省40
                stripe: true // 斑马线 样式暂无
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

                return {rows: rows, total: 80};


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
                }, 2000);
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
                alert([JSON.stringify(row), index]);
            },

            toLeft(){
                this.$refs.table.ScrollLeft();
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
