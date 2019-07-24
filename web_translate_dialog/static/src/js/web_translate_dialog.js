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
var dom = require('web.dom');

var _t = core._t;
var QWeb = core.qweb;
var Mutex = concurrency.Mutex;

var translateDialog = Dialog.extend({
    template: "TranslateDialog",
    init: function(parent, event_data, res_id, content) {
        this._super(parent,
                    {title: _t("Translations"),
                     width: '90%',
                     height: '80%'},
                    content);
        this.view_language = session.user_context.lang;
        this.view = parent;
        this.view_type = parent.viewType || '';
        this.$view_form = null;
        this.$sidebar_form = null;
        this.translatable_fields = [event_data.fieldName];
        this.res_id = res_id;
        this.languages = null;
        this.languages_loaded = $.Deferred();
        (new data.DataSetSearch(this, 'res.lang', parent.searchView.dataset.get_context(),
                                [['translatable', '=', '1']])).read_slice(['code', 'name'],
                                { sort: 'id' }).then(this.on_languages_loaded);
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
        this.$el.find('.oe_translation_field').change(function() {
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
    initialize_html_fields: function(lang) {
        var self = this;
        _.each(this.translatable_fields, function(f) {
            // Initialize summernote if HTML field
            self.$el.find('.oe_form_field_html .oe_translation_field[name="' + lang.code + '-' + f + '"]').each(function() {
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
        });
    },
    set_fields_values: function(lang, values) {
        var self = this;
        _.each(this.translatable_fields, function(f) {
            self.$el.find('.oe_translation_field[name="' + lang.code +
                    '-' + f + '"]').val(values[f] || '').attr(
                    'data-value', values[f] || '');
        });
        var textarea = this.$el.find('textarea.oe_translation_field');
        if (textarea !== undefined && textarea[0] !== undefined) {
            textarea.css({minHeight:'100px',});
            dom.autoresize(textarea, {parent: this.$el});
        }
        $(window).resize();
        this.initialize_html_fields(lang);
    },
    do_load_fields_values: function() {
        var self = this,
            deferred = [];

        this.$el.find('.oe_translation_field').val('').removeClass('touched');
        _.each(self.languages, function(lg) {
            var context = new Context(session.user_context, {lang: lg.code});
            var deff = $.Deferred();
            deferred.push(deff);
            rpc.query({
            model: self.view.modelName,
            method: 'read',
            args: [
                [self.res_id],
            ],
            kwargs: {
                fields: self.translatable_fields,
                context: context.eval(),
            },
            }).done(
                    function (rows) {
                        
                        if (rows[0]){
                            self.set_fields_values(lg, rows[0]);
                            deff.resolve();
                        }
                    });
        });
        return deferred;
    },
    on_button_save: function() {
        var translations = {},
            self = this,
            save_mutex = new Mutex();
        self.$el.find('.oe_translation_field.touched').each(function() {
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
                        self.view.$el.find('input[name="'+ key + '"]').val(value);
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
                this.translatable_fields.length > 0 && {
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

View.include({
});

BasicController.include({

    open_translate_dialog: function(field, res_id) {
        new translateDialog(this, field, res_id).open();
    },

    _onTranslate: function(event) {
        // the image next to the fields opens the translate dialog
        var res_id = event.target.res_id ? event.target.res_id : event.target.state.res_id;
        this.open_translate_dialog(event.data, res_id);
    },
});

return {
    translateDialog: translateDialog,
};

});

