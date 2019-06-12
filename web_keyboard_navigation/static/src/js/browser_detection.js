odoo.define('web.BrowserDetection', function (require) {
    "use strict";
    var Class = require('web.Class');

    var BrowserDetection = Class.extend({
        isOsMac: function () {
            return navigator.platform.toLowerCase().indexOf('mac') !== -1;
        },
        isBrowserChrome: function () {
            return $.browser.chrome &&
                navigator.userAgent.toLocaleLowerCase().indexOf('edge') === -1;
        },
    });
    return BrowserDetection;
});

