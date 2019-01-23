odoo.define('web_widget_embed.FieldEmbed', function(require) {
    "use strict";

    var core = require('web.core');

    var FieldChar = core.form_widget_registry.get('char');

    var FieldEmbed = FieldChar.extend({
        template: 'FieldEmbed',

        render_value: function() {
            var self = this;
            self._super();
            if (self.get("effective_readonly")) {
                self.$el.attr('src', self.get('value'))
            }
        }

    });

    core.form_widget_registry.add('embed', FieldEmbed);

    return FieldEmbed;

});
