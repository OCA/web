odoo.define("web_create_write_confirm.pop_up_confirmation", function (require) {
    "use strict";

    var FormController = require("web.FormController");
    var Dialog = require("web.Dialog");

    FormController.include({
        getMessageInformation: function (model, nameFunction, record_id, values) {
            return this._rpc({
                model: model,
                method: nameFunction,
                args: [record_id, values],
            });
        },

        _onSave: function (ev) {
            var self = this;
            var modelName = self.modelName ? self.modelName : false;
            var record = self.model.get(self.handle, {raw: true});
            var record_id =
                record && record.data && record.data.id ? record.data.id : false;
            var changes = self.model.localData[self.handle]._changes;
            self.getMessageInformation(
                modelName,
                "get_message_informations",
                record_id,
                changes === null ? {} : changes
            ).then(function (results) {
                this.display_popup(results, record, record_id, ev, changes, modelName);
            });
        },

        display_popup: function (
            popup_values,
            record,
            record_id,
            ev,
            changes,
            modelName
        ) {
            var self = this;
            var index = 0;
            var datas = [];
            new Promise(function (resolve) {
                if (
                    typeof popup_values !== "undefined" &&
                    typeof popup_values !== "boolean" &&
                    popup_values.length
                ) {
                    if (popup_values[index].popup_type === "confirm") {
                        Dialog.confirm(self, popup_values[index].message, {
                            title: popup_values[index].title,
                            confirm_callback: async () => {
                                var field_names = popup_values[index].field_name.split(
                                    ","
                                );
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
                                    this.display_popup(
                                        popup_values,
                                        record,
                                        record_id,
                                        ev
                                    );
                                } else if (popup_values.length === index) {
                                    self.getMessageInformation(
                                        modelName,
                                        "execute_processing",
                                        record_id,
                                        datas
                                    );
                                    this.save(ev);
                                }
                            },
                        }).on("closed", null, resolve);
                    } else if (popup_values[index].popup_type === "alert") {
                        Dialog.alert(self, popup_values[index].message, {
                            title: popup_values[index].title,
                        });
                    }
                } else {
                    this.save(ev);
                }
            });
        },

        save: function ev() {
            var self = this;
            ev.stopPropagation();
            self._disableButtons();
            self.saveRecord()
                .then(self._enableButtons.bind(self))
                .guardedCatch(self._enableButtons.bind(self));
        },
    });
});
