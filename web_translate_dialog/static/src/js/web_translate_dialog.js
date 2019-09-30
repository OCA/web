/* Copyright 2012 Guewen Baconnier (Camptocamp SA)
   Copyright 2016 Antonio Espinosa <antonio.espinosa@tecnativa.com>
 * License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl). */

odoo.define('web_translate_dialog.translate_dialog', function(require){
"use strict";

var core = require('web.core');
var BasicController = require('web.BasicController');
var data = require('web.data');
var Context = require('web.Context');
var concurrency = require('web.concurrency');
var Dialog = require('web.Dialog');
var FormView = require('web.FormView');
var View = require('web.AbstractView');
var session  = require('web.session');
var rpc = require('web.rpc');

var _t = core._t;
var QWeb = core.qweb;
var Mutex = concurrency.Mutex;

var TranslateDialog = Dialog.extend({
    template: "TranslateDialog",
    init: function(parent, options) {
        var title_string = _t("Translate field: /")
        this._super(parent,
                    {title: title_string.replace('/', options.field.fieldName) , size: 'x-large'});
        this.view_language = session.user_context.lang;
        this.view = parent;
        this.view_type = parent.viewType || '';
        this.translatable_field = options.field.fieldName;
        this.res_id = options.res_id;
        this.languages = null;
        this.languages_loaded = $.Deferred();
        this.lang_data = new data.DataSetSearch(
            this, 'res.lang', parent.searchView.dataset.get_context(),
            [['translatable', '=', '1']]
        );
        this.lang_data.set_sort(['tr_sequence asc','id asc']);
        this.lang_data.read_slice(['code', 'name']).then(this.on_languages_loaded);
    },
    willStart: function () {
        var self = this;
        return this._super.apply(this, arguments).then(function () {
            if (self.size == 'x-large') {
                self.$modal.find('.modal-dialog').addClass('modal-xl');
            }
        });
    },
    on_languages_loaded: function(langs) {
        this.languages = langs;
        this.languages_loaded.resolve();
    },
    open: function() {
        // the template needs the languages
        return $.when(this.languages_loaded).then($.proxy(this._super, this));
    },
    start: function() {
        var self = this;
        this.$('.oe_translation_field').change(function() {
            $(this).toggleClass('touched', $(this).val() !== $(this).attr('data-value'));
        });
        this.$footer.html(QWeb.render("TranslateDialog.buttons"));
        this.$footer.find(".oe_form_translate_dialog_save_button").click(function(){
            self.on_button_save();
            self.on_button_close();
        });
        this.$footer.find(".oe_form_translate_dialog_cancel_button").click(function(){
            self.on_button_close();
        });

        this.do_load_fields_values();
    },
    resize_textareas: function(){
        var textareas = this.$('textarea.oe_translation_field');
        var max_height = 100
        // Resize textarea either to the max height of its content if it stays
        // in the modal or to the max height available in the modal
        if (textareas.length) {
            _.each(textareas, function(textarea) {
                if (textarea.scrollHeight > max_height) {
                    max_height = textarea.scrollHeight
                }
            });
            var max_client_height = $(window).height() - $('.modal-content').height()
            var new_height = Math.min(max_height, max_client_height)
            textareas.css({'minHeight': new_height});
        }
    },
    initialize_html_fields: function(lang) {
        // Initialize summernote if HTML field
        this.$('.oe_form_field_html .oe_translation_field[name="' + lang + '-' + this.translatable_field + '"]').each(function() {
            var $parent = $(this).summernote({
                'focus': false,
                'toolbar': [
                    ['style', ['style']],
                    ['font', ['bold', 'italic', 'underline', 'clear']],
                    ['fontsize', ['fontsize']],
                    ['color', ['color']],
                    ['para', ['ul', 'ol', 'paragraph']],
                    ['table', ['table']],
                    ['insert', ['link', 'picture']],
                    ['misc', ['codeview']],
                    ['history', ['undo', 'redo']]
                ],
                'prettifyHtml': false,
                'styleWithSpan': false,
                'inlinemedia': ['p'],
                'lang': "odoo",
                'onChange': function (value) {
                    $(this).toggleClass('touched', value !== $(this).attr('data-value'));
                }
            }).parent();
            // Triggers a mouseup to refresh the editor toolbar
            $parent.find('.note-editable').trigger('mouseup');
            $parent.find('.note-editing-area').css({
                minHeight:'100px',
                minWidth:'260px',
            });
        });

    },
    set_fields_values: function(lang, tr_value) {
        this.$('.oe_translation_field[name="' + lang +
                '-' + this.translatable_field + '"]').val(tr_value || '').attr(
                'data-value', tr_value || '');

        this.initialize_html_fields(lang);
    },
    do_load_fields_values: function() {
        var self = this,
            deferred = [];

        this.$('.oe_translation_field').val('').removeClass('touched');

        var def = $.Deferred();
        deferred.push(def);
        rpc.query({
            model: this.view.modelName,
            method: 'get_field_translations',
            args: [
                [this.res_id],
            ],
            kwargs: {
                field_name: this.translatable_field,
            },
        }).done(
            function (res) {
                if (res[self.res_id]){
                    _.each(res[self.res_id], function(translation, lang) {
                        self.set_fields_values(lang, translation[1]);
                    });
                    self.resize_textareas();
                    def.resolve();
                }
            });

        return deferred;
    },
    on_button_save: function() {
        var translations = {},
            self = this,
            save_mutex = new Mutex();
        this.$('.oe_translation_field.touched').each(function() {
            var field = $(this).attr('name').split('-');
            if (!translations[field[0]]) {
                translations[field[0]] = {};
            }
            translations[field[0]][field[1]] = $(this).val();
        });
        _.each(translations, function(text, code) {
            save_mutex.exec(function() {
                var done = new $.Deferred(); // holds the mutex

                var context = new Context(session.user_context, {lang: code});
                rpc.query({
                    model: self.view.modelName,
                    method: 'write',
                    args: [self.res_id, text],
                    kwargs: {context: context.eval()}
                }).then(function() {
                    done.resolve();
                });
                if (code === self.view_language) {
                    _.each(text, function(value, key) {
                        var view_elem = self.view.$('input[name="'+ key + '"]');
                        view_elem.val(value).trigger('change');
                    });
                }
                return done;
            });
        });
        this.close();
    },
    on_button_close: function() {
        this.close();
    },

});

FormView.include({
    render_sidebar: function($node) {
        this._super($node);
        if (this.sidebar) {
            this.sidebar.add_items('other', _.compact([
                this.is_action_enabled('edit') &&
                this.translatable_field && {
                    label: _t('Translate'),
                    callback: this.on_button_translate
                },
            ]));
        }
    },
    on_button_translate: function() {
        var self = this;
        $.when(this.has_been_loaded).then(function() {
            self.open_translate_dialog();
        });
    },
});


BasicController.include({

    open_translate_dialog: function(field, res_id) {
        new TranslateDialog(this, {'field': field, 'res_id': res_id}).open();
    },

    _onTranslate: function(event) {
        // the image next to the fields opens the translate dialog
        var res_id = event.target.res_id ? event.target.res_id : event.target.state.res_id;
        this.open_translate_dialog(event.data, res_id);
    },
});

return {
    TranslateDialog: TranslateDialog,
};

});
