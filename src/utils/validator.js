import AsyncValidator from 'async-validator';

export default {
    init(rules, messages){
        let schema = new AsyncValidator(rules);
        if (messages) {
            schema.messages(messages);
        }
        return schema;
    }
};