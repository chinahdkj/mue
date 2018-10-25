import MueChart from './src/index';

MueChart.install = function(Vue){
    Vue.component(MueChart.name, MueChart);
};

export default MueChart;
