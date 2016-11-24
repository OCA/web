openerp.web_warning_sound = function(instance) {
    var QWeb = instance.web.qweb;
    var _t = instance.web._t;

    instance.web.FormView = instance.web.FormView.extend({
        on_processed_onchange: function(result, processed) {
            try {
                if (!_.isEmpty(result.sound)) {
                    var audio = new Audio(result.sound);
                    audio.play();
                }
            } catch(e) {
                console.error(e);
            }
            return this._super.apply(this, arguments);
        },
    });

    instance.web.CrashManager = instance.web.CrashManager.extend({
        show_warning: function(error) {
            if (!this.active) {
                return;
            }
            var re = /{{\s*sound\s*:\s*(\S*)+\s*}}/;
            var matches = error.data.fault_code.match(re);
            if (matches && matches.length == 2) {
                var audio = new Audio(matches[1]);
                audio.play();
                error.data.fault_code = error.data.fault_code.replace(re, '');
            }
            return this._super.apply(this, arguments);
        },
    });
}
