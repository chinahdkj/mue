const CONTEXT_MENU = (e) => {
    e.preventDefault();
};

const GET_ACTION = (value, name) => {
    if(typeof value === "function" && name === "tap"){
        return value;
    }
    if(value && typeof value === "object" && typeof value[name] === "function"){
        return value[name];
    }
    return null;
};

const CREATE_ACTIONS = (el, binding) => {
    let start = null;
    let longTap = false;
    let timer = null;

    let actions = {
        tap: GET_ACTION(binding.value, "tap"),
        long: GET_ACTION(binding.value, "long"),
        swipe: GET_ACTION(binding.value, "swipe"),
    };

    let clearTimer = () => {
        if(timer){
            clearTimeout(timer);
            timer = null;
        }
    };

    let touchStart = (e) => {
        longTap = false;
        start = {x: e.changedTouches[0].pageX, y: e.changedTouches[0].pageY};

        if(typeof actions.long === "function"){
            timer = setTimeout(() => {
                longTap = true;
                actions.long();
            }, 1000);
        }
    };

    let touchEnd = (e) => {
        if(!start){
            return;
        }
        let end = {
            x: e.changedTouches[0].pageX, y: e.changedTouches[0].pageY
        };
        let disx = end.x - start.x;
        let disy = end.y - start.y;

        if((Math.abs(disx) >= 10 || Math.abs(disy) >= 100)){
            if(typeof actions.swipe === "function"){

                let direction = [];
                if(disx >= 10){
                    direction.push("right");
                }
                else if(disx <= -10){
                    direction.push("left");
                }

                if(disy >= 100){
                    direction.push("down");
                }
                else if(disy <= -100){
                    direction.push("up");
                }
                actions.swipe(direction.join("-"));
            }
            return;
        }

        if(typeof actions.long != "function" || !longTap){
            // 短按删除长按计时器
            clearTimer();
            typeof actions.tap === "function" && actions.tap();
        }
    };

    let touchMove = (e) => {
        // 移动删除长按计时器
        let disx = e.changedTouches[0].pageX - start.x;
        let disy = e.changedTouches[0].pageY - start.y;
        if(Math.abs(disx) >= 10 || Math.abs(disy) >= 100){
            clearTimer();
        }
    };


    return {start: touchStart, end: touchEnd, move: touchMove};
};

export default {
    name: "touch",
    bind(el, binding){
        el.TOUCH_EVENTS = CREATE_ACTIONS(el, binding);
        el.addEventListener("contextmenu", CONTEXT_MENU);
        el.addEventListener("touchstart", el.TOUCH_EVENTS.start);
        el.addEventListener("touchmove", el.TOUCH_EVENTS.move);
        el.addEventListener("touchend", el.TOUCH_EVENTS.end);
    },
    componentUpdated(el, binding){
        el.removeEventListener("touchstart", el.TOUCH_EVENTS.start);
        el.removeEventListener("touchmove", el.TOUCH_EVENTS.move);
        el.removeEventListener("touchend", el.TOUCH_EVENTS.end);
        
        el.TOUCH_EVENTS = CREATE_ACTIONS(el, binding);

        el.addEventListener("touchstart", el.TOUCH_EVENTS.start);
        el.addEventListener("touchmove", el.TOUCH_EVENTS.move);
        el.addEventListener("touchend", el.TOUCH_EVENTS.end);
    },
    unbind(el){
        el.removeEventListener("contextmenu", CONTEXT_MENU);
        el.removeEventListener("touchstart", el.TOUCH_EVENTS.start);
        el.removeEventListener("touchmove", el.TOUCH_EVENTS.move);
        el.removeEventListener("touchend", el.TOUCH_EVENTS.end);
    }
};