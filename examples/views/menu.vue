<template>
    <div class="menus">
        <h3>ICON</h3>
        <van-cell-group border>
            <van-cell value="HEDA" @click="open('/static/font/demo_index.html', true)"/>
            <van-cell value="AWESOME" @click="open('http://www.fontawesome.com.cn/faicons/',
            true)"/>
        </van-cell-group>

        <h3>VANT-UI</h3>
        <van-cell-group border>
            <van-cell value="BUTTON" @click="open('/vant/button')"/>
            <van-cell value="CHECKBOX" @click="open('/vant/checkbox')"/>
            <van-cell value="RADIO" @click="open('/vant/radio')"/>
            <van-cell value="TAB" @click="open('/vant/tab')"/>
            <van-cell value="TABBAR" @click="open('/vant/tabbar')"/>
            <van-cell value="ACTIONSHEET" @click="open('/vant/actionsheet')"/>
        </van-cell-group>

        <h3>MUE</h3>
        <van-cell-group border>
            <!--<van-cell value="PAGE" @click="open('/mue/page')"/>-->
            <van-cell value="CONTAINER" @click="open('/mue/container')"/>
            <van-cell value="PANEL" @click="open('/mue/panel')"/>
            <van-cell value="CHART" @click="open('/mue/chart')"/>
            <van-cell value="ROLL-DATA" @click="open('/mue/rolldata')"/>
            <van-cell value="DATE-PICKER" @click="open('/mue/datepicker')"/>
            <van-cell value="DATE-RANGE-PICKER" @click="open('/mue/daterangepicker')"/>
            <van-cell value="SEARCH" @click="open('/mue/search')"/>
            <van-cell value="POPOVER" @click="open('/mue/popover')"/>
            <van-cell value="TABS" @click="open('/mue/tabs')"/>
            <van-cell value="LOADING" @click="open('/mue/loading')"/>
            <van-cell value="LOADMORE" @click="open('/mue/loadmore')"/>
            <van-cell value="DATATABLE" @click="open('/mue/datatable')"/>
            <van-cell value="DVR" @click="open('/mue/dvr')"/>
            <van-cell value="SORT-PICKER" @click="open('/mue/sortpicker')"/>
            <van-cell value="ACTIONSHEET" @click="open('/mue/actionsheet')"/>
            <van-cell value="MAP" @click="open('/mue/map')"/>
        </van-cell-group>

        <h3>FORM</h3>
        <van-cell-group border>
            <van-cell value="FORM" @click="open('/form/form')"/>
            <van-cell value="FORM-ITEM" @click="open('/form/formitem')"/>
            <van-cell value="TREE-PICKER" @click="open('/form/treepicker')"/>
        </van-cell-group>

        <h3>DINGGOV</h3>
        <van-cell-group border>
            <van-cell value="DINGGOV" @click="open('/dinggov')"/>
        </van-cell-group>

        <div class="night-switch">
            <van-button plain size="mini" type="primary" @click="toggleNight">
                {{isNight ? "暗色" : "亮色"}}
            </van-button>

            <mue-select style="width: 80px; margin-left: 10px;" v-model="lang" :data="langs"></mue-select>
<!--            <van-button v-if="lang === 'en'" plain size="mini" type="primary"-->
<!--                        @click="changeLang('zh-cn')">-->
<!--                英文-->
<!--            </van-button>-->
<!--            <van-button v-else plain size="mini" type="primary"-->
<!--                        @click="changeLang('en')">-->
<!--                中文-->
<!--            </van-button>-->
        </div>
    </div>
</template>

<script>
    export default {
        data(){
            return {
                langs: [
                    {code: "zh_cn", name: "中文"},
                    {code: "en", name: "英文"},
                    {code: "zh_tw", name: "繁体"}
                ]
            };
        },
        computed: {
            isNight(){
                return this.$root.theme === "night";
            },
            lang:{
                get(){
                    return this.$root.lang;
                },
                set(nv){
                    this.$root.lang = nv;
                    window.localStorage.setItem("language", nv);
                    window.location.reload();
                }

            }
        },
        methods: {
            open(p, _blank){
                this.$emit("open", p, _blank);
            },

            toggleNight(){
                let path = this.$route.path;
                let query = !this.isNight ? {theme: "night"} : {theme: "day"};
                this.$router.push({path, query});
            }
        }
    }
</script>

<style lang="less" scoped>
    .menus {
        position: relative;

        h3 {
            margin: 0 5px;
            height: 60px;
            line-height: 60px;
        }

        .night-switch {
            position: absolute;
            top: 17px;
            right: 15px;
            font-size: 20px;
        }
    }
</style>
