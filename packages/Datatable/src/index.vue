<template>
    <div class="mue-datatable">
        <div class="mue-datatable-header" v-if="headerVisibel" :style="{height: headerHeight}">
            <div class="mue-datatable-fixed" v-if="fcolFields.length > 0"
                 :style="{width:fixedWidth + 'px' }">
                <table class="mue-datatable__inner-table"
                       :style="{width: (fixedWidth + scrollWidth) + 'px'}">
                    <col-group :columns="[...fcolFields, ...colFields]"/>
                    <thead>
                    <tr v-for="(r , ii) in cols" :key="ii">
                        <th v-for="(c, i) in r" :key="i" :colspan="c.colspan" :rowspan="c.rowspan">
                            <a :style="{'text-align': c.align || 'center'}">
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

            <div ref="top_table" class="mue-datatable-center" @scroll="syncScrollX($event)"
                 :style="{width: (width - fixedWidth) + 'px'}">
                <table class="mue-datatable__inner-table"
                       :style="{width: scrollWidth + 'px'}">
                    <col-group :columns="colFields"/>
                    <thead>
                    <tr v-for="(r , ii) in cols" :key="ii">
                        <th v-for="(c, i) in r" v-if="!c.fixed" :key="i" :colspan="c.colspan"
                            :rowspan="c.rowspan">
                            <a :style="{'text-align': c.align || 'center'}">
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

        <div class="mue-datatable-main"
             :style="headerVisibel ? {'border-top-width': headerHeight} : {}">

            <mue-load-more ref="load_more" @refresh="onRefresh" @load-more="onLoad"
                           :dis-refresh="!$listeners['refresh']"
                           :dis-load-more="!$listeners['load-more']"
                           :all-loaded="data.length >= total"
                           @scroll.native="onScrollY">

                <div v-if="total === 0" class="mue-datatable-nodata">
                    <img v-if="!isNight" src="../assets/no-data.png"/>
                    <img v-else src="../assets/no-data-dark.png"/>
                    <span>暂无数据</span>
                </div>

                <div v-else class="mue-datatable-scroller">
                    <div ref="left_table" class="mue-datatable-fixed" v-if="fcolFields.length > 0"
                         :style="{width: fixedWidth + 'px' }">
                        <table class="mue-datatable__inner-table"
                               :style="{width: (fixedWidth + scrollWidth) + 'px'}">
                            <col-group :columns="[...fcolFields, ...colFields]"/>
                            <tbody>
                            <tr class="__row" v-for="(d, i) in data" :key="rowId(d, i)"
                                :class="rowCls(d, i)" @click="onRowClick(d, i)">
                                <slot name="row" :cols="[...fcolFields, ...colFields]" :row="d"
                                      :no="i">
                                    <td v-for="(c, j) in fcolFields" :key="j"
                                        :style="{'text-align': c.align || 'center', height: rowHeight + 'px', 'line-height': rowHeight + 'px'}">
                                        <slot v-if="c.tmpl && $scopedSlots[c.tmpl]" :name="c.tmpl"
                                              :row="d" :col="c" :value="getValue(d, c.field)"
                                              :no="i">
                                        </slot>
                                        <template v-else>
                                            {{getValue(d, c.field)}}
                                        </template>
                                    </td>
                                </slot>
                            </tr>
                            </tbody>
                        </table>
                    </div>

                    <div ref="main_table" class="mue-datatable-center" @scroll="onScroll($event)"
                         :style="{width: (width - fixedWidth) + 'px'}">
                        <table class="mue-datatable__inner-table"
                               :style="{width: scrollWidth + 'px'}">
                            <col-group :columns="colFields"/>
                            <tbody>
                            <tr class="__row" v-for="(d, i) in data" :key="rowId(d, i)"
                                :class="rowCls(d, i)" @click="onRowClick(d, i)">
                                <slot name="row" :cols="colFields" :row="d" :no="i">
                                    <td v-for="(c, j) in colFields" :key="j"
                                        :style="{'text-align': c.align || 'center', height: rowHeight + 'px', 'line-height': rowHeight + 'px'}">
                                        <slot v-if="c.tmpl && $scopedSlots[c.tmpl]" :name="c.tmpl"
                                              :row="d" :col="c" :value="getValue(d, c.field)"
                                              :no="i">
                                        </slot>
                                        <template v-else>
                                            {{getValue(d, c.field)}}
                                        </template>
                                    </td>
                                </slot>
                            </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

            </mue-load-more>

            <a class="mue-datatable-gotop" @click="ScrollTop(0)" v-show="pageNo > 1">
                <span>{{pageNo}}</span>
                <span>{{total}}</span>
            </a>
        </div>
    </div>
</template>
<script>
    import colGroup from "./col-group";

    export default {
        name: "MueDatatable",
        components: {colGroup},
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
            sort: {type: Object, default: null}, // 排序

            pageSize: {type: Number, default: 0},
            rowNo: {type: [String, Function], default: ""}
        },
        data(){
            return {
                width: 0, //表格宽度
                fixedWidth: 0, // 固定列宽度
                scrollWidth: 0, // 滚动列宽度
                cols: [], // 列渲染结构，二维数组
                fcolFields: [], // 锁定列属性
                colFields: [], // 滚动列属性
                headerRows: 0, // 表头行数
                pageNo: 0
            };
        },
        computed: {
            headerVisibel(){
                return this.header && (this.fcolFields.length + this.colFields.length) > 0;
            },
            headerHeight(){
                return (this.headerVisibel ? (this.headerRows * 36 + 4) : 0) + "px";
            },
            isNight(){
                return this.$root.theme === "night";
            }
        },
        watch: {
            columns: {
                deep: true,
                handler(){
                    this.setCols();
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
                let fs = field.split(".");
                let temp = row;
                for(let i = 0; i < fs.length; i++){
                    let f = fs[i];
                    if(i === fs.length - 1){
                        return temp[f];
                    }
                    else{
                        temp = temp[f] || {};
                    }
                }
                return null;
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
                    fields = [...ffields, ...fields];
                    wd = fwd + wd;
                    ffields = [];
                    fwd = 0;
                }

                this.width = tableWidth;
                this.fixedWidth = fwd;
                this.scrollWidth = wd;
                this.cols = cols;
                this.fcolFields = ffields;
                this.colFields = fields;
                this.headerRows = headerRows;
            },
            onScroll(event){
                let target = event.target;
                if(this.header){
                    this.$refs.top_table.scrollLeft = target.scrollLeft;
                }
            },
            onScrollY(){
                if(!this.pageSize){
                    this.pageNo = 0;
                    return;
                }
                let sbottom = this.$refs.load_more.$el.getBoundingClientRect().bottom;
                let trs = this.$refs.main_table.getElementsByClassName("__row");
                let i = 0;
                for(i = 0; i < trs.length; i++){
                    let tr = trs[i];
                    if(tr.getBoundingClientRect().bottom >= sbottom){
                        break;
                    }
                }
                i = Math.max(i - 1, 0);
                let rowNo = this.getRowNo(this.data[i], i);
                this.pageNo = parseInt(rowNo / this.pageSize) + 1;
            },
            syncScrollX(event){
                let target = event.target;
                if(this.$refs.main_table.scrollLeft === target.scrollLeft){
                    return;
                }
                this.ScrollLeft(target.scrollLeft, 0);
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
                if(this.$refs.main_table){
                    if(duration === 0){
                        this.$refs.main_table.scrollLeft = l;
                    }
                    else{
                        $(this.$refs.main_table).animate({scrollLeft: l}, duration);
                    }

                }
            },
            ScrollTop(t = 0){
                if(this.$refs.load_more){
                    $(this.$refs.load_more.$el).animate({scrollTop: t}, 400);
                }
            }
        },
        mounted(){
            this.setCols();
        }
    };
</script>
