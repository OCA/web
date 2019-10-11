/* Copyright 2019 Alexandre Díaz
 * License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl). */

odoo.define('web_widget_x2many_2d_matrix.X2Many2dMatrixView', function (require) {
    "use strict";

    var BasicView = require('web.BasicView');

    BasicView.include({
        init: function (viewInfo) {
            // Force mode='list'
            var $arch = $(viewInfo.arch);
            var selector = "field[widget='x2many_2d_matrix']";
            $arch.find(selector).each(function (i, e) {
                $(e).attr('mode', 'list');
            });
            viewInfo.arch = $arch.prop('outerHTML');

            this._super.apply(this, arguments);
        },
    });

});
