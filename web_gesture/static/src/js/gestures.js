odoo.define('web_gestures', function (require) {
    "use strict";

    var core = require('web.core');
    var QWeb = core.qweb;
    var _t = core._t;
    var Pager = require('web.Pager');

    Pager.include({
        start: function(){
            var res = this._super.apply(this);
            if ((!(/android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(navigator.userAgent.toLowerCase())))) {
                // Do not initialize on desktop browsers
                return;
            }
            var self = this;
            var content = $(".o_content");
            this.hammertime = new Hammer(content.get(0));
            this.hammertime.on('swipeleft', function(ev) {
                self.next();
            });
            this.hammertime.on('swiperight', function(ev) {
                self.previous();
            });
            return res;
        }
    });

});
