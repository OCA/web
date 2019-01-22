odoo.define('web_widget_iframe.FieldIframe', function(require) {
    "use strict";

    var core = require('web.core');

    var FieldChar = core.form_widget_registry.get('char');

    var FieldIframe = FieldChar.extend({
        template: 'FieldIframe',

        render_value: function() {
            var self = this;
            self._super();
            if (self.get("effective_readonly")) {
                self.$el.attr('src', self.get('value'))
            }
        }

    });

    core.form_widget_registry.add('iframe', FieldIframe);

    return FieldIframe;

});
