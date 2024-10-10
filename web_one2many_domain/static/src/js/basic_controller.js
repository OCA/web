/* Copyright 2023 Grupo Isonor - Alexandre Díaz
 * License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html) */

odoo.define("web_one2many_domain.BasicController", function (require) {
    "use strict";

    const BasicController = require("web.BasicController");
    const concurrency = require("web.concurrency");

    BasicController.include({
        init: function () {
            this._super.apply(this, arguments);
            this.o2m_reload_mutex = new concurrency.Mutex();
        },

        /**
         * @override
         */
        _applyChanges: function (dataPointID, changes) {
            return this._super.apply(this, arguments).then(() => {
                if (this.renderer && this.renderer.state) {
                    const state = this.renderer.state;
                    const viewFieldsInfo = state.fieldsInfo[state.viewType];
                    const fieldsChanged = Object.keys(changes);
                    const viewFields = Object.keys(viewFieldsInfo);
                    const one2many_fieldNames = _.filter(viewFields, (fieldName) => {
                        if (
                            state.fields[fieldName].type === "one2many" &&
                            viewFieldsInfo[fieldName].domain &&
                            fieldsChanged.length
                        ) {
                            const domain = viewFieldsInfo[fieldName].domain;
                            let need_refresh = false;
                            // Check if it is a reference to a field
                            if (Object.hasOwn(state.fields, domain)) {
                                const refFieldInfo = state.fields[domain];
                                for (const fieldChanged of fieldsChanged) {
                                    if (
                                        refFieldInfo.depends.indexOf(fieldChanged) !==
                                        -1
                                    ) {
                                        need_refresh = true;
                                        break;
                                    }
                                }
                            } else {
                                // FIXME: Poor heuristic way to detect if field is being used in the domain
                                for (const fieldChanged of fieldsChanged) {
                                    const checkUseFieldRegex = new RegExp(
                                        `̀,\s*${fieldChanged}`
                                    );
                                    if (checkUseFieldRegex.test(domain)) {
                                        need_refresh = true;
                                        break;
                                    }
                                }
                            }
                            return need_refresh;
                        }
                    });
                    if (one2many_fieldNames.length) {
                        this.o2m_reload_mutex.exec(() => {
                            const viewWidgets = this.renderer.allFieldWidgets[state.id];
                            for (const fieldName of one2many_fieldNames) {
                                let field = state.fields[fieldName];
                                if (field.related) {
                                    field = state.fields[field.related];
                                }
                                const fieldRelated = field.relation_field;
                                const sDomain = [
                                    [fieldRelated, "in", state.res_ids],
                                ].concat(state.getDomain({fieldName: field.name}));
                                for (const widget of viewWidgets) {
                                    if (widget.name === fieldName) {
                                        this._rpc({
                                            model: field.relation,
                                            method: "search_read",
                                            kwargs: {
                                                fields: ["id"],
                                                domain: sDomain,
                                            },
                                            context: _.extend(
                                                {bin_size: true},
                                                state.getContext()
                                            ),
                                        })
                                            .then((recs) => {
                                                const params = {
                                                    ids: recs.map((item) => item.id),
                                                    offset: 1,
                                                    keepChanges: true,
                                                };
                                                return this.model.reload(
                                                    widget.value.id,
                                                    params
                                                );
                                            })
                                            .then((db_id) => {
                                                widget._updateControlPanel({
                                                    currentMinimum: 1,
                                                });
                                                widget.value = this.model.get(db_id);
                                                return widget._render();
                                            });
                                    }
                                }
                            }
                        });
                    }
                }
            });
        },
    });
});
