/*
    Copyright 2021 Camptocamp SA (https://www.camptocamp.com).
    @author Iván Todorovich <ivan.todorovich@camptocamp.com>
    License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).
*/
odoo.define("web_widget_ckeditor.field_html_override", function (require) {
    "use strict";

    const FieldHtml = require("web_editor.field.html");
    const FieldHtmlCKEditor = require("web_widget_ckeditor.field_ckeditor");
    const field_registry = require("web.field_registry");

    field_registry.add("html_odoo", FieldHtml);
    field_registry.add("html", FieldHtmlCKEditor);
});
