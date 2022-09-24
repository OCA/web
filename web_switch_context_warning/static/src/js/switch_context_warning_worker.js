// Show a big banner in the top of the page if the context has been
// Changed in another tab or window (in the same browser)

window.con = [];
window.lastCtx = null;

addEventListener(
    "connect",
    function (ee) {
        "use strict";

        var port = ee.ports[0];
        window.con.push(port);

        port.onmessage = function (e) {
            var newCtx = e.data;

            if (window.lastCtx && newCtx !== window.lastCtx) {
                window.con.forEach(function (eport) {
                    eport.postMessage({
                        type: "newCtx",
                        newCtx: newCtx,
                        lastCtx: window.lastCtx,
                    });
                });
            }
            window.lastCtx = newCtx;
        };
    },
    false
);
