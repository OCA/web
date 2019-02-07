// Copyright (C) 2019 Cojocaru Aurelian Marcel PFA
// @author Marcel Cojocaru <marcel.cojocari@gmail.com>
// License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).

openerp.web_database_rollback = function (instance) {

    instance.web_database_rollback.RollbackButtonsWidget = instance.web.Widget.extend({

        template:'web_database_rollback.ButtonsWidget',

        renderElement: function() {
            var self = this;
            this._super();
            this.$el.show();
            this.$el.find('.activate').on('click', function(ev) {
                    self.$el.find('.activate').css("background-color", "green").css("color", "white");
                    var func = '/web_database_rollback/activate';
                    self.rpc(func, {}).done(function(res) {
                    });
            });

            this.$el.find('.rollback').on('click', function(ev) {
                    self.$el.find('.activate').css("background-color", "buttonface").css("color", "#777");
                    var func = '/web_database_rollback/rollback';
                    self.rpc(func, {}).done(function(res) {
                    });
            });
        },
    });

    instance.web.UserMenu.include({
        do_update: function () {
            this._super();
            var self = this;
            this.update_promise.done(function () {
                if (!_.isUndefined(self.rollbackButtons)) {
                    return;
                }
                self.rollbackButtons = new instance.web_database_rollback.RollbackButtonsWidget(self);
                self.rollbackButtons.prependTo(instance.webclient.$('.oe_systray'));
            });
        },
    });

}
