odoo.define("web_advanced_search.AdvancedSelectDialog", function (require) {
    "use strict";

    const {_t} = require("web.core");
    const dialogs = require("web.view_dialogs");

    const AdvancedSelectDialog = dialogs.SelectCreateDialog.extend({
    open: function (open) {
            var self = this;
     	    return this._super().then(function() {
	           self.opened().then( function() {
			       self.trigger_up("controller_update", {'start': true});
		       });
	        })
     },
        /**
         * - Prevent dialog from closing when clicking on line.
         * - Make sure Use Criteria button only shown when criteria selected.
         */
        custom_events: _.extend(
            {},
            dialogs.SelectCreateDialog.prototype.custom_events,
            {
                select_record: function (event) {
                    event.stopPropagation();
                },
                open_record: function (event) {
                    event.stopPropagation();
                },
                controller_update: function (event) {
                    event.stopPropagation();
                    if (this.$footer) {
	                    if (event.data.start === true) {
                           this.$footer.find(".o_use_criteria_button").hide()
		        	      return
            	        }
                        const state = event.data.state;
                        const domain = state.getDomain();
                        if (domain && domain.length > 0) {
                            this.$footer.find(".o_use_criteria_button").prop("disabled", false)
                            this.$footer.find(".o_use_criteria_button").show()
                        } else { 
                            this.$footer.find(".o_use_criteria_button").hide()
			}
                    }
                },
            }
        ),
        /**
         * Fully overide function to just show Select and Use Criteria.
         */
        _prepareButtons: function () {
            this.__buttons = [
                {
                    text: _t("Select"),
                    classes: "btn-primary o_select_button",
                    disabled: true,
                    close: true,
                    click: function () {
                        const records = this.viewController.getSelectedRecords();
                        const ids = records.map((record) => record.res_id);
                        // Alternative might be to do somehow name_get for each record.
                        const names = records.map(
                            (record) =>
                                record.data.display_name ||
                                record.data.name ||
                                String(record.res_id)
                        );
                        const description = names.join();
                        this.trigger_up("domain_selected", {
                            domain: [["id", "in", ids]],
                            description: description,
                        });
                    },
                },
                {
                    text: _t("Use criteria"),
                    classes: "btn-primary o_use_criteria_button",
                    disabled: true,
                    close: true,
                    click: function () {
                        let description = "Criteria Selected";
                        const description_list = [];
                        const controller = this.viewController;
                        const state = controller.model.get(controller.handle);
                        const domain = state.getDomain();
                        const es = controller.exportState();
                        const sm = JSON.parse(es.searchModel);
                        if (sm.ControlPanelModelExtension) {
                            const cp = sm.ControlPanelModelExtension;
                            if (cp.query && cp.query.length > 0) {
                                const filters = cp.filters;
                                const query = cp.query;
                                let active_filter = 0;
                                query.forEach(function (query_part) {
                                    active_filter = query_part.filterId;
                                    description_list.push(
                                        filters[active_filter].description
                                    );
                                });
                            }
                        }
                        if (description_list.length > 0) {
                            description = description_list.join(", ");
                        }
                        this.trigger_up("domain_selected", {
                            domain: domain,
                            description: description,
                        });
                    },
                },
                {
                    text: _t("Cancel"),
                    classes: "btn-secondary o_form_button_cancel",
                    close: true,
                },
            ];
        },
    });

    return {
        AdvancedSelectDialog: AdvancedSelectDialog,
    };
});
