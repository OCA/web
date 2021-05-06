odoo.define("web_field_html_customizable.fields", function(require) {
    "use strict";
    var backend = require("web_editor.backend");
    backend.FieldTextHtmlSimple.include({
        _getSummernoteConfig: function() {
            var result = this._super.apply(this, arguments);
            if (this.nodeOptions.automatic_summernote_height) {
                result.height = undefined;
            }
            return result;
        },
    });
});
