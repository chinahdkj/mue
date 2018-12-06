import Page from './src/page';

Page.install = function(Vue){
    Vue.component(Page.name, Page);
};

export default Page;
