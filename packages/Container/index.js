import Container from './src/container';
import Header from './src/header';
import Footer from './src/footer';
import Main from './src/main';

Container.install = function(Vue){
    Vue.component(Container.name, Container);
};

Header.install = function(Vue){
    Vue.component(Header.name, Header);
};

Footer.install = function(Vue){
    Vue.component(Footer.name, Footer);
};

Main.install = function(Vue){
    Vue.component(Main.name, Main);
};

export {Container, Header, Footer, Main};
