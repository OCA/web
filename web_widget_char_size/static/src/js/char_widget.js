odoo.define("web_widget_char_size.char_widget", function (require) {
    "use strict";

    var BasicFields = require("web.basic_fields");

    BasicFields.FieldChar.include({
        _renderEdit: function () {
            var def = this._super.apply(this, arguments);
            var option_size = this.nodeOptions.size;
            if (option_size && option_size > 0) {
                this.$el.attr("maxlength", option_size);
            }
            return def;
        },
    });
});
