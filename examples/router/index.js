import Vue from 'vue';
import Router from 'vue-router';
import vbutton from "../views/vant/button";

import panel from "../views/mue/panel";
import chart from "../views/mue/chart";
import rolldata from "../views/mue/rolldata";

Vue.use(Router);

export default new Router({
    routes: [
        {
            path: '/vant/button',
            name: 'vant_button',
            component: vbutton
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
    ]
})
