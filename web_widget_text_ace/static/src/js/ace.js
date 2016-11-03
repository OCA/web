odoo.define('web.web_widget_text_ace', function(require) {

    "use strict";

    var ajax = require('web.ajax');
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


            willStart: function() {
              if (!window.ace && !window.ace_loaded) {
                var theme = '/web_widget_text_ace/static/lib/ace/theme-' + this.theme + '.js';
                var mode = '/web_widget_text_ace/static/lib/ace/mode-' + this.mode + '.js';
                window.ace_loaded = ajax.loadJS('/web_widget_text_ace/static/lib/ace/ace.js').then(function () {
                return $.when(ajax.loadJS('/web_widget_text_ace/static/lib/ace/mode-xml.js'),
                    ajax.loadJS('/web_widget_text_ace/static/lib/ace/theme-monokai.js'),
                    ajax.loadJS('/web_widget_text_ace/static/lib/ace/mode-markdown.js'));
            });
        }
              return $.when(this._super(), window.ace_loaded);
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

            init: function(field_manager, node) {
                this._super(field_manager, node);
                this.mode = node.attrs['data-editor-mode'] !== undefined ? node.attrs['data-editor-mode'] : "xml";
                this.theme = node.attrs['data-editor-theme'] !== undefined ? node.attrs['data-editor-theme'] : "monokai";
            },

            initialize_content: function() {
                if (! this.get("effective_readonly")) {

                  var self = this;

                  this.aceEditor = ace.edit(this.$('.ace_view_editor')[0]);
                  this.aceEditor.setOptions({"maxLines": Infinity});
                  this.aceEditor.setTheme("ace/theme/" + this.theme);
                  this.aceEditor.$blockScrolling = true;

                  this.aceSession = this.aceEditor.getSession();
                  this.aceSession.setUseWorker(false);
                  this.aceSession.setMode("ace/mode/"+(this.options.mode || 'xml'));

                  this.aceEditor.on("blur", function() {
                    if (self.aceSession.getUndoManager().hasUndo()) {
                        self.set_value(self.aceSession.getValue());
                    }
                  });

                }
            },
            destroy_content: function() {
              if (this.aceEditor) {
                this.aceEditor.destroy();
              }
            },

            render_value: function() {
              if (! this.get("effective_readonly")) {
            var value = formats.format_value(this.get('value'), this);
            this.aceSession.setValue(value);

        } else {
           var txt = this.get("value") || '';
            this.$(".oe_form_text_content").text(txt);
        }
            },
            focus: function() {
        return this.aceEditor.focus();
    },
  });

        core.form_widget_registry.add('ace_editor', FieldTextAceEditor);

        return {
            FieldTextAceEditor: FieldTextAceEditor
        };

    });
