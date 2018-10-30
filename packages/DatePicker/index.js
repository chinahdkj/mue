import DatePicker from './src/index';

DatePicker.install = function(Vue){
    Vue.component(DatePicker.name, DatePicker);
};

export default DatePicker;
