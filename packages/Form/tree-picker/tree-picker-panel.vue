<template>
    <div class="mue-tree-picker-panel">
        <div class="panel-container">
            <div v-for="option in options" :key="option.code" :checked="(values || []).indexOf(option.code) > -1"
                 class="panel-item" :class="{current: value === option.code}" @click="onOpen(option)">
                <a class="check-btn" @click="onCheck(option)" v-if="PICKER.multiple">
                    <i v-if="option.$count === option.$checked" class="fa fa-check-square-o"></i>
                    <i v-else-if="option.$checked === 0" class="fa fa-square-o"></i>
                    <i v-else class="fa fa-minus-square-o"></i>
                </a>
                <span class="label">{{option.name}}</span>
            </div>
        </div>
    </div>
</template>

<script type="text/ecmascript-6">
    export default {
        name: 'MueTreePickerPanel',
        inject: {
            PICKER: "PICKER"
        },
        props: [
            "options", "value", "values"
        ],
        data() {
            return {
            }
        },
        methods: {
            onOpen(opt) {
                this.PICKER.updateCurrents(opt);
            },
            onCheck(opt){
                this.PICKER.updateChecks(opt);
            }
        }
    };
</script>
