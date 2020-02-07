/* global marked */
/* Copyright 2014 Sudokeys <http://www.sudokeys.com>
 * Copyright 2017 Komit - <http:///komit-consulting.com>
 * Copyright 2019 Alexandre Díaz - <dev@redneboa.es>
 * License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl). */
odoo.define("web_widget_text_markdown.FieldTextMarkDown", function (require) {
    'use strict';

    var basic_fields = require('web.basic_fields');
    var field_registry = require('web.field_registry');
    var core = require('web.core');

    var _t = core._t;
    var LIBS_PATH = '/web_widget_text_markdown/static/src/lib/';


    var FieldTextMarkDown = basic_fields.FieldText.extend({
        className: [
            basic_fields.FieldText.prototype.className,
            'o_field_text_markdown',
        ].join(' '),
        jsLibs: [
            LIBS_PATH + 'marked.js',
            LIBS_PATH + 'dropzone.js',
            LIBS_PATH + 'bootstrap-markdown.js',
        ],
        cssLibs: [
            LIBS_PATH + 'bootstrap-markdown.min.css',
        ],

        _getValue: function () {
            return this.$markdown.getContent();
        },

        _prepareInput: function () {
            var $input = this._super.apply(this, arguments);
            _.defer(function ($elm) {
                $input.removeClass(this.className);
                $input.wrap(
                    _.str.sprintf("<div class='%s'></div>", this.className));
                $elm.markdown(this._getMarkdownOptions());
                this.$markdown = $elm.data("markdown");
                this.$markdown.setContent(this.value || "");
            }.bind(this), $input);
            return $input;
        },

        _renderReadonly: function () {
            this.$el.html(marked(this._formatValue(this.value)));
        },


        _getMarkdownOptions: function () {
            var markdownOpts = {
                autofocus: false,
                savable: false,
                language: this.getSession().user_context.lang,
            };

            // Only can create attachments on non-virtual records
            if (this.res_id) {
                var self = this;
                markdownOpts.dropZoneOptions = {
                    paramName: 'ufile',
                    url: '/web/binary/upload_attachment',
                    acceptedFiles: 'image/*',
                    width: 'o_field_text_markdown',
                    params: {
                        csrf_token: core.csrf_token,
                        session_id: this.getSession().override_session,
                        callback: '',
                        model: this.model,
                        id: this.res_id,
                    },
                    success: function () {
                        self._markdownDropZoneUploadSuccess(this);
                    },
                    error: function () {
                        self._markdownDropZoneUploadError(this);
                    },
                    init: function () {
                        self._markdownDropZoneInit(this);
                    },
                };

                if (_t.database.multi_lang && this.field.translate) {
                    markdownOpts.additionalButtons = [
                        [{
                            name: 'oTranslate',
                            data: [{
                                name: 'cmdTranslate',
                                title: _t('Translate'),
                                icon: {glyph: 'glyphicon glyphicon-flag'},
                                callback: this._markdownTranslate,
                            }],
                        }],
                    ];
                }
            }

            return markdownOpts;
        },

        _getAttachmentId: function (response) {
            var matchElms = response.match(/"id":\s?(\d+)/);
            if (matchElms && matchElms.length) {
                return matchElms[1];
            }
            return null;
        },

        _markdownDropZoneInit: function (markdown) {
            var self = this;
            var caretPos = 0;
            var $textarea = null;
            markdown.on('drop', function (e) {
                $textarea = $(e.target);
                caretPos = $textarea.prop('selectionStart');
            });
            markdown.on('success', function (file, response) {
                var text = $textarea.val();
                var attachment_id = self._getAttachmentId(response);
                if (attachment_id) {
                    var ftext = text.substring(0, caretPos) + '\n![' +
                                _t('description') +
                                '](/web/image/' + attachment_id + ')\n' +
                                text.substring(caretPos);
                    $textarea.val(ftext);
                } else {
                    self.do_warn(
                        _t('Error'),
                        _t("Can't create the attachment."));
                }
            });
            markdown.on('error', function (file, error) {
                console.warn(error);
            });
        },

        _markdownDropZoneUploadSuccess: function () {
            this.isDirty = true;
            this._doDebouncedAction();
            this.$markdown.$editor.find(".dz-error-mark:last")
                .css("display", "none");
        },

        _markdownDropZoneUploadError: function () {
            this.$markdown.$editor.find(".dz-success-mark:last")
                .css("display", "none");
        },

        _markdownTranslate: function () {
            this._onTranslate();
        },
    });


    field_registry.add('bootstrap_markdown', FieldTextMarkDown);
    return FieldTextMarkDown;
});
