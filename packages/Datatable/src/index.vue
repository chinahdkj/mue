<template>
    <div class="mue-datatable" :class="{'no-border': noborder}">
        <div class="mue-datatable-header" v-if="headerVisibel" :style="{height: headerHeight}">
            <div class="mue-datatable-fixed" v-if="fixedWidth > 0"
                 :style="{width:fixedWidth + 'px' }">
                <table class="mue-datatable__inner-table"
                       :style="{width: tableWidth + 'px'}">

                    <col-group :columns="colFields" />

                    <thead>
                    <tr v-for="(r , ii) in cols" :key="ii">
                        <th v-for="(c, i) in r" :key="i" :colspan="c.colspan" :rowspan="c.rowspan">
                            <a v-if="c.fixed" :style="{'text-align': c.align || 'center'}">
                                <span :class="sortCls(c)" @click="onChangeSort(c)">
                                    <slot v-if="c.slot && $slots[c.slot]" :name="c.slot">
                                    </slot>
                                    <template v-else>
                                        {{c.title}}
                                    </template>
                                    <i class="icon-asc fa fa-caret-up" aria-hidden="true"></i>
                                    <i class="icon-desc fa fa-caret-down" aria-hidden="true"></i>
                                </span>
                            </a>
                        </th>
                    </tr>
                    </thead>

                </table>
            </div>

            <div ref="top_table" class="mue-datatable-center" :style="[centerWidth]"
                 @touchstart="scrollTable = 'top_table'">
                <table class="mue-datatable__inner-table" :style="{width: tableWidth + 'px'}">

                    <col-group :columns="colFields" filter/>

                    <thead>
                    <tr v-for="(r , ii) in cols" :key="ii">
                        <th v-for="(c, i) in r" :key="i" :colspan="c.colspan" v-if="!c.fixed"
                            :rowspan="c.rowspan">
                            <a v-if="!c.fixed" :style="{'text-align': c.align || 'center'}">
                                <span :class="sortCls(c)" @click="onChangeSort(c)">
                                    <slot v-if="c.slot && $slots[c.slot]" :name="c.slot">
                                    </slot>
                                    <template v-else>
                                        {{c.title}}
                                    </template>
                                    <i class="icon-asc fa fa-caret-up" aria-hidden="true"></i>
                                    <i class="icon-desc fa fa-caret-down" aria-hidden="true"></i>
                                </span>
                            </a>
                        </th>
                    </tr>
                    </thead>

                </table>
            </div>
        </div>

        <div class="mue-datatable-main" v-resize="scrollResize" style="overflow: auto"
             :style="headerVisibel ? {'border-top-width': headerHeight} : {}">

            <mue-load-more ref="load_more" @refresh="onRefresh" @load-more="onLoad"
                           @scroll-change="onScrollY" :dis-refresh="!$listeners['refresh']"
                           :dis-load-more="!$listeners['load-more'] || total === 0"
                           :all-loaded="data.length >= total" :all-loaded-text="allLoadedText"
                           :page-no="pageNo" :page-total="pageTotal">

                <div v-if="total === 0" class="mue-datatable-nodata">
                    <img v-if="!isNight" src="../assets/no-data.png"/>
                    <img v-else src="../assets/no-data-dark.png"/>
                    <span>暂无数据</span>
                </div>

                <div v-else class="mue-datatable-scroller" :class="{'is-virtual': virtual}"
                     :style="mainHeight">
                    <div class="mue-datatable-fixed" v-if="fixedWidth > 0"
                         :style="[{width: fixedWidth + 'px' }]">

                        <table class="mue-datatable__inner-table" :style="[{width: tableWidth + 'px'},
                                virtual ? {'margin-top': virtualBox.white} : null]">
                            <col-group :columns="colFields"/>
                            <tbody>
                            <slot v-for="(d, i) in virtualBox.rows" name="row" :cols="colFields"
                                  :row="d" :no="i + virtualBox.start">

                                <tr class="__row" :key="rowId(d, i + virtualBox.start)"
                                    :class="rowCls(d, i + virtualBox.start)"
                                    @click="onRowClick(d, i + virtualBox.start)">

                                    <cell v-for="c in colFields" :key="c.field" :col="c"
                                          :row="d" :fixed="true" :value="getValue(d, c.field)"
                                          :hstyle="cellHeight" :no="i + virtualBox.start"/>

                                </tr>

                            </slot>
                            </tbody>
                        </table>
                    </div>

                    <div ref="main_table" class="mue-datatable-center"
                         @touchstart="scrollTable = 'main_table'" :style="[centerWidth]">

                        <table class="mue-datatable__inner-table" :style="[{width: tableWidth + 'px'},
                                virtual ? {'margin-top': virtualBox.white} : null]">
                            <col-group :columns="colFields" filter/>
                            <tbody>
                            <slot v-for="(d, i) in virtualBox.rows" name="row" :cols="colFields"
                                  :row="d" :no="virtualBox.start + i">

                                <tr class="__row" :key="rowId(d, virtualBox.start + i)"
                                    :class="rowCls(d, virtualBox.start + i)"
                                    @click="onRowClick(d, virtualBox.start  + i)">

                                    <cell v-for="c in colFields" :key="c.field" v-if="!c.fixed"
                                          :hstyle="cellHeight" :col="c" :row="d" :fixed="false"
                                          :value="getValue(d, c.field)" :no="virtualBox.start +i"/>

                                </tr>

                            </slot>
                            </tbody>
                        </table>

                    </div>
                </div>

            </mue-load-more>

        </div>
    </div>
</template>
<script>

    import colGroup from "./col-group";
    import cell from "./cell";
    import {objectGet} from '../../../src/utils/object';

    export default {
        name: "MueDatatable",
        components: {colGroup, cell},
        provide(){
            return {TABLE: this};
        },
        props: {
            header: {type: Boolean, default: true},
            columns: {
                type: Array, default(){
                    return [];
                }
            },
            data: {
                type: Array, default(){
                    return [];
                }
            },
            total: {type: Number, default: 0}, // 总行数
            minColWidth: {type: Number, default: 80},
            rowKey: {type: String, default: ""},
            rowClass: {type: [String, Function], default: ""},
            rowHeight: {type: Number, default: 40}, // 行高
            stripe: {type: Boolean, default: false}, // 斑马线
            noborder: {type: Boolean, default: false}, // 不显示边框
            sort: {type: Object, default: null}, // 排序

            pageSize: {type: Number, default: 0},
            rowNo: {type: [String, Function], default: ""},

            virtual: {type: Boolean, default: true} // 虚拟渲染，可视区域之外不渲染
        },
        data(){
            return {
                tableWidth: 0, //表格宽度
                fixedWidth: 0, // 固定列宽度
                cols: [], // 列渲染结构，二维数组
                colFields: [], // 列属性
                headerRows: 0, // 表头行数
                pageNo: 0,
                scrollTable: null, // 操作横向滚动的表格
                scrollBox: { // 竖向滚动高度，及可视区域高度
                    top: 0, height: 0
                },
                isActive: false, // 是否被激活，不激活状态, 停用横向滚动同步
            };
        },
        computed: {
            centerWidth(){
                if(this.fixedWidth === 0){
                    return {width: "100%"};
                }
                return {width: `calc(100% - ${this.fixedWidth}px)`};
            },
            mainHeight(){
                if(!this.virtual){
                    return null;
                }
                return {height: `${this.data.length * this.rowHeight + Number(!this.border)}px`}
            },
            headerVisibel(){
                return this.header && this.colFields.length > 0;
            },
            headerHeight(){
                return (this.headerVisibel ? (this.headerRows * 36 + 4) : 0) + "px";
            },
            isNight(){
                return this.$root.theme === "night";
            },
            pageTotal(){
                if(this.pageSize){
                    return parseInt(this.total / this.pageSize) +
                        (this.total % this.pageSize === 0 ? 0 : 1);
                }
                return 0;
            },
            cellHeight(){
                let h = `${this.rowHeight - (this.noborder ? 0 : 1)}px`;
                let style = {"line-height": h};
                if(this.virtual){
                    style.height = `${this.rowHeight}px`;
                }
                return style;
            },
            virtualBox(){
                if(!this.virtual){
                    return {
                        start: 0,
                        end: this.data.length, // 渲染数据范围
                        white: null,
                        rows: this.data
                    };
                }

                let half = Math.ceil(this.scrollBox.height / this.rowHeight / 2);
                let start = Math.floor(this.scrollBox.top / this.rowHeight);
                start = Math.max(start - half, 0);
                let end = Math.min(start + 4 * half, this.data.length);
                return {
                    start, end,
                    white: `${this.rowHeight * start}px`,
                    rows: this.data.filter((r, i) => {
                        return i >= start && i < end;
                    })
                };
            },
            allLoadedText(){
                return this.pageTotal > 1 ? `已加载${this.total}条数据，没有更多数据了` : "";
            }
        },
        watch: {
            columns: {
                deep: true,
                handler(){
                    this.setCols();
                }
            },
            isActive:{
                immediate:true,
                handler(v){
                    v && this.syncScrollX();
                }
            }
        },
        methods: {
            getRowNo(row, index){
                if(typeof this.rowNo === "function"){
                    return this.rowNo(row, index);
                }
                return this.rowNo ? row[this.rowNo] : (index + 1);
            },
            getValue(row, field){
                if(!field){
                    return;
                }
                return objectGet(row || {}, field);
            },
            rowCls(row, i){
                return [
                    this.stripe && i % 2 === 1 ? "tr_stripe" : "",
                    typeof this.rowClass === "function"
                    ? this.rowClass(row, i) : (this.rowClass || "")
                ];
            },
            sortCls(col){
                let cls = "th-title ";
                if(!col.sortable){
                    return cls;
                }
                cls += "is-sortable ";
                let sort = this.sort || {};
                if(!col.field || sort.field !== col.field || !sort.order){
                    return cls;
                }
                return cls + (sort.order === "desc" ? "is-desc" : "is-asc");

            },
            onChangeSort(col){
                if(!col.field || !col.sortable){
                    return;
                }
                let current = this.sort || {};
                if(col.field !== current.field){
                    this.$emit("update:sort", {field: col.field, order: "asc"});
                    this.$emit("sort-change", {field: col.field, order: "asc"});
                    return;
                }
                let sorts = ["asc", "desc", null];
                let i = sorts.indexOf(current.order || null);
                i = (i + 1) % 3;
                this.$emit("update:sort", {field: col.field, order: sorts[i]});
                this.$emit("sort-change", {field: col.field, order: sorts[i]});
            },
            rowId(row, i){
                if(!this.rowKey){
                    return i;
                }
                return `${this.getValue(row, this.rowKey)}${i}`;
            },
            setCols(){
                let tableWidth = this.$el.offsetWidth;
                let headerRows = 0;
                let colWidth = 0, width0s = 0;
                let whole = [];

                function _create(children, col, level, fixed){
                    if(col.hide){
                        return;
                    }
                    if(level >= headerRows){
                        headerRows = level + 1;
                    }

                    let options = $.extend(true, {}, col);
                    delete options.children;
                    let column = {
                        fixed: fixed, align: col.align || "center", title: col.title,
                        children: [], slot: col.slot, level: level, options
                    };

                    let chs = col.children || [];
                    for(let i = 0; i < chs.length; i++){
                        let ch = chs[i];
                        _create(column.children, ch, level + 1, fixed);
                    }

                    if(column.children.length > 0){
                        column.colspan = column.children.map((c) => Number(c.colspan))
                            .reduce((c, n) => c + n);
                        if(column.colspan > 0){
                            children.push(column);
                            whole.push(column);
                        }
                        return;
                    }
                    if(!col.field){
                        return;
                    }
                    column.field = col.field || "";
                    column.align = col.align || "center";
                    column.width = col.width || 0;
                    column.sortable = col.sortable;
                    column.tmpl = col.tmpl || null;
                    column.colspan = 1;
                    if(column.width){
                        colWidth += column.width;
                    }
                    else{
                        width0s += 1;
                    }
                    children.push(column);
                    whole.push(column);
                }

                for(let i = 0; i < this.columns.length; i++){
                    _create([], this.columns[i], 0, !!this.columns[i].fixed);
                }

                let dftWidth = 0;
                if(width0s > 0){
                    dftWidth = (tableWidth - colWidth) / width0s;
                }
                dftWidth = Math.max(dftWidth, this.minColWidth);


                // 分配锁定滚动列
                let cols = Array.from({length: headerRows}).map(() => {
                        return [];
                    }),
                    fwd = 0, wd = 0, ffields = [], fields = [];

                for(let i = 0; i < whole.length; i++){
                    let c = whole[i];
                    if(c.children.length === 0){
                        c.width = c.width || dftWidth;
                        c.rowspan = headerRows - c.level;
                        if(c.fixed){
                            ffields.push(c);
                            fwd += c.width;
                        }
                        else{
                            fields.push(c);
                            wd += c.width;
                        }
                    }
                    else{
                        c.rowspan = 1;
                    }
                    cols[c.level].push(c);
                }

                if(fwd >= tableWidth){
                    ffields.forEach((c) => {
                        c.fixed = false;
                    });
                    wd = fwd + wd;
                    fwd = 0;
                }

                this.tableWidth = fwd + wd;
                this.fixedWidth = fwd;
                this.cols = cols;
                this.colFields = [...ffields, ...fields];
                this.headerRows = headerRows;
            },

            syncScrollX(){
                if(!this.isActive){
                    return;
                }
                let table = this.scrollTable;
                if(table && this.$refs.top_table && this.$refs.main_table){
                    let other = table === "top_table" ? "main_table" : "top_table";
                    this.$refs[other].scrollLeft = this.$refs[table].scrollLeft;
                }
                window.requestAnimationFrame(this.syncScrollX);
            },

            onScrollY(box){
                if(!this.pageSize || !this.$refs.main_table){
                    this.pageNo = 0;
                    return;
                }

                if(!this.virtual){
                    let trs = this.$refs.main_table.querySelectorAll("tr");
                    let bottom = box.getBoundingClientRect().bottom;
                    let i = 0;
                    for(i = 0; i < trs.length; i++){
                        let tr = trs[i];
                        if(tr.getBoundingClientRect().bottom >= bottom){
                            break;
                        }
                    }
                    i = Math.max(i - 2, 0);
                    let rowNo = this.getRowNo(this.data[i], i);
                    this.pageNo = parseInt(rowNo / this.pageSize) + 1;
                    return;
                }

                // 按行号计算页码
                let bottom = box.scrollTop + box.clientHeight;
                let i = parseInt(bottom / this.rowHeight) - 2;
                let rowNo = this.getRowNo(this.data[i], i);
                this.pageNo = parseInt(rowNo / this.pageSize) + 1;

                this.scrollBox.top = box.scrollTop;
            },

            scrollResize(){
                let $lm = this.$refs.load_more;
                if(!$lm){
                    this.scrollBox.height = 0;
                }
                else{
                    this.scrollBox.height = $lm.$el.getBoundingClientRect().height;
                }
            },

            onRefresh(success){
                let self = this;
                let callback = () => {
                    self.ScrollLeft();
                    success();
                };
                self.$emit("refresh", callback);
            },
            onLoad(success){
                let self = this;
                let callback = () => {
                    success();
                };
                self.$emit("load-more", callback);
            },
            onRowClick(row, i){
                this.$emit("row-click", row, i);
            },

            ScrollLeft(l = 0, duration = 400){
                let refs = this.$refs;
                refs.main_table && $(refs.main_table).animate({scrollLeft: l}, duration);
                refs.top_table && $(refs.top_table).animate({scrollLeft: l}, duration);
            },
            ScrollTop(t = 0){
                if(this.$refs.load_more){
                    this.$refs.load_more.ScrollTop(t);
                }
            },

            LoadSuccess(){
                this.$refs.load_more.LoadSuccess();
            }
        },
        mounted(){
            this.setCols();
            this.isActive = true;
        },
        activated(){
            this.isActive = true;
        },
        deactivated(){
            this.isActive = false;
        },
        beforeDestroy(){
            this.isActive = false;
        }
    };
</script>
