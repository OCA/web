odoo.define("web_create_write_confirm.pop_up_confirmation", function (require) {
    "use strict";

    var FormController = require("web.FormController");
    var Dialog = require("web.Dialog");
    var res = [];

    FormController.include({
        rpc_call: function (model, nameFunction, record_id, values) {
            return this._rpc({
                model: model,
                method: nameFunction,
                args: [record_id, values],
            });
        },

        _onSave: function (ev) {
            var self = this;
            var index = 0;
            var datas = [];
            var popup_values = [];
            var modelName = self.modelName ? self.modelName : false;
            var record = self.model.get(self.handle, {raw: true});
            var record_id =
                record && record.data && record.data.id ? record.data.id : false;
            var changes = self.model.localData[self.handle]._changes;

            function save() {
                ev.stopPropagation();
                self._disableButtons();
                self.saveRecord()
                    .then(self._enableButtons.bind(self))
                    .guardedCatch(self._enableButtons.bind(self));
            }

            function display_popup() {
                var def = new Promise(function (resolve, reject) {
                    if (
                        typeof popup_values !== "undefined" &&
                        typeof popup_values !== "boolean" &&
                        popup_values.length
                    ) {
                        if (popup_values[index].popup_type === "confirm") {
                            Dialog.confirm(self, popup_values[index].message, {
                                title: popup_values[index].title,
                                confirm_callback: async () => {
                                    var field_names = popup_values[
                                        index
                                    ].field_name.split(",");
                                    for (var j = 0; j < field_names.length; j++) {
                                        datas.push({
                                            name: field_names[j],
                                            value:
                                                changes && changes[field_names[j]]
                                                    ? changes[field_names[j]]
                                                    : record.data[field_names[j]] === ""
                                                    ? record.data[field_names[j]]
                                                    : false,
                                        });
                                    }
                                    index++;
                                    if (popup_values.length > index) {
                                        display_popup(popup_values);
                                    } else if (popup_values.length === index) {
                                        self.rpc_call(
                                            modelName,
                                            "execute_processing",
                                            record_id,
                                            datas
                                        );
                                        save();
                                    }
                                },
                            }).on("closed", null, resolve);
                        } else if (popup_values[index].popup_type === "alert") {
                            Dialog.alert(self, popup_values[index].message, {
                                title: popup_values[index].title,
                            });
                        }
                    } else {
                        save();
                    }
                });
            }

            self.rpc_call(
                modelName,
                "get_message_informations",
                record_id,
                changes === null ? {} : changes
            ).then(function (results) {
                popup_values = results;
                display_popup();
            });
        },
    });
});
