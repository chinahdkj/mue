<template>
    <div style="height: 400px;" v-loading="loading">
        <mue-datatable ref="table" :columns="columns" :min-col-width="minColWidth" :data="data"
                       :sort="sort" :total="total" row-class="rowClass" :stripe="stripe"
                       :row-key="rowKey" :row-height="rowHeight" :header="header"
                       @sort-change="onSortChange" @refresh="onRefresh" @load-more="onLoadMore"
                       @row-click="onRowClick">
        </mue-datatable>

        <van-button size="small" @click="toLeft" type="primary">滚动到最左边</van-button>
    </div>
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
                total: 0, // 总行数
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

                return {rows: rows, total: 100};


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
