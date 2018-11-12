function broadcast(componentTag, eventName, params){
    this.$children.forEach(child => {
        let name = child.$options._componentTag;

        if(name === componentTag){
            child.$emit.apply(child, [eventName].concat(params));
        }
        else{
            broadcast.apply(child, [componentTag, eventName].concat([params]));
        }
    });
}

export default {
    methods: {
        findParent(componentTag){
            let parent = this.$parent || this.$root;
            let name = parent.$options._componentTag;

            while(parent && (!name || name !== componentTag)){
                parent = parent.$parent;

                if(parent){
                    name = parent.$options._componentTag;
                }
            }
            return parent;
        },
        dispatch(componentTag, eventName, params){
            let parent = this.findParent(componentTag);
            if(parent){
                parent.$emit.apply(parent, [eventName].concat(params));
            }
        },
        broadcast(componentTag, eventName, params){
            broadcast.call(this, componentTag, eventName, params);
        }
    }
};
