/* *
    Copyright 2018 Bejaoui Souheil <souheil_bejaoui@hotmail.fr>
    License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).
 */
odoo.define('web_filter_description.web_filter_description', function(require) {
    "use strict";
    var session = require('web.session');
    var data_manager = require('web.data_manager');
    var FavoriteMenu = require('web.FavoriteMenu');

    FavoriteMenu.include({
        start: function() {
            this.$save_name = this.$('.o_save_name');
            this.$textarea = this.$save_name.find('textarea');
            return this._super();
        },
        save_favorite: function() {
            var self = this,
                filter_name = this.$inputs[0].value,
                description = this.$textarea[0].value,
                shared_filter = this.$inputs[2].checked;
            return $.when(this._super()).then(function() {
                var filter_key = self.key_for({
                    name: filter_name,
                    user_id: shared_filter ? false : session.uid,
                    model_id: self.target_model,
                    action_id: self.action_id,
                });
                var filter = self.filters[filter_key];
                if (filter) {
                    filter.description = description;
                    return data_manager.create_filter(filter);
                }
            });
        },
        append_filter: function(filter) {
            var self = this,
                filter_name = filter.name,
                filter_description = filter.description,
                filter_key = self.key_for(filter);
            $.when(this._super(filter)).then(function() {
                self.$filters[filter_key].prop('title', filter_description ? filter_description : filter_name);
            });
        },
    });

});
