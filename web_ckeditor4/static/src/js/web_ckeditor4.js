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

openerp.web_ckeditor4 = function(instance)
{
    var ckeditor_addFunction_org = CKEDITOR.tools.addFunction;
    //this is a quite complicated way to kind of monkey patch the private
    //method onDomReady of ckeditor's plugin wysiwigarea, which causes problems
    //when the editor is about to be destroyed but because of OpenERP's
    //architecture updated one last time with its current value
    CKEDITOR.tools.addFunction = function(fn, scope)
    {
        if(scope && scope._ && scope._.attrChanges && scope._.detach)
        {
            var scope_reference = scope;
            return ckeditor_addFunction_org(function()
                    {
                        var self = this,
                            self_arguments=arguments;
                        setTimeout(function()
                        {
                            if(self.editor)
                            {
                                fn.apply(self, self_arguments);
                            }
                        }, 0);
                    }, scope);
        }
        return ckeditor_addFunction_org(fn, scope);
    };

    CKEDITOR.on('dialogDefinition', function(e)
        {
            _.each(e.data.definition.contents, function(element)
            {
                if(!element || element.filebrowser!='uploadButton')
                {
                    return
                }
                _.each(element.elements, function(element)
                {
                    if(!element.onClick || element.type!='fileButton')
                    {
                        return
                    }
                    var onClick_org = element.onClick;
                    element.onClick = function(e1)
                    {
                        onClick_org.apply(this, arguments);
                        _.each(jQuery('#'+this.domId).closest('table')
                            .find('iframe').contents().find(':file')
                            .get(0).files,
                            function(file)
                            {
                                var reader = new FileReader();
                                reader.onload = function(load_event)
                                {
                                    CKEDITOR.tools.callFunction(
                                        e.editor._.filebrowserFn,
                                        load_event.target.result,
                                        '');
                                }
                                reader.readAsDataURL(file);
                            });
                        return false;
                    }
                });
            });
        });

    instance.web.form.widgets.add('text_ckeditor4',
            'instance.web_ckeditor4.FieldCKEditor4');
    instance.web.form.widgets.add('text_ckeditor4_raw',
            'instance.web_ckeditor4.FieldCKEditor4Raw');
    instance.web.form.widgets.add('text_html',
            'instance.web_ckeditor4.FieldCKEditor4');
    instance.web.form.widgets.add('html',
            'instance.web_ckeditor4.FieldCKEditor4');

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
                    attributes: 'href,src,style,alt,width,height,dir',
                    styles: '*',
                    classes: '*',
                },
                'html head title meta style body p div span a h1 h2 h3 h4 h5 img br hr table tr th td ul ol li dd dt strong pre b i': true,
            });
    default_ckeditor_writer = new CKEDITOR.htmlParser.basicWriter();

    instance.web_ckeditor4.FieldCKEditor4 = instance.web.form.FieldText.extend({
        ckeditor_config: {
            removePlugins: 'iframe,flash,forms,smiley,pagebreak,stylescombo',
            filebrowserImageUploadUrl: 'dummy',
            extraPlugins: 'filebrowser',
            // this is '#39' per default which screws up single quoted text in ${}
            entities_additional: '',
        },
        ckeditor_filter: default_ckeditor_filter,
        ckeditor_writer: default_ckeditor_writer,
        start: function()
        {
            this._super.apply(this, arguments);

            CKEDITOR.lang.load(instance.session.user_context.lang.split('_')[0], 'en', function() {});
        },
        initialize_content: function()
        {
            var self = this;
            this._super.apply(this, arguments);
            if(!this.$textarea)
            {
                return;
            }
            this.editor = CKEDITOR.replace(this.$textarea.get(0),
                _.extend(
                    {
                        language: instance.session.user_context.lang.split('_')[0],
                        on:
                        {
                            'change': function()
                            {
                                self.store_dom_value();
                            },
                        },
                    },
                    this.ckeditor_config));
        },
        store_dom_value: function()
        {
            this.internal_set_value(this.editor ? this.editor.getData() : instance.web.parse_value(this.get('value'), this));
        },
        filter_html: function(value)
        {
            return filter_html(value, this.ckeditor_filter, this.ckeditor_writer);
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
        undelegateEvents: function()
        {
            this._cleanup_editor();
            return this._super.apply(this, arguments);
        },
        _cleanup_editor: function()
        {
            if(this.editor)
            {
                this.editor.removeAllListeners();
                this.editor.destroy();
                this.editor = null;
            }
        },
        destroy: function()
        {
            this.destroy_content();
            this._super();
        },
        destroy_content: function()
        {
            this._cleanup_editor();
        }
    });
    instance.web_ckeditor4.FieldCKEditor4Raw = instance.web_ckeditor4.FieldCKEditor4.extend({
        filter_html: function(value)
        {
            return value;
        }
    });
}

