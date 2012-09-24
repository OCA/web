openerp.web_translate_dialog_page = function (openerp) {

    var _t = openerp.web._t;

    openerp.web.PageView.include({
        on_loaded: function(data) {
            this._super(data);
            this.$form_header.find('button.oe_form_button_translate').click(this.on_button_translate);
        },
        on_button_translate: function() {
            var self = this;
            $.when(this.has_been_loaded).then(function() {
                self.open_translate_dialog(this);
            });
        }
    });

    openerp.web.View.include({
        // Replace the translation dialog by the new one
        open_translate_dialog: function(field) {
           if (!this.translate_dialog) {
               this.translate_dialog = new openerp.web_translate_dialog_page.TranslateDialogPage(this).start();
           }
           this.translate_dialog.open(field);
        }
    });

    // completely redefine the translation dialog because we can
    // not completely tie the standard one to our needs by sub-classing
    openerp.web_translate_dialog_page.TranslateDialogPage = openerp.web.Dialog.extend({
        dialog_title: {toString: function () { return _t("Translations"); }},
        init: function(view) {
            this.view_language = view.session.user_context.lang;
            this['on_button_' + _t("Save")] = this.on_btn_save;
            this['on_button_' + _t("Close")] = this.on_btn_close;
            this._super(view, {
                width: '80%',
                height: '90%'
            });
            this.view = view;
            this.view_type = view.fields_view.type || '';
            this.$fields_form = null;
            this.$view_form = null;
            this.$sidebar_form = null;
            this.translatable_fields_keys = _.map(this.view.translatable_fields || [], function(i) { return i.name;});
            this.languages = null;
            this.languages_loaded = $.Deferred();
            (new openerp.web.DataSetSearch(this, 'res.lang', this.view.dataset.get_context(),
                [['translatable', '=', '1']])).read_slice(['code', 'name'], { sort: 'id' }).then(this.on_languages_loaded);
        },
        on_languages_loaded: function(langs) {
            this.languages = langs;
            this.languages_loaded.resolve();
        },
        start: function() {
            var self = this;
            this._super();
            $.when(this.languages_loaded).then(function() {
                self.$element.html(QWeb.render('TranslateDialogPage', { widget: self }));
                self.$fields_form = self.$element.find('.oe_translation_form');
                self.$fields_form.find('.oe_trad_field').change(function() {
                    $(this).toggleClass('touched', ($(this).val() != $(this).attr('data-value')));
                });
                var $textarea = self.$fields_form.find('textarea.oe_trad_field');
                $textarea.autosize();
                $textarea.css({minHeight:'100px'});
            });
            return this;
        },

        // use a `read_translations` method instead of a `read`
        // this latter leave the fields empty if there is no
        // translation for a field instead of taking the src field
        do_load_fields_values: function(callback) {
            var self = this,
                deffered = [];

            this.$fields_form.find('.oe_trad_field').val('').removeClass('touched');
            _.each(self.languages, function(lg) {
                var deff = $.Deferred();
                deffered.push(deff);
                var callback = function(values) {
                    _.each(self.translatable_fields_keys, function(f) {
                        self.$fields_form.find('.oe_trad_field[name="' + lg.code + '-' + f + '"]').val(values[0][f] || '').attr('data-value', values[0][f] || '');
                    });
                    deff.resolve();
                };
                self.view.dataset.call(
                    'read_translations',
                    [[self.view.datarecord.id],
                     self.translatable_fields_keys,
                     self.view.dataset.get_context({
                        'lang': lg.code
                     })], callback);
            });
            $.when.apply(null, deffered).then(callback);
        },
        open: function(field) {
            var self = this,
                sup = this._super;
            $.when(this.languages_loaded).then(function() {
                if (self.view.translatable_fields && self.view.translatable_fields.length) {
                    self.do_load_fields_values(function() {
                        sup.call(self);
                        $(window).resize();
                    });
                } else {
                    sup.call(self);
                }
            });
        },
        on_btn_save: function() {
            var trads = {},
                self = this,
                trads_mutex = new $.Mutex();
            self.$fields_form.find('.oe_trad_field.touched').each(function() {
                var field = $(this).attr('name').split('-');
                if (!trads[field[0]]) {
                    trads[field[0]] = {};
                }
                trads[field[0]][field[1]] = $(this).val();
            });
            _.each(trads, function(data, code) {
                if (code === self.view_language) {
                    _.each(data, function(value, field) {
                        self.view.fields[field].set_value(value);
                    });
                }
                trads_mutex.exec(function() {
                    return new openerp.web.DataSet(self, self.view.dataset.model, self.view.dataset.get_context()).write(self.view.datarecord.id, data, { context : { 'lang': code }});
                });
            });
            this.close();
        },
        on_btn_close: function() {
            this.close();
        }

    });
};

