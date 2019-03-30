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

odoo.define('web_ckeditor4.config', function (require) {
    "use strict";

    var ckeditor_addFunction_org = CKEDITOR.tools.addFunction;
    // this is a quite complicated way to kind of monkey patch the private
    // method onDomReady of ckeditor's plugin wysiwigarea, which causes problems
    // when the editor is about to be destroyed but because of OpenERP's
    // architecture updated one last time with its current value
    CKEDITOR.tools.addFunction = function (fn, scope) {
        if (scope && scope._ && scope._.attrChanges && scope._.detach) {
            return ckeditor_addFunction_org(function () {
                var self = this,
                    self_arguments = arguments;
                setTimeout(function () {
                    if (self.editor) {
                        fn.apply(self, self_arguments);
                    }
                }, 0);
            }, scope);
        }
        return ckeditor_addFunction_org(fn, scope);
    };

    CKEDITOR.on('dialogDefinition', function (e) {
        _.each(e.data.definition.contents, function (element) {
            if (!element || element.filebrowser != 'uploadButton') {
                return
            }
            _.each(element.elements, function (element) {
                if (!element.onClick || element.type != 'fileButton') {
                    return
                }
                var onClick_org = element.onClick;
                element.onClick = function (e1) {
                    onClick_org.apply(this, arguments);
                    _.each($('#' + this.domId).closest('table')
                        .find('iframe').contents().find(':file')
                        .get(0).files,
                        function (file) {
                            var reader = new FileReader();
                            reader.onload = function (load_event) {
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
    var filter_html = function filter_html(value, ckeditor_filter, ckeditor_writer) {
        var fragment = CKEDITOR.htmlParser.fragment.fromHtml(value);
        ckeditor_filter.applyTo(fragment);
        ckeditor_writer.reset();
        fragment.writeHtml(ckeditor_writer);
        return ckeditor_writer.getHtml();
    };

    var default_ckeditor_filter = new CKEDITOR.filter({
        '*':
        {
            attributes: 'href,src,style,alt,width,height,dir',
            styles: '*',
            classes: '*',
        },
        'html head title meta style body p div span a h1 h2 h3 h4 h5 img br hr table tr th td ul ol li dd dt strong pre b i': true,
    });
    var default_ckeditor_writer = new CKEDITOR.htmlParser.basicWriter();
    return {
        'filter_html': filter_html,
        'default_ckeditor_filter': default_ckeditor_filter,
        'default_ckeditor_writer': default_ckeditor_writer
    }
});
