odoo.define('web_widget_open_tab.FieldOpen', function(require) {
    "use strict";

    var AbstractField = require('web.AbstractField');
    var field_registry = require('web.field_registry');
    var ListRenderer = require('web.ListRenderer');

    var FieldOpen = AbstractField.extend({
        description: "",
        supportedFieldTypes: ['integer'],
        events: _.extend({}, AbstractField.prototype.events, {
            'click': '_onClick',
        }),
        isSet: function () {
            return true;
        },
        _renderReadonly: function () {
            var $content = $(
                '<a href="#">'
            ).addClass('fa fa-eye');
            this.$el.append($content)
        },
        _onClick: function (ev) {
            ev.preventDefault();
            ev.stopPropagation();
            var element = $(ev.currentTarget).find('a');
            if (element != null && element[0].href != null) {
                var url = new URL(window.location.href);
                var href = url.hash.replace("list", "form") + '&id=' + this.res_id;
                window.open(href);
            }
        },
    });
    ListRenderer.include({
        // We want to simplify the header of this kind of elements
        // and disallow sorting
        _renderHeaderCell: function (node) {
            var $th = this._super.apply(this, arguments);
            if (node.attrs.widget === 'open') {
                $th.removeClass('o_column_sortable');
                $th[0].width = 1;
            }
            return $th;
        },
    });

    field_registry.add('open', FieldOpen);
    return FieldOpen;

});
