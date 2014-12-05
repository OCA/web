/* 
    OpenERP, Open Source Management Solution
    This module copyright (C) 2014 Therp BV (<http://therp.nl>).

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

openerp.web_tree_image = function (instance) {
    instance.web.list.Image = instance.web.list.Column.extend({
        /* Return an image tag */
        format: function (row_data, options) {
            if (!row_data[this.id] || !row_data[this.id].value) { return ''; }
            var src;
            if (!/\//.test(row_data[this.id].value)) {
                src = '/web/static/src/img/icons/' + row_data[this.id].value + '.png';
            } else {
                src = row_data[this.id].value;
            }
            return instance.web.qweb.render('ListView.row.image', {widget: this, src: src});
        }
    });
    instance.web.list.columns.add('field.tree_image', 'instance.web.list.Image');
};
