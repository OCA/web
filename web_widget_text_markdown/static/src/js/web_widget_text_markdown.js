odoo.define('web_widget_text_markdown.markdown', function (require) {
    "use strict";

    var fieldRegistry = require('web.field_registry');
    var FieldText = require('web.basic_fields').FieldText;

    var mdConverter = new showdown.Converter();

    var FieldMarkdown = FieldText.extend({
        className: 'o_field_text_markdown',

        _initMarkdown: function () {
            var self = this;
            if (!this.$el.is(':visible')) {
                /** We need to init the markdown editor after
                 * the base textarea is visible on the page,
                 * so we call it on a recursive timeout,
                 * checking that the element is visible
                 * each time. **/
                return setTimeout(function () {
                    self._initMarkdown();
                }, 0);
            }
            var txtarea = this.$el.filter('textarea');
            txtarea.markdown({
                autofocus: false,
                savable: false,
                iconlibrary: 'fa',
                fullscreen: {
                    enable: false,
                },
                onPreview: function () {
                    return self._getHtmlValue();
                },
            });
            /** If the field is translatable we move the button
             * to the toolbar of the editor and set the correct
             * classes. **/
            var translate = this.$el.filter('.o_field_translate');
            if (translate) {
                translate.attr('class', 'btn btn-sm btn-default fa fa-globe');
                var btngrp = $('<div class="btn-group"></div>');
                btngrp.append(translate);
                txtarea.parent().find('.md-header.btn-toolbar').append(btngrp);
            }
        },

        start: function () {
            var self = this;
            return this._super.apply(this, arguments).then(function () {
                if (self.mode === 'edit') {
                    self._initMarkdown();
                }
            });
        },

        _getHtmlValue: function () {
            var val = this.mode === 'edit' ?
                this._getValue() : this.value;
            return mdConverter.makeHtml(val);
        },

        _renderReadonly: function () {
            this.$el.html(this._getHtmlValue());
        },
    });

    fieldRegistry.add('markdown', FieldMarkdown);
});
