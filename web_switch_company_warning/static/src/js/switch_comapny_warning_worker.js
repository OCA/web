//Show a big banner in the top of the page if the company has been
//changed in another tab or window (in the same browser)

var con = [];

var lastCtx  = null;

addEventListener("connect", function(ee) {
    var port = ee.ports[0];
    con.push(port);

    port.onmessage = function (e) { //addEventListener doesnt seams to work well 
        var newCtx = e.data;

        if (lastCtx && newCtx != lastCtx) {
            con.map(function (eport) {
                eport.postMessage({ type: 'newCtx', "newCtx": newCtx, "lastCtx": lastCtx});
            });
        }
        lastCtx = newCtx;
    };

}, false);
