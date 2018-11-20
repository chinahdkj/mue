import Datatable from './src/index';

Datatable.install = function(Vue){
    Vue.component(Datatable.name, Datatable);
};

export default Datatable;
