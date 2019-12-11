odoo.define('web_external_help.ExternalHelp', function (require) {
    "use strict";

    var FormRenderer = require('web.FormRenderer');
    var FormController = require('web.FormController');
    var ListController = require('web.ListController');
    var DebugManager = require('web.DebugManager');
    var rpc = require('web.rpc');

    FormRenderer.include({

        /**
         * @override
         */
        _renderTagLabel: function (node) {
            var self = this;
            var $result = this._super.apply(this, arguments);
            var fieldName = node.tag === 'label' ? node.attrs.for : node.attrs.name;

            // Check wether there's any help available for the given view

            rpc.query({
                model: 'field.help.line',
                method: 'search_read',
                domain: [
                    ['field_name', '=', fieldName],
                    ['model', '=', self.state.model],
                ],
            }).then(function (data) {
                if (data) {
                    _.each(data, function (help) {
                        if (help && help.external_url) {
                            var $after_elem = $('<button>', {
                                class: 'fa fa fa-question-circle help_icon',
                                for: self._getIDForLabel(fieldName),
                                role: "button",
                            });

                            var $popup_div = $('<div/>', {
                                class: 'popup-div',
                            });

                            var $popup_text = $('<p>', {
                                class: 'text-left',
                                html: help.help_text ? help.help_text : $result.text(),
                            });

                            $popup_div.append($popup_text);

                            var $popup_elem = $('<a>', {
                                class: 'text-center',
                                for: self._getIDForLabel(fieldName),
                                role: "button",
                                href: help.external_url,
                                style: "margin-left:5px;",
                                target: '_blank',
                                html: help.link_text ? help.link_text
                                    : 'Go To the Link',
                            });

                            $popup_div.append($popup_elem);

                            var options = {
                                content: $popup_div,
                                html: true,
                                placement: 'top',
                                title: $result.text(),
                                trigger: 'focus',
                                delay: {
                                    "show": 0,
                                    "hide": 100,
                                },
                            };
                            $after_elem.popover(options);
                            $result.append($after_elem);
                        }
                    });
                }
            });
            return $result;
        },

    });

    FormController.include({
        _updateButtons: function () {
            var self = this;
            this._super.apply(this, arguments);
            if (self.$buttons) {
                rpc.query({
                    model: 'model.external.help',
                    method: 'search_read',
                    domain: [
                        ['model', '=', self.modelName],
                    ],
                }).then(function (data) {
                    if (data) {
                        _.each(data, function (help) {
                            if (help && help.external_url) {
                                var $after_elem = $('<button>', {
                                    class: 'fa fa fa-question-circle model_help',
                                    role: "button",
                                });

                                var $popup_div = $('<div/>', {
                                    class: 'popup-div',
                                });

                                var $popup_text = $('<p>', {
                                    class: 'text-left',
                                    html: help.help_text ? help.help_text
                                        : self.displayName,
                                });

                                $popup_div.append($popup_text);

                                var $popup_elem = $('<a>', {
                                    class: 'text-center',
                                    role: "button",
                                    href: help.external_url,
                                    target: '_blank',
                                    html: help.link_text ? help.link_text
                                        : 'Go To the Link',
                                });

                                $popup_div.append($popup_elem);

                                var options = {
                                    content: $popup_div,
                                    html: true,
                                    placement: 'right',
                                    title: self._title,
                                    trigger: 'focus',
                                    delay: {
                                        "show": 0,
                                        "hide": 100,
                                    },
                                };
                                $after_elem.popover(options);
                                self.$buttons.find('.model_help').remove();
                                self.$buttons.find('.o_hidden').siblings().append(
                                    $after_elem);
                            }
                        });
                    }
                });
            }
        },
    });

    ListController.include({
        renderButtons: function ($node) {
            var self = this;
            this._super.apply(this, arguments);
            if (self.$buttons) {
                rpc.query({
                    model: 'model.external.help',
                    method: 'search_read',
                    domain: [
                        ['model', '=', self.modelName],
                    ],
                }).then(function (data) {
                    if (data) {
                        _.each(data, function (help) {
                            if (help && help.external_url) {
                                var $after_elem = $('<button>', {
                                    class: 'fa fa fa-question-circle model_help',
                                    role: "button",
                                });

                                var $popup_div = $('<div/>', {
                                    class: 'popup-div',
                                });

                                var $popup_text = $('<p>', {
                                    class: 'text-left',
                                    html: help.help_text ? help.help_text
                                        : self.displayName,
                                });

                                $popup_div.append($popup_text);

                                var $popup_elem = $('<a>', {
                                    class: 'text-center',
                                    role: "button",
                                    href: help.external_url,
                                    target: '_blank',
                                    html: help.link_text ? help.link_text
                                        : 'Go To the Link',
                                });

                                $popup_div.append($popup_elem);

                                var options = {
                                    content: $popup_div,
                                    html: true,
                                    placement: 'right',
                                    title: self._title,
                                    trigger: 'focus',
                                    delay: {
                                        "show": 0,
                                        "hide": 100,
                                    },
                                };
                                $after_elem.popover(options);
                                self.$buttons.find('.model_help').remove();
                                self.$buttons.append($after_elem);
                            }
                        });
                    }
                });
            }
        },
    });

    DebugManager.include({
        model_help: function () {
            var model = this._action.res_model,
                self = this;
            rpc.query({
                model: 'model.external.help',
                method: 'search',
                args: [
                    [
                        ['model', '=', model],
                    ],
                ],
            }).then(function (ids) {
                self.do_action({
                    res_id: ids[0],
                    res_model: 'model.external.help',
                    name: 'Model Help',
                    type: 'ir.actions.act_window',
                    views: [
                        [false, 'form'],
                    ],
                    view_mode: 'form',
                    target: 'current',
                });
            });
        },

        fields_help: function () {
            var model = this._action.res_model,
                self = this;
            rpc.query({
                model: 'fields.external.help',
                method: 'search',
                args: [
                    [
                        ['model', '=', model],
                    ],
                ],
            }).then(function (ids) {
                self.do_action({
                    res_id: ids[0],
                    res_model: 'fields.external.help',
                    name: 'Fields Help',
                    type: 'ir.actions.act_window',
                    views: [
                        [false, 'form'],
                    ],
                    view_mode: 'form',
                    target: 'current',
                });
            });
        },

    });

});
