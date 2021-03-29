odoo.define("web_list_view_general_buttons.ListController", function (require) {
    "use strict";

    var core = require("web.core");
    var ListController = require("web.ListController");

    var QWeb = core.qweb;

    ListController.include({
        init: function (parent, model, renderer) {
            this.context = renderer.state.getContext();
            this._super.apply(this, arguments);
            this.headerGeneralButtons = [];
            if (this.context.general_buttons instanceof Array) {
                this.headerGeneralButtons = this.context.general_buttons;
            }
            this.getGeneralButtons();
        },

        getGeneralButtons: async function () {
            var self = this;
            if (this.context.general_buttons === "get_general_buttons") {
                this._rpc({
                    model: this.modelName,
                    method: "get_general_buttons",
                    args: [this.context.active_id],
                    context: this.context,
                }).then(function (result) {
                    self.headerGeneralButtons = result;
                });
            }
        },

        renderButtons: function () {
            this._super.apply(this, arguments);

            if (this.headerGeneralButtons) {
                this.$generalButtons = $(
                    QWeb.render("ListView.GeneralButtons", {
                        buttons: this.headerGeneralButtons,
                    })
                );
                this.$buttons.on(
                    "click",
                    ".o_general_button",
                    this._onClickGeneralButton.bind(this)
                );
                this.$buttons.prepend(this.$generalButtons);
            }
        },

        _onClickGeneralButton: function (event) {
            var el = event.target;
            var self = this;
            self._rpc({
                model: $(el).attr("model"),
                method: $(el).attr("action"),
                args: [self.context.active_id],
                context: self.context,
            }).then(function (result) {
                return self.do_action(result);
            });
        },
    });
});
