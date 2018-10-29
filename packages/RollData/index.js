import RollData from './src/roll-data';
import RollDataGroup from './src/roll-data-group';

RollData.install = function(Vue){
    Vue.component(RollData.name, RollData);
};

RollDataGroup.install = function(Vue){
    Vue.component(RollDataGroup.name, RollDataGroup);
};

export {RollData, RollDataGroup};
