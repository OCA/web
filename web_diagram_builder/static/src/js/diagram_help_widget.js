odoo.define('web_diagram_builder.DiagramHelpWidget', function (require) {
"use strict";

var Widget = require('web.Widget');
var widgetRegistry = require('web.widget_registry');
var core = require('web.core');

var QWeb = core.qweb;

var DiagramHelpWidget = Widget.extend({
    template: 'web_diagram_builder.DiagramHelpWidget',
    events: {
        'click': '_onHelpClick',
    },

    _onHelpClick: function () {
        var self = this;
        this._rpc({
            model: 'web.diagram.builder',
            method: 'get_help_action',
            args: [],
        }).then(function (action) {
            self.trigger_up('do_action', {action: action});
        });
    },
});

widgetRegistry.add('diagram_help_button', DiagramHelpWidget);

return DiagramHelpWidget;

});
