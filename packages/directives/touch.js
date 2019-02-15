export default {
    name: "touch",
    bind(el, binding){
        let start = {x: null, y: null, t: null};
        let touchStart = (e) => {
            e.preventDefault();
            start = {
                x: e.changedTouches[0].pageX, y: e.changedTouches[0].pageY, t: new Date().getTime()
            };
        };

        let touchEnd = (e) => {
            let end = {
                x: e.changedTouches[0].pageX, y: e.changedTouches[0].pageY, t: new Date().getTime()
            };
            let disx = end.x - start.x;
            let disy = end.y - start.y;
            let dist = end.t - start.t;

            if(binding.modifiers.swipe && (Math.abs(disx) >= 10 || Math.abs(disy) >= 100)){
                if(!binding.modifiers.direction){
                    binding.value("swipe", start, end);
                }
                else{
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

                    binding.value(direction.join("-"), start, end);
                }

                return;
            }

            if(binding.modifiers.long && dist >= 500){
                binding.value("long-tap", start, end);
                return;
            }

            binding.value("tap", start, end);

        };
        el.TOUCH_EVENTS = {start: touchStart, end: touchEnd};
        el.addEventListener("touchstart", el.TOUCH_EVENTS.start);
        el.addEventListener("touchend", el.TOUCH_EVENTS.end);
    },
    unbind(el, binding){
        el.removeEventListener("touchstart", el.TOUCH_EVENTS.start);
        el.removeEventListener("touchend", el.TOUCH_EVENTS.end);
    }
};