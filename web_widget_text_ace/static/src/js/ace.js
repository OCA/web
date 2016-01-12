odoo.define('web.web_widget_text_ace', function(require) {

    "use strict";

    var core = require('web.core');
    var Model = require('web.Model');
    var Widget = require('web.Widget');
    var common = require('web.form_common');
    var formats = require('web.formats');
    var session = require('web.session');

    var QWeb = core.qweb;
    var _lt = core._lt;


    var FieldTextAceEditor = common.AbstractField.extend(
        common.ReinitializeFieldMixin, {

            template: 'FieldTextAceEditor',
            widget_class: 'oe_form_field_ace_editor',
            events: {
                'change ace_editor': 'store_dom_value'
            },

            makeId: function() {
                var i, opt, str;
                str = "";
                opt = "abcdefghijklmnopqrstuvwxyz";
                i = 1;
                while (i < 16) {
                    str += opt.charAt(Math.floor(Math.random() * opt.length));
                    i++;
                }
                return 'ace-' + str;
            },

            match: function($textarea, $editor, editor) {
                var height, id;
                id = $editor.selector;
                height = editor.getSession().getScreenLength() * editor.renderer.lineHeight;
                $textarea.val(editor.getValue());
                if (height < 300) {
                    height = 300;
                }

                $(id).height(height.toString() + "px");
                $(id + '-section').height(height.toString() + "px");
                editor.resize();
            },
            init: function(field_manager, node) {
                this._super(field_manager, node);
                this.$txt = false;
                // silent mode for ace input and change event.
                this.silent = false;
                this.language_tools = false;
                this.ace_editor_id = this.makeId();
                this.ace_editor = false;
                this.$editor_ace_div = false;
                this.mode = node.attrs['data-editor-mode'] !== undefined ? 'ace/mode/' + node.attrs['data-editor-mode'] : "ace/mode/xml";
                this.theme = node.attrs['data-editor-theme'] !== undefined ? 'ace/theme/' + node.attrs['data-editor-theme'] : "ace/theme/monokai";

            },
            initialize_content: function() {
                var self = this;

                if (!this.get("effective_readonly")) {
                    this.$textarea = this.$el.find('textarea[name="' + this.name + '"]');
                    this.$textarea.css('visibility', 'hidden');
                    this.$textarea.css('display', 'none');

                    if (!this.ace_editor) {
                        this.ace_editor = ace.edit(this.$el.find('#' + this.ace_editor_id)[0]);
                        this.ace_editor.setTheme(this.theme);
                        this.ace_editor.getSession().setUseWrapMode(true);
                        this.ace_editor.getSession().setMode(this.mode);
                        this.ace_editor.setFontSize(12);
                        this.ace_editor.$blockScrolling = Infinity;
                        this.ace_editor.on('input', function(){
                            self.store_dom_value();
                        })
                        this.language_tools = ace.require("ace/ext/language_tools");
                        this.ace_editor.setOptions({
                            enableBasicAutocompletion: false,
                            enableSnippets: true,
                            enableLiveAutocompletion: true
                        });
                    }
                    this.$txt = this.$el.find('.ace_text-input')
                    this.silent = true;
                    var init_value = this.get_value();
                    if (!init_value) {
                        init_value = '';
                    }
                    this.ace_editor.setValue(init_value);
                    this.silent = false;
                    this.$editor_ace_div = this.$el.find('#' + this.ace_editor_id);
                    this.$editor_ace_div.css({
                      'margin-bottom': 30,
                      'height': '300px',
                    });
                    this.match(this.$txt, this.$editor_ace_div, this.ace_editor);
                } else {
                    this.$txt = undefined;
                }
            },
            commit_value: function() {
                if (!this.get("effective_readonly") && this.$textarea) {
                    this.store_dom_value();
                    this.ace_editor = false;
                }
                return this._super();
            },
            store_dom_value: function() {
                if (!this.silent) {
                    if (!this.get('effective_readonly') &&
                        this._get_raw_value() !== '' &&
                        this.is_syntax_valid()) {
                        // We use internal_set_value because we were called by
                        // ``.commit_value()`` which is called by a ``.set_value()``
                        // itself called because of a ``onchange`` event
                        this.internal_set_value(
                            this.parse_value(
                                this._get_raw_value())
                            );
                    }
                }
            },
            parse_value: function(val, def) {
                return formats.parse_value(val, this, def);
            },
            format_value: function(val, def) {
                return formats.format_value(val, this, def);
            },
            render_value: function() {
                var show_value = this.format_value(this.get('value'), '');
                if (!this.get("effective_readonly")) {
                    this.$txt.val(show_value);
                    this.$el.trigger('resize');
                } else {
                    this.$(".oe_form_text_content").text(show_value);
                }

            },
            _get_raw_value: function() {
                if (this.ace_editor === false)
                    return '';
                return this.ace_editor.getValue();
            }
        });

        core.form_widget_registry.add('ace_editor', FieldTextAceEditor);

        return {
            FieldTextAceEditor: FieldTextAceEditor
        };

    });
