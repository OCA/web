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
    openerp.web.form.widgets.add('text_ckeditor4_raw',
            'openerp.web_ckeditor4.FieldCKEditor4Raw');
    openerp.web.page.readonly.add('text_ckeditor4_raw',
            'openerp.web_ckeditor4.FieldCKEditor4ReadonlyRaw');
    openerp.web.form.widgets.add('text_html',
            'openerp.web_ckeditor4.FieldCKEditor4');
    openerp.web.page.readonly.add('text_html',
            'openerp.web_ckeditor4.FieldCKEditor4Readonly');

    function filter_html(value, ckeditor_filter, ckeditor_writer)
    {
        var fragment = CKEDITOR.htmlParser.fragment.fromHtml(value);
        ckeditor_filter.applyTo(fragment);
        ckeditor_writer.reset();
        fragment.writeHtml(ckeditor_writer);
        return ckeditor_writer.getHtml();
    };
    default_ckeditor_filter = new CKEDITOR.filter(
            {
                '*':
                {
                    attributes: 'href,src,style,alt,width,height',
                },
                'html head title meta style body p div span a h1 h2 h3 h4 h5 img br hr table tr th td ul ol li dd dt': true,
            });
    default_ckeditor_writer = new CKEDITOR.htmlParser.basicWriter();

    openerp.web_ckeditor4.FieldCKEditor4 = openerp.web.form.FieldText.extend({
        ckeditor_config: {
            removePlugins: 'iframe,flash,forms,smiley,pagebreak,stylescombo',
        },
        ckeditor_filter: default_ckeditor_filter,
        ckeditor_writer: default_ckeditor_writer,
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
                        on:
                        {
                            'beforeUndoImage': function()
                            {
                                if(!self.is_dirty())
                                {
                                    self.on_ui_change();
                                }
                            },
                        },
                    }, 
                    this.ckeditor_config));
        },
        get_value: function()
        {
            return this.editor ? openerp.web.parse_value(this.editor.getData(), this) : this.value;
        },
        filter_html: function(value)
        {
            return filter_html(value, this.ckeditor_filter, this.ckeditor_writer);
        },
        set_value: function(value)
        {
            if(this.modifiers.readonly)
            {
                this._super.apply(this, [value]);

                this.$element.html(this.filter_html(value));
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
                this.$element.find('textarea').detach();
            }
            return this._super.apply(this, arguments);
        }
    });
    openerp.web_ckeditor4.FieldCKEditor4Raw = openerp.web_ckeditor4.FieldCKEditor4.extend({
        filter_html: function(value)
        {
            return value;
        }
    });


    openerp.web_ckeditor4.FieldCKEditor4ReadonlyRaw = openerp.web.page.FieldCharReadonly.extend({
        set_value: function (value)
        {
            this._super.apply(this, arguments);
            this.$element.find('div').html(value);
            return value;
        }
    });
    openerp.web_ckeditor4.FieldCKEditor4Readonly = openerp.web.page.FieldCharReadonly.extend({
        ckeditor_filter: default_ckeditor_filter,
        ckeditor_writer: default_ckeditor_writer,
        set_value: function (value)
        {
            this._super.apply(this, arguments);
            this.$element.find('div').html(filter_html(value, this.ckeditor_filter, this.ckeditor_writer));
            return value;
        }
    });
}

