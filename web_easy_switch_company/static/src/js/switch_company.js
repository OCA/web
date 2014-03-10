/******************************************************************************/
/*     See __openerp__.py file for Copyright and Licence Informations.        */
/******************************************************************************/

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
            this.$el.find('.easy_switch_company_company_item').on('click', function(ev) {
                var company_id = $(ev.target).data("company-id");
                if (company_id != self.current_company_id){
                    var func = '/web_easy_switch_company/switch/change_current_company';
                    var param = {'company_id': company_id}
                    self.rpc(func, param).done(function(res) {
                        window.location.reload()
                    });
                }
            });
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
            this._fetch('res.users',['company_id','company_ids'],[['id','=',this.session.uid]]).then(function(res_users){
                self.current_company_id = res_users[0].company_id[0];
                self.current_company_name = res_users[0].company_id[1];
                // Request for other companies
                self._fetch('res.company',['name',],[['id','in', res_users[0].company_ids]]).then(function(res_company){
                    for ( var i=0 ; i < res_company.length; i++) {
                        res_company[i]['logo_topbar'] = self.session.url(
                            '/web/binary/image', {
                                model:'res.company', 
                                field: 'logo_topbar', 
                                id: res_company[i].id
                            });
                        if (res_company[i].id == self.current_company_id){
                            res_company[i]['logo_state'] = '/web_easy_switch_company/static/src/img/selection-on.png';
                        }
                        else{
                            res_company[i]['logo_state'] = '/web_easy_switch_company/static/src/img/selection-off.png';
                        }
                        self.companies.push(res_company[i]);
                    }
                    // Update rendering
                    self.renderElement();
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
        },

    });

};

