odoo.define('bi_view_editor', function (require) {
    "use strict";
    var core = require('web.core');
    var form_common = require('web.form_common');
    var Model = require('web.Model')
    var data = require('web.data');
    var Widget = require('web.Widget');
    var Dialog = require('web.Dialog');
    
    var BVEEditor = form_common.AbstractField.extend({
        template: "BVEEditor",
        activeModelMenus: [],
        currentFilter: "",
        init: function(parent, action) {
            this._super.apply(this, arguments);
        },
        start: function() {
            var self = this;
            this._super();
            this.on("change:effective_readonly", this, function() {
                this.display_field();
                this.render_value();
            });
            this.display_field();
            this.render_value();
        },
        display_field: function () {
            var self = this;
            this.$el.find(".body .right").droppable({
                accept: "div.class-list div.field",
                drop: function (event, ui) {
                    self.add_field(ui.draggable);
                    ui.draggable.draggable('option', 'revert', false );
                    ui.draggable.remove();
                }
            });
            if (!this.get("effective_readonly")) {
                this.$el.find('.search-bar').attr('disabled', false);
                this.$el.find('.class-list').css('opacity', '1');
                this.$el.find('.class-list .class').css('cursor', 'pointer');
                this.$el.find(".body .right").droppable("option", "disabled", false);
                this.$el.find('#clear').css('display', 'inline-block').click(function () {
                    self.set_fields([]);
                    self.internal_set_value('[]');
                });
                this.$el.find('.search-bar input').keyup(function(e) {
                    //Local filter
                    self.filter($(this).val());
                });
            } else {
                this.$el.find(".body .right").droppable("option", "disabled", true);
                this.$el.find('#clear').css('display', 'none');
                this.$el.find('.search-bar').attr('disabled', true);
                this.$el.find('.class-list').css('opacity', '.35');
                this.$el.find('.class-list .class').css('cursor', 'default');
            }
        },
        filter: function(val) {
            val = (typeof val != 'undefined') ? val.toLowerCase() : this.currentFilter;
            this.currentFilter = val;
            this.$el.find(".class-list .class-container").each(function() { 
                var modelData = $(this).find(".class").data('model-data');
                //TODO: filter on all model fields (name, technical name, etc)

                if(typeof modelData == 'undefined' || (modelData.name.toLowerCase().indexOf(val) == -1 && modelData.model.toLowerCase().indexOf(val) == -1))
                    $(this).hide();
                else
                    $(this).show();
            });
        },
        get_field_icons: function(field) {
            var icons = "";
            if(field.column)
                icons += "<span class='fa fa-columns' title='Column'></span> ";
            if(field.row)
                icons += "<span class='fa fa-bars' title='Row'></span> ";
            if(field.measure)
                icons += "<span class='fa fa-bar-chart-o' title='Measure'></span> ";
        
            return icons; 
        },
        update_field_view: function(row) {
            row.find("td:nth-child(3)").html(this.get_field_icons(row.data('field-data')));
        },
        render_value: function() {
            this.set_fields(JSON.parse(this.get('value')));
        },
        load_classes: function(scrollTo) {
            scrollTo = (typeof scrollTo == 'undefined') ? false : scrollTo;
            var self = this;
            var model = new Model("ir.model");
            if (this.$el.find(".field-list tbody tr").length > 0) {
                model.call("get_related_models", [this.get_model_ids()], { context: new data.CompoundContext({}) }).then(function(result) {
                    self.show_classes(result);
                });                
            } else {
                model.call("get_models", { context: new data.CompoundContext({}) }).then(function(result) {
                    self.show_classes(result);
                });
            }
        },
        show_classes: function (result) {
            var self = this;
            var model = new Model("ir.model");
            self.$el.find(".class-list .class").remove();
            self.$el.find(".class-list .field").remove();
            var css = this.get('effective_readonly') ? 'cursor: default' : 'cursor: pointer';

            for (var i = 0; i < result.length; i++) {
                var item = $("<div style=\"" + css + "\" class=\"class\" title=\"" + result[i].model  + "\" id=\"bve-class-" + result[i].id + "\">" + result[i].name + "</div>")
                            .data('model-data', result[i])
                            .click(function (evt) {
                                if(self.get("effective_readonly")) return;
                                var classel = $(this);
                                
                                if (classel.data('bve-processed')) {
                                    classel.parent().find('.field').remove();
                                    classel.data('bve-processed', false);
                                    var index = self.activeModelMenus.indexOf(classel.data('model-data').id);
                                    if(index != -1) self.activeModelMenus.splice(index, 1);
                                } else {
                                    self.activeModelMenus.push(classel.data('model-data').id);
                                    model.call("get_fields", [classel.data('model-data').id], { context: new data.CompoundContext({}) }).then(function(result) {
                                        for (var i = 0; i < result.length; i++) {
                                            classel.find("#bve-field-" + result[i].name).remove();
                                            if(self.$el.find(".field-list tbody [name=label-" + result[i].id + "]").length > 0) continue;
                                            classel.after($("<div class=\"field\" title=\"" + result[i].name + "\" id=\"bve-field-" + result[i].name + "\">" + result[i].description + "</div>")
                                                          .data('field-data', result[i])
                                                          .click(function () {
                                                              if (!self.get("effective_readonly")) {
                                                                  self.add_field($(this));
                                                              }
                                                          })
                                                          .draggable({ 
                                                              'revert': 'invalid', 
                                                              'scroll': false, 
                                                              'helper': 'clone',
                                                              'appendTo': 'body',
                                                              'containment': 'window'
                                                          })
                                                          );
                                        }
                                    });
                                    
                                    $(this).data('bve-processed', true);
                                }
                            })
                            .wrap("<div class=\"class-container\"></div>").parent();
                self.$el.find(".class-list").append(item);
                
                var index = self.activeModelMenus.indexOf(item.find(".class").data('model-data').id);
                if(index != -1 && !self.get("effective_readonly")) {
                    model.call("get_fields", [self.activeModelMenus[index]], { context: new data.CompoundContext({}) }).then(function(result) {
                        console.log(result);
                        var item = self.$el.find(".class-list #bve-class-" + result[0].model_id);
                        for (var o = 0; o < result.length; o++) {
                            if(self.$el.find(".field-list tbody [name=label-" + result[o].id + "]").length > 0) continue;
                            item.after($("<div class=\"field\" title=\"" + result[o].name + "\" id=\"bve-field-" + result[o].name + "\">" + result[o].description + "</div>")
                                       .data('field-data', result[o])
                                       .click(function () {
                                           if (!self.get("effective_readonly")) {
                                               self.add_field($(this));
                                           }
                                       })
                                       .draggable({ 
                                           'revert': 'invalid', 
                                           'scroll': false, 
                                           'helper': 'clone',
                                           'appendTo': 'body',
                                           'containment': 'window'
                                       }));
                        }
                        item.data('bve-processed', true);
                    });                    
                }
                self.filter();
            }
            
        },
        add_field_to_table: function(data, options) {
            var self = this;
            if (typeof data.row == 'undefined') {
                data.row = false;
            }
            if (typeof data.column == 'undefined') {
                data.column = false;
            }
            if (typeof data.measure == 'undefined') {
                data.measure = false;
            }

            var n = 1;
            var name = data.name;
            while ($.grep(self.get_fields(), function (el) { return el.name == data.name;}).length > 0) {
                data.name = name + '_' + n;
                n += 1;
            }
            var classes = "";
            if (typeof data.join_node != 'undefined') {
                classes = "join-node displaynone";
            }
            var delete_button = "";
            var disabled = " disabled=\"disabled\" ";
            if (!this.get("effective_readonly")) { 
                delete_button = "<span id=\"delete-" + data.id + "\" class=\"delete-button fa fa-trash-o\"/>";
                disabled = "";
            }

            self.$el.find(".field-list tbody")
                .append($("<tr class=\"" + classes + "\"><td><input " + disabled + "title=\"" + data.name + " (" + data.model + ") "+ "\" type=\"text\" name=\"label-" + data.id + "\" value=\"" + data.description + "\"/></td><td>" + data.model_name + "</td><td>" + self.get_field_icons(data) + "</td><td>" + delete_button + "</td></tr>")
                .data('field-data', data)
                .contextmenu(function(e) {
                    e.preventDefault();
                    if (self.get("effective_readonly")) return;
                    var target = $(e.currentTarget);
                    var currentFieldData = target.data('field-data');
                    
                    var contextMenu = self.$el.find(".context-menu");
                    contextMenu.css("left", e.pageX + "px");
                    contextMenu.css("top", e.pageY + "px");
                    contextMenu.mouseleave(function() { 
                        contextMenu.hide();
                    });
                    contextMenu.find("li").hover(function() { 
                        $(this).find("ul").css("color", "#000");
                        $(this).find("ul").show();
                    }, function() { 
                        $(this).find("ul").hide();
                    });
                    
                    //Set checkboxes
                    if(currentFieldData.column)
                        contextMenu.find('#column-checkbox').attr('checked', true);
                    else
                        contextMenu.find('#column-checkbox').attr('checked', false);
    
                    if(currentFieldData.row)
                        contextMenu.find('#row-checkbox').attr('checked', true);
                    else
                        contextMenu.find('#row-checkbox').attr('checked', false);
                        
                    if(currentFieldData.measure)
                        contextMenu.find('#measure-checkbox').attr('checked', true);
                    else
                        contextMenu.find('#measure-checkbox').attr('checked', false);
                        
                    if(currentFieldData.type == "float" || currentFieldData.type == "integer" || currentFieldData.type == "monetary") {
                        contextMenu.find('#column-checkbox').attr('disabled', true);
                        contextMenu.find('#row-checkbox').attr('disabled', true);
                        contextMenu.find('#measure-checkbox').attr('disabled', false);
                    }
                    else {
                        contextMenu.find('#column-checkbox').attr('disabled', false);
                        contextMenu.find('#row-checkbox').attr('disabled', false);
                        contextMenu.find('#measure-checkbox').attr('disabled', true);
                    }
                         
                    //Add change events
                    contextMenu.find('#column-checkbox').unbind("change");
                    contextMenu.find('#column-checkbox').change(function() {
                        currentFieldData.column = $(this).is(":checked");
                        target.data('field-data', currentFieldData);
                        self.update_field_view(target);
                        self.internal_set_value(JSON.stringify(self.get_fields()));
                    });    
                    contextMenu.find('#row-checkbox').unbind("change");
                    contextMenu.find('#row-checkbox').change(function() { 
                        currentFieldData.row = $(this).is(":checked");
                        target.data('field-data', currentFieldData);
                        self.update_field_view(target);
                        self.internal_set_value(JSON.stringify(self.get_fields()));
                    }); 
                    contextMenu.find('#measure-checkbox').unbind("change");
                    contextMenu.find('#measure-checkbox').change(function() { 
                        currentFieldData.measure = $(this).is(":checked");
                        target.data('field-data', currentFieldData);
                        self.update_field_view(target);
                        self.internal_set_value(JSON.stringify(self.get_fields()));
                    });
                    contextMenu.show();

                    $(document).mouseup(function (e) {
                        var container = $(".context-menu");

                        // if the target of the click isn't the container nor a descendant of the container
                        if (!container.is(e.target) && container.has(e.target).length === 0)
                        {
                            container.hide();
                        }
                    });

                })
             );

            self.$el.find('.delete-button').unbind("click");
            self.$el.find('.delete-button').click(function() {
                $(this).closest('tr').remove();
                self.clean_join_nodes();
                self.internal_set_value(JSON.stringify(self.get_fields()));                
                self.load_classes();
                return false;
            });
        },
        clean_join_nodes: function () {
            var aliases = $.makeArray(this.$el.find(".field-list tbody tr").map(function (idx, el) {
                var d = $(this).data('field-data');
                return d.table_alias;
            }));
            
            this.$el.find(".field-list tbody tr").each(function (idx, el) {
                var d = $(this).data('field-data');
                if (typeof d.join_node != 'undefined' && aliases.indexOf(d.join_node) === -1) {
                    $(this).remove();
                }
            });
        },
        get_model_ids: function () {
            var model_ids = {};
            this.$el.find(".field-list tbody tr").each(function (idx, el) {
                var d = $(this).data('field-data');
                model_ids[d.table_alias] = d.model_id;
            });
            return model_ids;
        },
        get_model_data: function () {
            var model_data = {};
            this.$el.find(".field-list tbody tr").each(function (idx, el) {
                var d = $(this).data('field-data');
                model_data[d.table_alias] = {model_id: d.model_id, model_name: d.model_name};
            });
            return model_data;            
        },
        get_table_alias: function(field) {
            if (typeof field.table_alias != 'undefined') {
                return field.table_alias;
            } else {
                var model_ids = this.get_model_ids();
                var n = 0;
                while (typeof model_ids["t" + n] != 'undefined') n++;
                return "t" + n;
            }
        },
        add_field_and_join_node: function(field, join_node) {
            var self = this;
            if (join_node.join_node == -1) {
                field.table_alias = self.get_table_alias(field);
                join_node.join_node = field.table_alias;
                self.add_field_to_table(join_node);
            } else if (join_node.table_alias == -1) {
                field.table_alias = self.get_table_alias(field);
                join_node.table_alias = field.table_alias;
                self.add_field_to_table(join_node);
            } else {
                field.table_alias = join_node.table_alias;
            }
            self.add_field_to_table(field);
            self.internal_set_value(JSON.stringify(self.get_fields()));
            self.load_classes(field);
        },
        add_field: function(field) {
            var data = field.data('field-data');
            var model = new Model("ir.model");
            var model_ids = this.get_model_ids();
            var field_data = this.get_fields();
            var self = this;
            model.call('get_join_nodes', [field_data, data], {context: {}}).then(function(result) {

                if (result.length == 1) {
                    self.add_field_and_join_node(data, result[0]);
                    self.internal_set_value(JSON.stringify(self.get_fields()));
                    //self.load_classes(data);
                } else if (result.length > 1) {
                    var pop = new JoinNodePopup(self);
                    pop.display_popup(result, self.get_model_data(), self.add_field_and_join_node.bind(self), data);
                } else {
                    // first field and table only.
                    var table_alias = self.get_table_alias(data);
                    data.table_alias = table_alias;
                    self.add_field_to_table(data);
                    self.internal_set_value(JSON.stringify(self.get_fields()));
                    self.load_classes(data);
                }
            });
        },
        get_fields: function() {
            return $.makeArray(this.$el.find(".field-list tbody tr").map(function (idx, el) {
                var d = $(this).data('field-data');
                d.description = $("input[name='label-" + d.id + "']").val();
                return d;
            }));
        },
        set_fields: function(values) {
            this.activeModelMenus = [];
            if (!values) {
                values = [];
            }
            this.$el.find('.field-list tbody tr').remove();
            for(var i = 0; i < values.length; i++) {
                this.add_field_to_table(values[i]);
            }
            this.load_classes();
        }
    });
    //instance.web.form.widgets.add('BVEEditor', 'instance.bi_view_editor.BVEEditor');
    core.form_widget_registry.add('BVEEditor', BVEEditor);

    var JoinNodePopup = Widget.extend({
        template: "JoinNodePopup",
        start: function() {
            var self = this;
        },

        display_popup: function(choices, model_data, callback, callback_data) {
            var self = this;
            this.renderElement();
            var joinnodes = this.$el.find('#join-nodes');
            joinnodes.empty();
            for (var i=0; i<choices.length; i++) {
                var description = "";
                if (choices[i].join_node != -1 && choices[i].table_alias != -1) {
                    description = "Use the field on table " + model_data[choices[i].table_alias].model_name;
                } else {
                    if (choices[i].join_node == -1) {
                        description = "Join using the field '" + choices[i].description + "' from model '" + choices[i].model_name + "'";
                    } else {
                        description = "Join using the field '" + choices[i].description + "' from new model '" + choices[i].model_name + "'";
                    }
                }
                joinnodes.append($("<a>" + description+ "</a>")
                                 .data('idx', i)
                                 .wrap("<p></p>")
                                 .parent());
                 
            }
            var dialog = new Dialog(this, {
                        dialogClass: 'oe_act_window',
                        title: "Choose Join Node",
                        $content: this.$el
            }).open();

            joinnodes.find('a').click(function() {
                callback(callback_data, choices[$(this).data('idx')]);
                dialog.close();
            });

            this.start();
        }
    });
})
