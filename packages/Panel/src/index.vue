<template>
    <div class="mue-panel"
         :class="[hairline == 'none' ? '' : ('mue-panel--hairline-' + hairline),
         $slots.tools || title ? '' : 'mue-panel--no-header']">
        <div v-if="hairline != 'none'" class="mue-hairline"
             :class="'mue-hairline--' + hairline"></div>
        <div class="mue-panel-header" v-if="$slots.tools || title ">
            <panel-title :title="title"/>
            <div class="mue-panel-tools">
                <slot name="tools"></slot>
            </div>
        </div>
        <div class="mue-panel-body">
            <slot></slot>
        </div>
    </div>
</template>

<script>
    import PanelTitle from "./panel-title";

    export default {
        name: "MuePanel",
        props: {
            hairline: {
                type: String,
                default: "none",
                validator: function(v){
                    return ["none", "thin", "normal", "wide"].findIndex(p => p === v) > -1;
                }
            },
            title: String
        },
        data(){
            return {};
        },
        methods: {},
        components: {PanelTitle},
    }
</script>
