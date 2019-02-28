<template>
    <div class="mue-sort-picker">
        <div v-for="item in data" class="mue-sort-picker__item" :key="item.code"
             :style="{width: typeof itemWidth === 'string' ? itemWidth : (itemWidth + 'px')}"
             @click="changeSort(item)" :class="{'is-active' : item.code === field}">
            <div class="mue-sort-picker__item-name">{{item.name}}</div>
            <van-icon class="mue-sort-picker__item-sort" name="ascending"
                      :class="{'is-active' : item.code === field && 'asc' === type}"
                      @click.stop="changeSort(item, 'asc')"/>
            <van-icon class="mue-sort-picker__item-sort" name="descending"
                      :class="{'is-active' : item.code === field && 'desc' === type}"
                      @click.stop="changeSort(item, 'desc')"/>
        </div>
    </div>
</template>

<script>
    const SORT_TYPES = ["", "asc", "desc"];

    export default {
        name: "MueSortPicker",
        components: {},
        props: {
            data: {type: Array, default: []},
            itemWidth: {type: [Number, String], default: "100%"},
            sortField: {type: String, default: ""},
            sortType: {
                type: String, default: "", validator(v){
                    return SORT_TYPES.indexOf(v) > -1;
                }
            },
        },
        data(){
            return {field: "", type: ""};
        },
        watch: {
            sortField: {
                immediate: true,
                handler(v){
                    this.field = v;
                }
            },
            sortType: {
                immediate: true,
                handler(v){
                    this.type = v;
                }
            }
        },
        methods: {
            changeSort({code}, type){
                let field = code, ty = "";
                if(code === this.field){
                    if(type == null){
                        ty = SORT_TYPES.indexOf(this.type);
                        ty = SORT_TYPES[ty + 1] || "";
                    }
                    else{
                        ty = type === this.type ? "" : type;
                    }
                }
                else{
                    ty = type || "asc";
                }

                if(!ty){
                    field = "";
                }

                if(ty === this.type && field === this.field){
                    return;
                }
                this.type = ty;
                this.field = field;
                this.$emit("update:sortField", field);
                this.$emit("update:sortType", ty);
                this.$emit("change", field, ty);
            }
        }
    }
</script>