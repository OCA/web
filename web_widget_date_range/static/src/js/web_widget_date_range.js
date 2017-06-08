openerp.web_widget_date_range = function (instance) {

    var QWeb = instance.web.qweb;
    var _t = instance.web._t;

    instance.web.web_widget_date_range =
        instance.web.web_widget_date_range || {};

    instance.web.views.add(
        'web_widget_date_range',
        'instance.web.web_widget_date_range'
    );

    instance.web.SearchViewDrawer.include({
        add_common_inputs: function () {
            this._super();
            this.advanced = (new instance.web.search.Advanced(this));
        }
    });

    instance.web.web_widget_date_range =
        instance.web.ListView.extend({
            init: function (parent, dataset, view_id, options) {
                this._super.apply(this, arguments);
            },
            start: function () {
                var res = this._super.apply(this, arguments);
                var self = this;
                var _parent_el = this.$el.parent();
                _parent_el.prepend(
                    QWeb.render(
                        "web_widget_date_range",
                        {widget: this}
                    )
                );
                this.date_start = new instance.web.DateTimeWidget(this);
                this.date_end = new instance.web.DateTimeWidget(this);
                this.selected_field = false;
                this.selected_type = false;
                this.fields_selection = [];
                this.date_start.appendTo(
                    _parent_el.find('.oe_web_widget_date_range_date_start')
                );
                this.date_end.appendTo(
                    _parent_el.find('.oe_web_widget_date_range_date_end')
                );
                _parent_el.find(".oe_button_apply_selection").bind(
                    "click",
                    {self: this},
                    this.apply_date_range
                );
                _parent_el.find(".oe_button_reset_selection").bind(
                    "click",
                    {self: this},
                    this.reset_date_range
                );
                // prepare date and datetime fields for select
                this.dataset.call('fields_get', [false, {}]).done(
                    function (fields) {
                        self.fields_selection.push({
                            'type': '',
                            'string': '',
                            'value': ''
                        });
                        _(fields).each(function (attributes, name) {
                            if (attributes.type == "datetime"
                                || attributes.type == "date") {
                                var choice = {
                                    'type': attributes.type,
                                    'string': attributes.string,
                                    'value': name
                                };
                                self.fields_selection.push(choice);
                            }
                        });
                        if (self.fields_selection.length) {
                            var widget_date_selection =
                                QWeb.render('field_date_selection', {
                                    widget: self
                                });
                            $(widget_date_selection).appendTo(
                                _parent_el.find(
                                    '.oe_web_widget_field_date_selection'
                                )
                            );
                            _parent_el.find(".field_date_selection").bind(
                                "change",
                                {self: self},
                                function (event) {
                                    var self = event.data.self;
                                    self.selected_field = $(this).val();
                                    self.selected_type = $(this)
                                        .find(':selected')
                                        .data('type');
                                });
                        }
                    });

                // fix switch mode manager
                var _to_change = "oe_vm_switch_web_widget_date_range";
                $('.' + _to_change)
                    .addClass("oe_vm_switch_list")
                    .removeClass(_to_change);
                return res;
            },
            apply_date_range: function (event) {
                var self = event.data.self;
                var search_view = self.getParent().searchview;
                var _advanced = search_view.drawer.advanced;
                var _start = self.date_start.get_value();
                var _end = self.date_end.get_value();
                var domain = [];
                var propositions = [];
                var proposition = false;
                if (self.selected_field == false
                    || self.selected_field == "") {
                    return;
                } else if (self.selected_type == "date") {
                    // 2014-01-01 00:12:34 => 2014-01-01
                    if (_start) {
                        _start = _start.substr(0, 10);
                    }
                    if (_end) {
                        _end = _end.substr(0, 10);
                    }
                }

                // determine domain and label
                if (_start != "" && _end != "") {
                    domain.push([self.selected_field, ">=", _start]);
                    domain.push([self.selected_field, "<=", _end]);
                    proposition = {
                        label: "Date greater or equal than " + _start
                        + " and Date less or equal than " + _end,
                        value: domain
                    };
                }
                else if (_start != "") {
                    domain.push([self.selected_field, ">=", _start]);
                    proposition = {
                        label: "Date greater or equal than " + _start,
                        value: domain
                    };
                }
                else if (_end != "") {
                    domain.push([self.selected_field, "<=", _end]);
                    proposition = {
                        label: "Date less or equal than " + _end,
                        value: domain
                    };
                }

                propositions.push(proposition);

                // apply the query
                if (domain.length) {
                    for (var i = domain.length; --i;) {
                        domain.unshift('&');
                    }
                    _advanced.view.query.add({
                        category: _t("Advanced"),
                        values: propositions,
                        field: {
                            get_context: function () {
                            },
                            get_domain: function () {
                                return domain;
                            },
                            get_groupby: function () {
                            }
                        }
                    });
                    _advanced.append_proposition();
                }
            },
            reset_date_range: function (event) {
                var self = event.data.self;
                var search_view = self.getParent().searchview;
                var _advanced = search_view.drawer.advanced;
                self.date_start.set_value("");
                self.date_end.set_value("");
                self.selected_field = false;
                self.type_field = false;
                $(".field_date_selection").val("");
                // TODO find a better way to load default facets
                /*
                 var facets = [];
                 var ilen = _advanced.view.query.length
                 for (var i = 0; i < ilen; i++) {
                 facets.push(_advanced.view.query.at(i));
                 }
                 */
                _advanced.view.query.reset();
            }
        });

};
