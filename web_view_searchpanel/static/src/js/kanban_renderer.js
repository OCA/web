/**
*
*    Copyright 2017-2019 MuK IT GmbH.
*    License LGPL-3.0 or later (http://www.gnu.org/licenses/lgpl.html).
*
**/

odoo.define('web_view_searchpanel.KanbanRenderer', function (require) {
    "use strict";

    var KanbanRenderer = require('web.KanbanRenderer');

    KanbanRenderer.include({
        render: function () {
            return this._render();
        },
    });

});
