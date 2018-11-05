import Search from './src/index';

Search.install = function(Vue){
    Vue.component(Search.name, Search);
};

export default Search;
