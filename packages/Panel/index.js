import MuePanel from './src/index';

MuePanel.install = function(Vue){
    Vue.component(MuePanel.name, MuePanel);
};

export default MuePanel;
