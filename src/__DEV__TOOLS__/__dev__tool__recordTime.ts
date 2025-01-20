let intervalID: NodeJS.Timeout;
let intialSecond = 0;
export const __dev__tool__recordTime = (() => {


  return {
    start: start(intialSecond),
    end: end(intialSecond),
  };
})();

function start(second: number) {
  return () => {
    intervalID = setInterval(() => {
      intialSecond += 1;
    }, 1000);
  };
}

function end(second: number) {
  return () => {
    clearInterval(intervalID);
    return intialSecond;
  };
}
