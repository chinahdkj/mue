import Image from "./src/index";

Image.install = function(Vue){
    Vue.component(Image.name, Image);
};

export default Image;
