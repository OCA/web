/* -*- encoding: utf-8 -*-
##############################################################################
#
#    OpenERP, Open Source Management Solution
#    This module copyright (C) 2013 Therp BV (<http://therp.nl>)
#    All Rights Reserved
#
#    This program is free software: you can redistribute it and/or modify
#    it under the terms of the GNU Affero General Public License as
#    published by the Free Software Foundation, either version 3 of the
#    License, or (at your option) any later version.
#
#    This program is distributed in the hope that it will be useful,
#    but WITHOUT ANY WARRANTY; without even the implied warranty of
#    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
#    GNU Affero General Public License for more details.
#
#    You should have received a copy of the GNU Affero General Public License
#    along with this program.  If not, see <http://www.gnu.org/licenses/>.
#
############################################################################*/

odoo.define('web_ckeditor4', function(require){
    "use strict";
    var core = require('web.core');
    var session = require('web.session');
    var formats = require('web.formats');
    var ckconfig = require('web_ckeditor4.config');

    var FieldCKEditor4 = core.form_widget_registry.get('text').extend({
        ckeditor_config: function () {
            return {
                removePlugins: this._getRemovePlugins(),
                removeButtons: this._getRemoveButtons(),
                filebrowserImageUploadUrl: 'dummy',
                extraPlugins: 'filebrowser',
                // this is '#39' per default which screws up single quoted text in ${}
                entities_additional: ''
            };
        },
        ckeditor_filter: ckconfig.default_ckeditor_filter,
        ckeditor_writer: ckconfig.default_ckeditor_writer,
        _getRemovePlugins: function () {
            return 'iframe,flash,forms,smiley,pagebreak,stylescombo';
        },
        _getRemoveButtons: function () {
            return '';
        },
        init: function () {
            this._super.apply(this, arguments);
            this.editor_lang = session.user_context.lang.split('_')[0];
            this.view.on("load_record", this, this._on_load_record);
        },
        start: function()
        {
            this._super.apply(this, arguments);
            CKEDITOR.lang.load(this.editor_lang, 'en', function() {});
        },
        _on_load_record: function() {
            /* Fix widget not re-initialized on form discard.

            When you hit "cancel" button or when you navigate away
            from the form, for instance by clicking on the breadcrumb
            or on  "edit translations", we have to remove the CKEditor widget.

            BUT then if you hit "create" Odoo's form machinery is not initializing
            the widget anymore (which really sounds inconsistent).
            If the widget is not initialized again it means that if CKEditor
            got destroyed there's no way to re-init again.

            Here we make sure that on create (no id on datarecord)
            if the editor is not initialized yet we force it.
            */
            if (!this.view.datarecord.id && !this.editor) {
                this.initialize_content();
            }
        },
        initialize_content: function()
        {
            var self = this;
            this._super.apply(this, arguments);
            if(!this.$el)
            {
                return;
            } else if (!this.get('effective_readonly') && !this.editor) {
                this.editor = CKEDITOR.replace(this.$el.get(0),
                    _.extend(
                        {
                            language: this.editor_lang,
                            on:
                            {
                                'change': function()
                                {
                                    self.store_dom_value();
                                },
                            },
                        },
                        self.ckeditor_config()
                    )
                );
            }
        },
        store_dom_value: function()
        {
            this.internal_set_value(this.editor ? this.editor.getData() : formats.parse_value(this.get('value'), this));
        },
        filter_html: function(value)
        {
            return ckconfig.filter_html(value, this.ckeditor_filter, this.ckeditor_writer);
        },
        render_value: function()
        {
            if(this.get("effective_readonly"))
            {
                this.$el.html(this.filter_html(this.get('value')));
            }
            else
            {
                if(this.editor)
                {
                    var self = this;
                    if(this.editor.status != 'ready')
                    {
                        var instanceReady = function()
                        {
                            self.editor.setData(self.get('value') || '');
                            self.editor.removeListener('instanceReady', instanceReady);
                        };
                        this.editor.on('instanceReady', instanceReady);
                    }
                    else
                    {
                        self.editor.setData(self.get('value') || '');
                    }
                }
            }
        },
        destroy_content: function () {
            this._cleanup_editor();
        },
        undelegateEvents: function()
        {
            this._cleanup_editor();
            return this._super.apply(this, arguments);
        },
        _cleanup_editor: function()
        {
            if(this.editor && this.editor.status == 'ready')
            {
                CKEDITOR.remove(this.editor.name);
                $('#cke_' + this.editor.name).remove();
                this.editor.removeAllListeners();
                this.editor.destroy();
                this.editor = null;
            }
        },
        destroy: function()
        {
            this.view.off("load_record", this, this._on_load_record);
            this._cleanup_editor();
            this._super();
        }
    });

    var FieldCKEditor4Raw = FieldCKEditor4.extend({
        filter_html: function(value)
        {
            return value;
        }
    });

    core.form_widget_registry.add('text_ckeditor4', FieldCKEditor4);
    core.form_widget_registry.add('text_ckeditor4_raw', FieldCKEditor4Raw);
    core.form_widget_registry.add('text_html', FieldCKEditor4);
    core.form_widget_registry.add('html', FieldCKEditor4);

    return {
        'FieldCKEditor4': FieldCKEditor4,
        'FieldCKEditor4Raw': FieldCKEditor4Raw
    }
});
