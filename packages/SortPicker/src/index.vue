<template>
    <div class="mue-sort-picker">
        <template v-for="item in data" >
            <template v-for="ty in ['asc', 'desc']">
                <div class="mue-sort-picker__item" :key="item.code + '---' + ty"
                     :style="{width: typeof itemWidth === 'string' ? itemWidth : (itemWidth + 'px')}"
                     :class="{'is-active' : item.code === field && ty === type}"
                     @click="changeSort(item, ty)" >
                    <div class="mue-sort-picker__item-name">
                        {{item.name}}
                    </div>
                    <van-icon class="mue-sort-picker__item-sort" :name="ty + 'ending'"/>
                </div>
            </template>
        </template>
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
                    ty = type === this.type ? "" : type;
                }
                else{
                    ty = type;
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