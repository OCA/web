/*
    # -*- coding: utf-8 -*-
    ##############################################################################
    #
    #    OpenERP, Open Source Management Solution
    #    Copyright (C) 2010-2013 OpenERP s.a. (<http://openerp.com>).
    #    Copyright (C) 2013 ThinkOpen Solutions Brasil (<http://www.tkobr.com>).
    #    Author Carlos Almeida <carlos.almeida at tkobr.com>
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
    ##############################################################################
*/

openerp.web_recipients_hide = function(instance){
    var module = instance.mail //loading the namespace of the 'mail' module

    module.ThreadComposeMessage.include({
        start: function () {
            this.options.emails_from_on_composer = false;
        },
    });
};
