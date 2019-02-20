import Dvr from './src/index';
import DvrVideo from './src/video';

let cmps = [Dvr, DvrVideo];

cmps.forEach((cmp) => {
    cmp.install = (Vue) => {
        Vue.component(cmp.name, cmp);
    };
});

export default {...cmps};
