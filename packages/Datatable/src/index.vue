<template>
    <div class="mue-datatable" v-resize="onResize" 
         :class="{'no-border': noborder, 'border-both': !noborder && borderEffect === 'both'}">
        <div class="mue-datatable-header" v-show="headerVisibel" :style="{height: headerHeight}">
            <div class="mue-datatable-fixed" v-if="fixedWidth > 0"
                 :style="{width:fixedWidth + 'px' }">
                <table class="mue-datatable__inner-table"
                       :style="{width: tableWidth + 'px'}">

                    <col-group :columns="colFields"/>

                    <thead>
                    <tr v-for="(r , ii) in cols" :key="ii">
                        <th v-for="(c, i) in r" :key="i" :colspan="c.colspan" :rowspan="c.rowspan">
                            <a v-if="c.fixed" :style="{'text-align': c.align || 'center'}" :class="{'mue-datatable-selection':c.type === 'selection'}">
                                <span :class="sortCls(c)" @click="onChangeSort(c)" v-if="c.type !== 'selection'">
                                    <slot v-if="c.slot && $slots[c.slot]" :name="c.slot">
                                    </slot>
                                    <template v-else>
                                        {{c.title}}
                                    </template>
                                    <i class="icon-asc fa fa-caret-up" aria-hidden="true"></i>
                                    <i class="icon-desc fa fa-caret-down" aria-hidden="true"></i>
                                </span>
                                <span :class="sortCls(c)" v-else>
                                    <van-checkbox v-model="allCheck" @change="onCheckChange"></van-checkbox>
                                </span>
                            </a>
                        </th>
                    </tr>
                    </thead>

                </table>
            </div>

            <div class="mue-datatable-center" :style="[centerWidth]"
                 @touchstart="onScrollXStart($event)" @touchmove="onScrollXMove($event)"
                 @touchend="onScrollXEnd()">
                <table class="mue-datatable__inner-table" ref="top_table"
                       :style="{width: tableWidth - fixedWidth + 'px'}">

                    <col-group :columns="colFields" filter/>

                    <thead>
                    <tr v-for="(r , ii) in cols" :key="ii">
                        <th v-for="(c, i) in r" :key="i" :colspan="c.colspan" v-if="!c.fixed"
                            :rowspan="c.rowspan">
                            <a v-if="!c.fixed" :style="{'text-align': c.align || 'center'}" :class="{'mue-datatable-selection':c.type === 'selection'}">
                                <span :class="sortCls(c)" @click="onChangeSort(c)" v-if="c.type !== 'selection'">
                                    <slot v-if="c.slot && $slots[c.slot]" :name="c.slot">
                                    </slot>
                                    <template v-else>
                                        {{c.title}}
                                    </template>
                                    <i class="icon-asc fa fa-caret-up" aria-hidden="true"></i>
                                    <i class="icon-desc fa fa-caret-down" aria-hidden="true"></i>
                                </span>
                                <span :class="sortCls(c)" v-else>
                                    <van-checkbox v-model="allCheck" @change="onCheckChange"></van-checkbox>
                                </span>
                            </a>
                        </th>
                    </tr>
                    </thead>

                </table>
            </div>
        </div>

        <div class="mue-datatable-main" style="overflow: auto"
             :style="headerVisibel ? {'border-top-width': headerHeight} : {}">

            <mue-load-more ref="load_more" @refresh="onRefresh" @load-more="onLoad"
                           @scroll-change="onScrollY" :dis-refresh="!$listeners['refresh']"
                           :dis-load-more="!$listeners['load-more'] || total === 0"
                           :all-loaded="data.length >= total" :all-loaded-text="allLoadedText"
                           :page-no="pageNo" :page-total="pageTotal" :scrollbar="scrollbar">

                <mue-empty v-if="total === 0"></mue-empty>

                <div v-show="total !== 0" class="mue-datatable-scroller"
                     :class="{'is-virtual': virtual}" :style="mainHeight">

                    <template v-if="!virtual">
                        <div class="mue-datatable-fixed" v-if="fixedWidth > 0"
                             :style="[{width: fixedWidth + 'px' }]">

                            <table class="mue-datatable__inner-table"
                                   :style="[{width: tableWidth + 'px'}]">
                                <col-group :columns="colFields"/>
                                <table-body :rows="dataRows" :is-fixed="true" :start="0"/>
                            </table>
                        </div>

                        <div class="mue-datatable-center" :style="[centerWidth]"
                             @touchstart="onScrollXStart($event)" @touchmove="onScrollXMove($event)"
                             @touchend="onScrollXEnd()">

                            <table class="mue-datatable__inner-table" ref="main_table"
                                   :style="[{width: tableWidth - fixedWidth + 'px'}]">
                                <col-group :columns="colFields" filter/>
                                <table-body :rows="dataRows" :is-fixed="false" :start="0"/>
                            </table>

                        </div>
                    </template>

                    <template v-else>
                        <div class="mue-datatable-fixed" v-if="fixedWidth > 0"
                             :style="[{width: fixedWidth + 'px' }]">

                            <table class="mue-datatable__inner-table" :style="[{width: tableWidth + 'px'},
                                {'margin-top': yScroller.marginTop}]">
                                <col-group :columns="colFields"/>
                                <table-body :rows="vrows" :is-fixed="true"
                                            :start="yScroller.start"/>
                            </table>
                        </div>

                        <div class="mue-datatable-center" :style="[centerWidth]"
                             @touchstart="onScrollXStart($event)" @touchmove="onScrollXMove($event)"
                             @touchend="onScrollXEnd()">

                            <table class="mue-datatable__inner-table" ref="main_table"
                                   :style="[{width: tableWidth - fixedWidth + 'px'},
                                   {'margin-top': yScroller.marginTop}]">
                                <col-group :columns="colFields" filter/>
                                <table-body :rows="vrows" :is-fixed="false"
                                            :start="yScroller.start"/>
                            </table>

                        </div>
                    </template>


                </div>

            </mue-load-more>

        </div>
    </div>
</template>
<script>

    import colGroup from "./col-group";
    // import cell from "./cell";
    import tableBody from "./table-body";
    import {objectGet} from "../../../src/utils/object";
    import {getStyle, setStyle} from "../../../src/utils/dom";
    // import BETTER_SCROLL from "better-scroll";

    import {localeMixin, t} from "../../../src/locale";

    export default {
        mixins: [localeMixin],
        name: "MueDatatable",
        components: {colGroup, tableBody},
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
            rowKey: {type: String, default: "_id"},
            rowClass: {type: [String, Function], default: ""},
            rowHeight: {type: Number, default: 48}, // 行高
            stripe: {type: Boolean, default: false}, // 斑马线
            noborder: {type: Boolean, default: false}, // 不显示边框
            borderEffect: {
                type: String, default: "row", validator(v){
                    return ["row", "both"].indexOf(v) > -1;
                }
            },
            sort: {type: Object, default: null}, // 排序
            pageSize: {type: Number, default: 0},
            rowNo: {type: [String, Function], default: ""},
            virtual: {type: Boolean, default: true}, // 虚拟渲染，可视区域之外不渲染
            scrollbar: {type: [Object, Boolean], default: false}, //是否启用滚动条
            bindings: {type: Object, default: null}, //数据字典
            colSlots: {type: Object, default: null}, //用于继承插槽
            highlightCurrentRow: {type: Boolean, default: false}, //是否高亮当前行
        },
        data(){
            return {
                tableWidth: 0, //表格宽度
                fixedWidth: 0, // 固定列宽度
                cols: [], // 列渲染结构，二维数组
                colFields: [], // 列属性
                headerRows: 0, // 表头行数
                pageNo: 0,
                xScroller: {
                    x: null,
                    left: null
                },
                yScroller: {
                    top: 0,
                    timer: null,
                    start: 0,
                    end: 0,
                    marginTop: "0px"
                },
                currentKey: null,
                allCheck:false,//是否全部选中
                selection:[],//选中的列表
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
                return {height: `${this.data.length * this.rowHeight + Number(!this.border)}px`};
            },
            headerVisibel(){
                return this.header && this.colFields.length > 0;
            },
            headerHeight(){
                return (this.headerVisibel ? (this.headerRows * 42) : 0) + "px";
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
            allLoadedText(){
                return this.pageTotal > 1 ? (this.total + t("mue.dataTable.allLoadedText")) : "";
            },
            vrows(){
                return this.dataRows.slice(this.yScroller.start, this.yScroller.end);
            },
            dataRows(){
                if(this.allCheck){
                    return this.data.map(i=>{
                        return {...i,_mue_checked:true}
                    })
                }else{
                    if(this.selection.length > 0){
                        return this.data.map(i=>{
                            return {...i,_mue_checked:this.selection.find(item=>item[this.rowKey] === i[this.rowKey]) ? true : false}
                        })
                    }else{
                        return this.data.map(i=>{
                            return {...i,_mue_checked:false}
                        })
                    }
                }
            }
        },
        watch: {
            columns: {
                deep: true,
                handler(){
                    this.setCols();
                }
            },
            "yScroller.top": {
                immediate: true, handler(v){
                    if(!this.virtual){
                        return;
                    }
                    if(this.yScroller.timer){
                        clearTimeout(this.yScroller.timer);
                        this.yScroller.timer = null;
                    }
                    this.yScroller.timer = setTimeout(() => {
                        this.calcYScroller();
                    }, 100);
                }
            },
            "data.length": {
                immediate: true, handler(v) {
                    setTimeout(() => {
                        this.$refs.load_more.scroller.refresh()
                    },100)
                }
            }
        },
        methods: {
            onResize(){
                this.setCols();
                this.$nextTick(() => {
                    if(!this.$refs.main_table){
                        this.pageNo = 0;
                        return;
                    }
                    if(this.virtual){
                        this.calcYScroller();
                    }
                });
            },
            getRowIndexByKey(k) {
                return !this.rowKey ? 0 : this.dataRows.findIndex((r) => {
                    return objectGet(r, this.rowKey) === k;
                });
            },
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
                    this.highlightCurrentRow && this.rowKey && this.currentKey && row[this.rowKey] === this.currentKey ? "active" : "",
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
                    if(!col.field && col.type !== 'selection'){
                        return;
                    }
                    column.type = col.type || null;
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

                this.$nextTick(() => {
                    this.ScrollLeft(0);
                });
            },

            onScrollXStart(e){
                this.xScroller.x = e.changedTouches[0].pageX;
                this.xScroller.left = Number(
                    getStyle(this.$refs.top_table, "margin-left").replace("px", ""));
            },

            onScrollXMove(e){
                if(this.xScroller.x == null){
                    return;
                }
                let x = e.changedTouches[0].pageX;
                let diff = x - this.xScroller.x;
                let left = parseInt(this.xScroller.left + diff);
                if(left > 0){
                    left = 0;
                }
                let width = this.$refs.main_table.clientWidth -
                    this.$refs.main_table.parentElement.clientWidth;
                if(left < -width){
                    left = -width;
                }
                this.$refs.top_table && setStyle(this.$refs.top_table, "margin-left", `${left}px`);
                this.$refs.main_table &&
                setStyle(this.$refs.main_table, "margin-left", `${left}px`);
            },

            onScrollXEnd(){
                this.xScroller.x = null;
                this.xScroller.left = 0;
            },

            onScrollY(box, content){
                if(!this.$refs.main_table){
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
                    this.pageNo = this.pageSize ? (parseInt(rowNo / this.pageSize) + 1) : 0;
                    return;
                }

                // 按行号计算页码
                let scrollTop = box.getBoundingClientRect().top -
                    content.getBoundingClientRect().top;
                let bottom = scrollTop + box.clientHeight;
                let i = parseInt(bottom / this.rowHeight) - 2;
                let rowNo = this.getRowNo(this.data[i], i);
                this.pageNo = this.pageSize ? (parseInt(rowNo / this.pageSize) + 1) : 0;

                this.yScroller.top = scrollTop;
            },

            calcYScroller(){
                let vheight = this.$el.getBoundingClientRect().height;
                let vhalf = parseInt(vheight / this.rowHeight / 2) + 1;
                let start = Math.max(parseInt(this.yScroller.top / this.rowHeight) - vhalf, 0);
                this.yScroller.start = start;
                this.yScroller.end = start + vhalf * 4;
                this.yScroller.marginTop = `${this.rowHeight * start}px`;
            },

            onRefresh(success){
                let self = this;
                self.selection = []
                let callback = () => {
                    this.$nextTick(() => {
                        self.ScrollLeft();
                        success();
                    });
                };
                self.$emit("refresh", callback);
            },
            onLoad(success){
                let self = this;
                let callback = () => {
                    this.$nextTick(() => {
                        success();
                    });
                };
                self.$emit("load-more", callback);
            },
            onRowClick(row, i){
                if(this.rowKey && row[this.rowKey]) {
                    this.currentKey = row[this.rowKey];
                }

                this.$emit("row-click", row, i);
            },

            onCheckChange(){
                if(!this.allCheck){
                    this.selection = []
                }
                this.onSelectionChange()
            },

            onSelectionChange(){
                this.selection = this.dataRows.filter(data => data._mue_checked)
                this.$emit('selection-change',this.selection)
            },

            getSelection(){
                return this.selection
            },

            ScrollLeft(l = 0){
                this.$refs.top_table && setStyle(this.$refs.top_table, "margin-left", `0`);
                this.$refs.main_table && setStyle(this.$refs.main_table, "margin-left", `0`);
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
            // this.initScrollX("top_table");
            // this.initScrollX("main_table");
            this.setCols();
        }
    };
</script>
