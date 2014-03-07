openerp.web_translate_dialog = function (instance) {

    "use strict";

    var QWeb = instance.web.qweb,
        _t  = instance.web._t,
        _lt = instance.web._lt;

    instance.web.FormView.include({
        load_form: function(data) {
            var self = this;
            this._super(data);
            if (this.sidebar) {
                this.sidebar.add_items('other', _.compact([
                    self.is_action_enabled('edit') && { label: _t('Translate'), callback: self.on_button_translate },
                ]));
            }
        },
        on_button_translate: function() {
            var self = this;
            $.when(this.has_been_loaded).then(function() {
                self.open_translate_dialog(this);
            });
        },
    });

    instance.web.View.include({
        open_translate_dialog: function() {
            new instance.web_translate_dialog.TranslateDialog(this).open();
        }
    });

    instance.web_translate_dialog.TranslateDialog = instance.web.Dialog.extend({
        template: "TranslateDialog",
        init: function(parent, options, content) {
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
            this.translatable_fields_keys = _.map(this.view.translatable_fields || [], function(i) { return i.name;});
            this.languages = null;
            this.languages_loaded = $.Deferred();
            (new instance.web.DataSetSearch(this,
                                            'res.lang',
                                            this.view.dataset.get_context(),
                                            [['translatable', '=', '1']]))
                .read_slice(['code', 'name'], { sort: 'id' })
                .then(this.on_languages_loaded);
        },
        on_languages_loaded: function(langs) {
            this.languages = langs;
            this.languages_loaded.resolve();
        },
        open: function() {
            var self = this,
                sup = this._super;
            // the template needs the languages
            $.when(this.languages_loaded).then(function() {
                return sup.call(self);
            });
        },
        start: function() {
            var self = this;
            this.$el.find('.oe_translation_field').change(function() {
                $(this).toggleClass('touched', ($(this).val() != $(this).attr('data-value')));
            });
            this.$buttons.html(QWeb.render("TranslateDialog.buttons"));
            this.$buttons.find(".oe_form_translate_dialog_save_button").click(function(){
                self.on_button_save();
                self.on_button_close();
            });
            this.$buttons.find(".oe_form_translate_dialog_cancel_button").click(function(){
                self.on_button_close();
            });
            this.initialize_html_fields();

            this.do_load_fields_values();
        },
        initialize_html_fields: function() {
            this.$el.find('.oe_form_field_html textarea').each(function() {
                var $textarea = $(this);
                var width = 100;  // forced to fixed size on initialization
                                  // will be changed to percentage right after
                                  // the creation
                var height = 250;
                $textarea.cleditor({
                    width:      width, // width not including margins, borders or padding
                    height:     height, // height not including margins, borders or padding
                    controls:   // controls to add to the toolbar
                                "bold italic underline strikethrough " +
                                "| removeformat | bullets numbering | outdent " +
                                "indent | link unlink | source",
                    bodyStyle:  // style to assign to document body contained within the editor
                                "margin:4px; color:#4c4c4c; font-size:13px; font-family:'Lucida Grande',Helvetica,Verdana,Arial,sans-serif; cursor:text"
                });

                var $cleditor = $textarea.cleditor()[0];
                // Down to -- end, this is a workaround for the bug
                // https://bugs.launchpad.net/openerp-web/+bug/1258463
                // The editor is initially created with a fixed size so
                // the buggy event is not bound to $(window), then we restore
                // a percentage width and bind the "normal" event without the
                // CHM's buggy change.
                $cleditor.$main.width('95%');
                $cleditor.options.width = '95%';
                $(window).resize(function() {
                    //Forcefully blurred iframe contentWindow, chrome, IE, safari doesn't trigger blur on window resize and due to which text disappears
                    var contentWindow = $cleditor.$frame[0].contentWindow;
                    if(!$.browser.mozilla && contentWindow){
                        $(contentWindow).trigger('blur');
                    }
                });
                $cleditor.refresh();
                // -- end

                $cleditor.change(function() {
                    this.updateTextArea();
                    this.$area.toggleClass('touched',
                                        (this.$area.val() != this.$area.attr('data-value')));
                });
            });
        },
        // use a `read_translations` method instead of a `read`
        // this latter leave the fields empty if there is no
        // translation for a field instead of taking the src field
        do_load_fields_values: function(callback) {
            var self = this,
                deferred = [];

            this.$el.find('.oe_translation_field').val('').removeClass('touched');
            _.each(self.languages, function(lg) {
                var deff = $.Deferred();
                deferred.push(deff);
                var callback = function(values) {
                };
                self.view.dataset.call(
                    'read',
                    [[self.view.datarecord.id],
                     self.translatable_fields_keys,
                     self.view.dataset.get_context({
                        'lang': lg.code
                     })]).done(function (values) {
                        _.each(self.translatable_fields_keys, function(f) {
                            self.$el.find('.oe_translation_field[name="' + lg.code + '-' + f + '"]')
                                .val(values[0][f] || '')
                                .attr('data-value', values[0][f] || '');

                            var $tarea = self.$el.find('.oe_form_field_html .oe_translation_field[name="' + lg.code + '-' + f + '"]');
                            if ($tarea.length) {
                                $tarea.cleditor()[0].updateFrame();
                            }
                        });
                        var $textarea = self.$el.find('textarea.oe_translation_field');
                        $textarea.css({minHeight:'100px'});
                        $textarea.autosize();
                        $(window).resize();  // triggers the autosize
                        deff.resolve();
                     });
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
            _.each(translations, function(data, code) {
                if (code === self.view_language) {
                    _.each(data, function(value, field) {
                        var view_field = self.view.fields[field];
                        var is_dirty = view_field.view.$el.hasClass('oe_form_dirty');
                        // update the field on the view
                        view_field.set_value(value);
                        if ( !is_dirty ) {
                            // Avoid to set the view dirty when not necessary:
                            // values have already been saved.
                            view_field.view.$el.removeClass('oe_form_dirty');
                        }
                    });
                }
                translation_mutex.exec(function() {
                    return new instance.web.DataSet(self, self.view.dataset.model, self.view.dataset.get_context()).write(self.view.datarecord.id, data, { context : { 'lang': code }});
                });
            });
            this.close();
        },
        on_button_close: function() {
            this.close();
        },

    });

    instance.web.form.AbstractField.include({
        on_translate: function() {
            // the image next to the fields opens the translate dialog
            this.view.open_translate_dialog();
        },
    });
};
