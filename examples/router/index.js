import Vue from 'vue';
import Router from 'vue-router';

import vbutton from "../views/vant/button";
import vtab from "../views/vant/tab";
import vcheckbox from "../views/vant/checkbox";
import vradio from "../views/vant/radio";

import container from "../views/mue/container";
import panel from "../views/mue/panel";
import chart from "../views/mue/chart";
import rolldata from "../views/mue/rolldata";
import datepicker from "../views/mue/datepicker";
import daterangepicker from "../views/mue/daterangepicker";
import search from "../views/mue/search";
import popover from "../views/mue/popover";
import tabs from "../views/mue/tabs";
import loading from "../views/mue/loading";
import datatable from "../views/mue/datatable";
import formitem from "../views/mue/formitem";

Vue.use(Router);

export default new Router({
    routes: [
        {
            path: '/vant/button',
            name: 'vant_button',
            component: vbutton
        },
        {
            path: '/vant/checkbox',
            name: 'vant_checkbox',
            component: vcheckbox
        },
        {
            path: '/vant/radio',
            name: 'vant_radio',
            component: vradio
        },
        {
            path: '/vant/tab',
            name: 'vant_tab',
            component: vtab
        },

        {
            path: '/mue/container',
            name: 'mue_container',
            component: container
        },

        {
            path: '/mue/chart',
            name: 'mue_chart',
            component: chart
        },
        {
            path: '/mue/panel',
            name: 'mue_panel',
            component: panel
        },
        {
            path: '/mue/rolldata',
            name: 'mue_roll-data',
            component: rolldata
        },
        {
            path: '/mue/datepicker',
            name: 'mue_date-picker',
            component: datepicker
        },
        {
            path: '/mue/daterangepicker',
            name: 'mue_date-range-picker',
            component: daterangepicker
        },
        {
            path: '/mue/search',
            name: 'mue_search',
            component: search
        },
        {
            path: '/mue/popover',
            name: 'mue_popover',
            component: popover
        },
        {
            path: '/mue/tabs',
            name: 'mue_tabs',
            component: tabs
        },
        {
            path: '/mue/loading',
            name: 'mue_loading',
            component: loading
        },
        {
            path: '/mue/datatable',
            name: 'mue_datatable',
            component: datatable
        },
        {
            path: '/mue/formitem',
            name: 'mue_formitem',
            component: formitem
        }
    ]
})
