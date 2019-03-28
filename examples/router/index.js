import Vue from 'vue'
import Router from 'vue-router'
import {InitHook} from "../../src/router";

Vue.use(Router);

const routes = [
    {
        path: '/vant/button',
        name: 'vant_button',
        component: () => import("../views/vant/button")
    },
    {
        path: '/vant/checkbox',
        name: 'vant_checkbox',
        component: () => import("../views/vant/checkbox")
    },
    {
        path: '/vant/radio',
        name: 'vant_radio',
        component: () => import("../views/vant/radio")
    },
    {
        path: '/vant/tab',
        name: 'vant_tab',
        component: () => import("../views/vant/tab")
    },
    {
        path: '/vant/tabbar',
        name: 'vant_tabbar',
        component: () => import("../views/vant/tabbar")
    },
    {
        path: '/vant/actionsheet',
        name: 'vant_actionsheet',
        component: () => import("../views/vant/actionsheet")
    },

    {
        path: '/mue/page',
        name: 'mue_page',
        component: () => import("../views/mue/page")
    },
    {
        path: '/mue/container',
        name: 'mue_container',
        component: () => import("../views/mue/container")
    },
    {
        path: '/mue/chart',
        name: 'mue_chart',
        component: () => import("../views/mue/chart")
    },
    {
        path: '/mue/panel',
        name: 'mue_panel',
        component: () => import("../views/mue/panel")
    },
    {
        path: '/mue/rolldata',
        name: 'mue_roll-data',
        component: () => import("../views/mue/rolldata")
    },
    {
        path: '/mue/datepicker',
        name: 'mue_date-picker',
        component: () => import("../views/mue/datepicker")
    },
    {
        path: '/mue/daterangepicker',
        name: 'mue_date-range-picker',
        component: () => import("../views/mue/daterangepicker")
    },
    {
        path: '/mue/search',
        name: 'mue_search',
        component: () => import("../views/mue/search")
    },
    {
        path: '/mue/popover',
        name: 'mue_popover',
        component: () => import("../views/mue/popover")
    },
    {
        path: '/mue/tabs',
        name: 'mue_tabs',
        component: () => import("../views/mue/tabs")
    },
    {
        path: '/mue/loading',
        name: 'mue_loading',
        component: () => import("../views/mue/loading")
    },
    {
        path: '/mue/datatable',
        name: 'mue_datatable',
        component: () => import("../views/mue/datatable")
    },
    {
        path: '/mue/form',
        name: 'mue_form',
        component: () => import("../views/mue/form")
    },
    {
        path: '/mue/formitem',
        name: 'mue_formitem',
        component: () => import("../views/mue/formitem")
    },
    {
        path: '/mue/loadmore',
        name: 'mue_loadmore',
        component: () => import("../views/mue/loadmore")
    },
    {
        path: '/mue/dvr',
        name: 'mue_dvr',
        component: () => import("../views/mue/dvr")
    },
    {
        path: '/mue/sortpicker',
        name: 'sort_picker',
        component: () => import("../views/mue/sortpicker")
    }
];

const router = new Router({routes});

InitHook(router);

export default router;