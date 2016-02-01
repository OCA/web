/******************************************************************************
    Web Easy Switch Company module for OpenERP
    Copyright (C) 2014 GRAP (http://www.grap.coop)
    @author Sylvain LE GAL (https://twitter.com/legalsylvain)

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
odoo.define('web.SwitchCompanyWidget', function (require) {
    var Widget = require('web.Widget');
    var UserMenu = require('web.UserMenu');
    var Model = require('web.Model');

    /***************************************************************************
    Create an new 'SwitchCompanyWidget' widget that allow users to switch 
    from a company to another more easily.
    ***************************************************************************/
    var SwitchCompanyWidget = Widget.extend({

        template:'web_easy_switch_company.SwitchCompanyWidget',

        /***********************************************************************
        Overload section 
        ***********************************************************************/

        /**
         * Overload 'init' function to initialize the values of the widget.
         */
        init: function(parent){
            this._super(parent);
            this.companies = [];
            this.current_company_id = 0;
            this.current_company_name = '';
        },

        /**
         * Overload 'start' function to load datas from DB.
         */
        start: function () {
            this._super();
            this._load_data();
        },

        /**
         * Overload 'renderElement' function to set events on company items.
         */
        renderElement: function() {
            var self = this;
            this._super();
            if (this.companies.length === 1) {
                this.$el.hide();
            }
            else{
                this.$el.show();
                this.$el.find('.easy_switch_company_company_item').on('click', function(ev) {
                    ev.preventDefault()
                    var company_id = $(ev.target).data("company-id");

                    if (company_id != self.current_company_id){
                        var func = '/web_easy_switch_company/switch/change_current_company';
                        var param = {'company_id': company_id}
                        self.rpc(func, param).done(function(res) {
                            window.location.reload()
                        });
                    }
                });
            }
        },


        /***********************************************************************
        Custom section 
        ***********************************************************************/

        /**
         * helper function to load data from the server
         */
        _fetch: function(model, fields, domain, ctx){
            return new Model(model).query(fields).filter(domain).context(ctx).all();
        },

        /**
         * - Load data of the companies allowed to the current users;
         * - Launch the rendering of the current widget;
         */
        _load_data: function(){
            var self = this;
            // Request for current users information
            this._fetch('res.users',['company_id'],[['id','=',this.session.uid]]).then(function(res_users){
                self.current_company_id = res_users[0].company_id[0];
                self.current_company_name = res_users[0].company_id[1];
                // Request for other companies
                // We have to go through fields_view_get to emulate the
                // exact (exotic) behavior of the user preferences form in 
                // fetching the allowed companies wrt record rules.
                // Note: calling res.company.name_search with 
                //       user_preference=True in the context does 
                //       not work either.
                new Model('res.company').call('name_search',{context:{'user_preference':'True'}}).then(function(res){
                    var res_company = res;
                    for ( var i=0 ; i < res_company.length; i++) {
                        var logo_topbar, logo_state;
                        // TODO: fetching the logo of other companies fails with the
                        //       default res.company record rule, so we should
                        //       probably remove the logos from the menu :(
                        logo_topbar = self.session.url(
                            '/web/binary/image', {
                                model:'res.company', 
                                field: 'logo_topbar', 
                                id: res_company[i][0]
                            });
                        if (res_company[i][0] == self.current_company_id){
                            logo_state = '/web_easy_switch_company/static/description/selection-on.png';
                        }
                        else{
                            logo_state = '/web_easy_switch_company/static/description/selection-off.png';
                        }
                        self.companies.push({
                            id: res_company[i][0],
                            name: res_company[i][1],
                            logo_topbar: logo_topbar,
                            logo_state: logo_state
                        });
                    }
                    // Update rendering
                    self.renderElement();
                });
            });
        },

    });

    return SwitchCompanyWidget;
})
