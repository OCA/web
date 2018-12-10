/******************************************************************************

Copyright (C) 2014 - Today: GRAP (http://www.grap.coop)
@author: Sylvain LE GAL (https://twitter.com/legalsylvain)
License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).

******************************************************************************/

openerp.web_easy_switch_company = function (instance) {

    /***************************************************************************
    Create an new 'SwitchCompanyWidget' widget that allow users to switch 
    from a company to another more easily.
    ***************************************************************************/
    instance.web.SwitchCompanyWidget = instance.web.Widget.extend({

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
                    var company_id = $(ev.target).data("company-id");
                    if (company_id != self.current_company_id){
                        var func = '/web_easy_switch_company/switch/change_current_company';
                        var param = {'company_id': company_id}
                        self.rpc(func, param).done(function(res) {
                            if (self.easy_switch_company_keep_url) {
                                window.location.reload();
                            } else {
                                if (self.session.debug) {
                                    window.location = "/web/?debug";
                                } else {
                                    window.location = "/web";
                                }
                            }
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
            return new instance.web.Model(model).query(fields).filter(domain).context(ctx).all();
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
                new instance.web.Model('res.company').call('name_search',{context:{'user_preference':'True'}}).then(function(res){

                    self._fetch('ir.config_parameter', ['value'], [['key', '=', 'web_easy_switch_company.keep_url']]).then(function(res_config){
                        if (res_config.length === 1 && res_config[0].value === 'True'){
                            self.easy_switch_company_keep_url = true;
                        }
                        else {
                            self.easy_switch_company_keep_url = false;
                        }

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
                                logo_state = '/web_easy_switch_company/static/src/img/selection-on.png';
                            }
                            else{
                                logo_state = '/web_easy_switch_company/static/src/img/selection-off.png';
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
            });
        },

    });

    /***************************************************************************
    Extend 'UserMenu' Widget to insert a 'SwitchCompanyWidget' widget.
    ***************************************************************************/
    instance.web.UserMenu =  instance.web.UserMenu.extend({

        init: function(parent) {
            this._super(parent);
            var switch_button = new instance.web.SwitchCompanyWidget();
            switch_button.appendTo(instance.webclient.$el.find('.oe_systray'));
        }

    });

};

