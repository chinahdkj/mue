import Map from './src/index';

Map.install = function(Vue){
    Vue.component(Map.name, Map);
};

export default Map;
