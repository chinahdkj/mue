export function GetType(fmt){

    if(fmt.indexOf("H") > -1){
        return fmt.indexOf("D") > -1 ? "datetime" : "time";
    }
    if(fmt.indexOf("D") > -1){
        return "date";
    }
    if(fmt.indexOf("M") > -1){
        return "year-month";
    }
    return "year";

}
