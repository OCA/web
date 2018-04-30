// Copyright 2018 Florent de Labarre
odoo.define("web_tree_dynamic_colored_line.ListView", function(require) {
    "use strict";


    var ListRenderer = require('web.ListRenderer');

    ListRenderer.include({
        init: function() {
            this._super.apply(this, arguments);
            if (this.arch.attrs.colors) {
                this.colors = _(this.arch.attrs.colors.split(';')).chain()
                    .compact()
                    .map(function(color_pair) {
                        var pair = color_pair.split(':'),
                            color = pair[0],
                            expr = pair[1];
                        return [color, py.parse(py.tokenize(expr))];
                    }).value();
            }
        },

        _renderRow: function(record) {
            var $tr = this._super.apply(this, arguments);
            this._setColorClasses(record, $tr);
            return $tr;
        },

        _setColorClasses: function(record, $tr) {
            _.each(this.colors, function(colors) {
                if (py.PY_isTrue(py.evaluate(colors[1], record.evalContext))) {
                    $tr.css({
                        'color': colors[0]
                    });
                }
            });
        },

    });

});
