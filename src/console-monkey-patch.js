let originalLog = null;
let originalInfo = null;
const logArray = [];

export default function console_monkey_patch() {
    //If react multicalls this, do nothing
    if (originalLog) return;

    originalLog = console.log;
    originalInfo = console.info;

    // Intercept console.log
    console.log = function (...args) {
        captureIfStrudel(args);
        originalLog.apply(console, args);
    };

    function captureIfStrudel(args) {
        const str = args.map(arg => {
            if (typeof arg === 'string') return arg;
            return String(arg);
        }).join(" ");


        // Check for [hap] or just look for our pattern directly
        if (str.includes("[hap]") || /\w+:[\d.]+/.test(str)) {
            // Clean up the message
            let message = str
                .replace(/%c/g, '')  // Remove color codes
                .replace(/\[hap\]\s*/gi, '')  // Remove [hap] prefix
                .trim();

            const match = message.match(/(\w+):([\d.]+)/);
            if (match) {
                const cleanMessage = `${match[1]}:${match[2]}`;
                

                logArray.push(cleanMessage);
                if (logArray.length > 100) {
                    logArray.splice(0, 1);
                }

       
                const event = new CustomEvent("d3Data", { detail: [...logArray] });
                document.dispatchEvent(event);
            }
        }
    }

}

export function getD3Data() {
    return [...logArray];
}

export function subscribe(eventName, listener) {
    document.addEventListener(eventName, listener);
}

export function unsubscribe(eventName, listener) {
    document.removeEventListener(eventName, listener);
}