import Chart from './src/index';

Chart.install = function(Vue){
    Vue.component(Chart.name, Chart);
};

export default Chart;
