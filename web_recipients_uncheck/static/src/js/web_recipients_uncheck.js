/*
    # -*- coding: utf-8 -*-
    ##############################################################################
    #
    #    OpenERP, Open Source Management Solution
    #    Copyright (C) 2010-2013 OpenERP s.a. (<http://openerp.com>).
    #    Copyright (C) 2013 initOS GmbH & Co. KG (<http://www.initos.com>).
    #    Author Katja Matthes <katja.matthes at initos.com>
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

openerp.web_recipients_uncheck = function(instance){
    var module = instance.mail //loading the namespace of the 'mail' module

    module.ThreadComposeMessage.include({
        bind_events: function (){
            this._super();    //calling the original method in class mail.ThreadComposeMessage

            if($(".oe_recipients input").attr('checked') == 'checked'){
                $(".oe_recipients input").trigger('click');
            }
        },
    });
};
