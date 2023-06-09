export const objectGet = (object, expression) => {
    if(!(object && expression)){
        throw new Error("both object and expression args are required");
    }
    let exp = expression.trim();
    if(exp in object){
        return object[exp];
    }
    return exp.split(".").reduce(function(prev, curr){
        var arr = curr.match(/(.*?)\[(.*?)\]/);
        if(arr){
            return prev && prev[arr[1]][arr[2]];
        }
        else{
            return prev && prev[curr];
        }
    }, object);
};