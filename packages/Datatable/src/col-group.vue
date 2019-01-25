<template>
    <colgroup>
        <col v-for="(c, i) in columns" :key="i" :width="c.width"
             v-if="!filter || (filter && !c.fixed)"/>
    </colgroup>
</template>
<script>
    export default {
        props: {
            columns: {type: Array, default: []},
            filter: {type: Boolean, default: false}
        }
    };
</script>
