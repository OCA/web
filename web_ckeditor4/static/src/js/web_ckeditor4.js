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

openerp.web_ckeditor4 = function(openerp)
{
    CKEDITOR.lang.load(openerp.connection.user_context.lang.split('_')[0], 'en', function() {});

    openerp.web.form.widgets.add('text_ckeditor4',
            'openerp.web_ckeditor4.FieldCKEditor4');
    openerp.web.page.readonly.add('text_ckeditor4',
            'openerp.web_ckeditor4.FieldCKEditor4Readonly');
    openerp.web.form.widgets.add('text_html',
            'openerp.web_ckeditor4.FieldCKEditor4');
    openerp.web.page.readonly.add('text_html',
            'openerp.web_ckeditor4.FieldCKEditor4Readonly');

    function filter_html(value)
    {
        //TODO: it should be possible to use ckeditor to do the filtering
        return value;
    }

    openerp.web_ckeditor4.FieldCKEditor4 = openerp.web.form.FieldText.extend({
        ckeditor_config: {
            removePlugins: 'iframe,flash,forms,smiley,pagebreak,stylescombo',
        },
        start: function()
        {
            var self = this;
            this._super.apply(this, arguments);

            if(this.modifiers.readonly)
            {
                return;
            }

            self.editor = CKEDITOR.replace(this.$element.find('textarea').get(0),
                _.extend(
                    {
                        language: openerp.connection.user_context.lang.split('_')[0],
                    }, 
                    this.ckeditor_config));
            self.editor.once('beforeUndoImage', function () { self.on_ui_change() });
        },
        get_value: function()
        {
            return this.editor ? openerp.web.parse_value(this.editor.getData(), this) : this.value;
        },
        set_value: function(value)
        {
            if(this.modifiers.readonly)
            {
                this._super.apply(this, [value]);

                this.$element.html(filter_html(value));
                return value;
            }
            else
            {
                if(this.editor)
                {
                    var self = this;
                    if(this.editor.status != 'ready')
                    {
                        this.editor.on('instanceReady',
                            function()
                            {
                                self.editor.setData(value || '');
                            });
                    }
                    else
                    {
                        self.editor.setData(value || '');
                    }
                }
                this._super.apply(this, arguments);
            }
        },

        stop: function()
        {
            if(this.editor)
            {
                this.editor.destroy(true);
                this.editor = null;
            }
            return this._super.apply(this, arguments);
        }
    });

    openerp.web_ckeditor4.FieldCKEditor4Readonly = openerp.web.page.FieldCharReadonly.extend({
        set_value: function (value)
        {
            this._super.apply(this, arguments);
            this.$element.find('div').html(filter_html(value));
            return value;
        }
    });
}

