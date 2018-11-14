export function GetType(fmt){

    if(fmt.indexOf("H") > -1){
        return fmt.indexOf("D") > -1 ? "datetime" : "time";
    }
    return fmt.indexOf("D") > -1 ? "date" : "year-month";

}
