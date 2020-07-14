import Form from './src/form';
import FormItemGroup from './src/form-item-group';
import FormItem from './src/form-item';

import Input from './input/index';
import Select from './select/index';
import Textarea from './textarea/index';
import ImgUpload from './img-upload/index'
import Upload from './upload/index'
import TreePicker from './tree-picker/index'
import Signature from './signature/index'
import Watermeter from "./watermeter/index"

import GisPoint from './gis-point/index'
import SoundRecord from './sound-record/index'
import BlueAlarm from './blue-alarm/index'

let cmps = [Form, FormItemGroup, FormItem, Input, Select, Textarea, ImgUpload,
    Upload, GisPoint, TreePicker, SoundRecord, Signature, Watermeter, BlueAlarm];

cmps.forEach((cmp) => {
    cmp.install = (Vue) => {
        Vue.component(cmp.name, cmp);
    };
});

export default {...cmps};
