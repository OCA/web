odoo.define('text_count', function(require) {
    "use strict";

    var registry = require('web.field_registry');
    var FieldText = require('web.FieldText');

    var FieldTextCount = FieldText.extend({
        template: 'FieldTextCount',

        start: function () {
            this._super();
            var $textarea = this.$element.find('textarea')[0];
            $textarea.addEventListener("keyup", this.count_char);
        },

        count_char: function (e) {
            var len =  this.value.length;
            var counter = $(this.parentNode).find('span')[0];
            counter.innerHTML = len;
        },

        update_dom: function () {
            this._super.apply(this, arguments);
            var $textarea = this.$element.find('textarea')[0];
            this.$element.find('span')[0].innerHTML = $textarea.value.length;
        }
    });

    registry.add('text_count', FieldTextCount);

    /*
    // TODO?
    var FieldTextCountReadonly = openerp.web.page.FieldCharReadonly.extend({
        force_readonly: true
    });
    openerp.web.page.readonly.add('text_count', FieldTextCountReadonly);
    */
});
