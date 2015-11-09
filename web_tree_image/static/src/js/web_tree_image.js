/*
    OpenERP, Open Source Management Solution
    This module copyright (C) 2014 Therp BV (<http://therp.nl>)
                          (C) 2013 Marcel van der Boom <marcel@hsdev.com>

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU Affero General Public License as
    published by the Free Software Foundation, either version 3 of the
    License, or (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU Affero General Public License for more details.

    You should have received a copy of the GNU Affero General Public License
    along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/

openerp.web_tree_image = function(instance) {
    "use strict";
    var QWeb = instance.web.qweb;
    instance.web.list.Image = instance.web.list.Column.extend({
        format: function (row_data, options) {
            /* Return a valid img tag. For image fields, test if the
             field's value contains just the binary size and retrieve
            the image from the dedicated controller in that case.
            Otherwise, assume a character field containing either a
            stock Odoo icon name without path or extension or a fully
            fledged location or data url */
            var self = this;

            /*
            Allow image to be displayed in 3 different ways:
             - 'inline':    display image directly in tree view (default)
             - 'icon':      display only an icon, show a full screen preview
                            of the picture on click
             - 'thumbnail': display image directly in tree view, show a
                            full screen preview of the picture on click
            */
            self.display = self.display || 'inline';

            if (!row_data[self.id] || !row_data[self.id].value) {
                return '';
            }
            var value = row_data[self.id].value;
            if (self.type === 'binary') {
                if (value && value.substr(0, 10).indexOf(' ') === -1) {
                    // The media subtype (png) seems to be arbitrary
                    self.src = "data:image/png;base64," + value;
                } else {
                    var imageArgs = {
                        model: options.model,
                        field: self.id,
                        id: options.id
                    }
                    if (self.resize) {
                        imageArgs.resize = self.resize;
                    }
                    self.src = instance.session.url('/web/binary/image',
                                                    imageArgs);
                }
            } else {
                if (!/\//.test(row_data[self.id].value)) {
                    self.src = '/web/static/src/img/icons/' +
                               row_data[self.id].value + '.png';
                } else {
                    self.src = row_data[self.id].value;
                }
            }

            if (self.display == 'icon' || self.display == 'thumbnail')
            {
                // use a unique id for the popup DOM node
                var popupId = "o_web_tree_image_popup-" + row_data.id.value;
                // use a unique id for the clickable DOM node
                var clickableId = "o_web_tree_image_clickable-" +
                                  row_data.id.value;

                if (!$('#' + popupId).length)
                {
                    // add full screen preview to DOM
                    $("body").append(QWeb.render("ListView.row.image.imageData",
                                                 {widget: self,
                                                  popupId: popupId}));
                }

                // defer execution until after this function has returned and
                // DOM elements have been rendered
                window.setTimeout(function() {
                    // enable full screen preview on click on icon
                        $("#" + clickableId).click(function() {
                        $('#' + popupId).modal('show');
                        return false;
                    });
                }, 0);
            }

            return QWeb.render('ListView.row.image',
                               {widget: self, clickableId: clickableId});
        },
    });
    instance.web.list.columns.add('field.image', 'instance.web.list.Image');
};
