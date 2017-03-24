/* Copyright 2012 Guewen Baconnier (Camptocamp SA)
   Copyright 2016 Antonio Espinosa <antonio.espinosa@tecnativa.com>
 * License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl). */

odoo.define('web_translate_dialog.translate_dialog', function(require){
"use strict";

var core = require('web.core');
var common = require('web.form_common');
var data = require('web.data');

var Dialog = require('web.Dialog');
var FormView = require('web.FormView');
var View = require('web.View');

var _t = core._t;
var QWeb = core.qweb;

var translateDialog = Dialog.extend({
    template: "TranslateDialog",
    init: function(parent, field, content) {
        this._super(parent,
                    {title: _t("Translations"),
                     width: '90%',
                     height: '80%'},
                    content);
        this.view_language = this.session.user_context.lang;
        this.view = parent;
        this.view_type = parent.fields_view.type || '';
        this.$view_form = null;
        this.$sidebar_form = null;
        if (field) {
            this.translatable_fields_keys = [field];
            this.translatable_fields = _.filter(
                this.view.translatable_fields || [],
                function(i) {
                    return i.name === field;
                }
            );
        } else {
            this.translatable_fields_keys = _.map(
                this.view.translatable_fields || [],
                function(i) {
                    return i.name;
                }
            );
            this.translatable_fields = this.view.translatable_fields.slice(0);
        }
        this.languages = null;
        this.languages_loaded = $.Deferred();
        (new data.DataSetSearch(this, 'res.lang', this.view.dataset.get_context(),
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
        _.each(this.translatable_fields_keys, function(f) {
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
        _.each(this.translatable_fields_keys, function(f) {
            self.$el.find('.oe_translation_field[name="' + lang.code +
                    '-' + f + '"]').val(values[f] || '').attr(
                    'data-value', values[f] || '');
        });
        this.$el.find('textarea.oe_translation_field').css({
            minHeight:'100px',
        });
        $(window).resize();
        this.initialize_html_fields(lang);
    },
    do_load_fields_values: function() {
        var self = this,
            deferred = [];

        this.$el.find('.oe_translation_field').val('').removeClass('touched');
        _.each(self.languages, function(lg) {
            var deff = $.Deferred();
            deferred.push(deff);
            if (lg.code === self.view_language) {
                var values = {};
                _.each(self.translatable_fields_keys, function(field) {
                    values[field] = self.view.fields[field].get_value();
                });
                self.set_fields_values(lg, values);
                deff.resolve();
            } else {
                self.view.dataset.call('read',[[self.view.datarecord.id],
                    self.translatable_fields_keys,
                    self.view.dataset.get_context({
                        'lang': lg.code })]).done(
                        function (rows) {
                            self.set_fields_values(lg, rows[0]);
                            deff.resolve();
                        });
            }
        });
        return deferred;
    },
    on_button_save: function() {
        var translations = {},
            self = this,
            translation_mutex = new $.Mutex();
        self.$el.find('.oe_translation_field.touched').each(function() {
            var field = $(this).attr('name').split('-');
            if (!translations[field[0]]) {
                translations[field[0]] = {};
            }
            translations[field[0]][field[1]] = $(this).val();
        });
        _.each(translations, function(text, code) {
            if (code === self.view_language) {
                self.view.set_values(text);
            }
            translation_mutex.exec(function() {
                return new data.DataSet(self, self.view.dataset.model,
                                        self.view.dataset.get_context()).write(
                                        self.view.datarecord.id, text,
                                        { context : { 'lang': code }});
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
    open_translate_dialog: function(field) {
        new translateDialog(this, field).open();
    }
});

common.AbstractField.include({
    on_translate: function() {
        // the image next to the fields opens the translate dialog
        this.view.open_translate_dialog(this.name);
    },
});

return {
    translateDialog: translateDialog,
};

});

