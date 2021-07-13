// Show a big banner in the top of the page if the context has been
// Changed in another tab or window (in the same browser)

var con = [];
var lastCtx = null;

addEventListener(
    "connect",
    function (ee) {
        "use strict";

        var port = ee.ports[0];
        con.push(port);

        port.onmessage = function (e) {
            var newCtx = e.data;

            if (lastCtx && newCtx !== lastCtx) {
                con.forEach(function (eport) {
                    eport.postMessage({
                        type: "newCtx",
                        newCtx: newCtx,
                        lastCtx: lastCtx,
                    });
                });
            }
            lastCtx = newCtx;
        };
    },
    false
);
