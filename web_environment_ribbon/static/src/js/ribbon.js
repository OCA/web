/******************************************************************************
    Copyright (C) 2015 Akretion (http://www.akretion.com)
    @author Sylvain Calador <sylvain.calador@akretion.com>

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
******************************************************************************/

openerp.web_environment_ribbon = function(instance) {

    var ribbon = $(document).find('.test-ribbon');
    ribbon.hide();

    var model = new instance.web.Model('ir.config_parameter');
    var key = 'ribbon.name';

    var res = model.call('get_param', [key]).then(
        function (name) {
            if (name && name != 'False') {
                ribbon.html(name);
                ribbon.show();
            }
        }
    );
}
