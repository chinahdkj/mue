import Form from './src/form';
import FormItemGroup from './src/form-item-group';
import FormItem from './src/form-item';

import Input from './input/index';
import Select from './select/index';
import Textarea from './textarea/index';
import ImgUpload from './img-upload/index'
import Upload from './upload/index'
import TreePicker from './tree-picker/index'

import GisPoint from './gis-point/index'
let cmps = [Form, FormItemGroup, FormItem, Input, Select, Textarea, ImgUpload, Upload, GisPoint, TreePicker];

cmps.forEach((cmp) => {
    cmp.install = (Vue) => {
        Vue.component(cmp.name, cmp);
    };
});

export default {...cmps};
