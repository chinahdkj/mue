<template>
    <div class="mue-panel">
        <div class="mue-panel-header">
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
            title: String
        },
        data(){
            return {};
        },
        methods: {},
        components: {PanelTitle},
    }
</script>
