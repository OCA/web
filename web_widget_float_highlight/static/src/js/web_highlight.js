odoo.define("web.float.highlight", function (require) {
    "use strict";
    var form_widgets = require("web.form_widgets");

    form_widgets.FieldFloat.include({

        init: function () {
            this._super.apply(this, arguments);
            var options = {
                lower_threshold: (this.options && this.options.lower_threshold) || 0,
                upper_threshold: (this.options && this.options.upper_threshold) || 0,
                lower_bg_color: (this.options && this.options.lower_bg_color) || "red",
                middle_bg_color: (this.options && this.options.middle_bg_color) || "white",
                upper_bg_color: (this.options && this.options.upper_bg_color) || "green",
                lower_txt_color: (this.options && this.options.lower_txt_color) || "white",
                middle_txt_color: (this.options && this.options.middle_txt_color) || "#666666",
                upper_txt_color: (this.options && this.options.upper_txt_color) || "white",
                always_work: (this.options && this.options.always_work) || false,
                highlight: (this.options && this.options.highlight) || false
            };
            this.lower_threshold = options.lower_threshold;
            this.upper_threshold = options.upper_threshold;
            this.lower_bg_color = options.lower_bg_color;
            this.middle_bg_color = options.middle_bg_color;
            this.upper_bg_color = options.upper_bg_color;
            this.lower_txt_color = options.lower_txt_color;
            this.middle_txt_color = options.middle_txt_color;
            this.upper_txt_color = options.upper_txt_color;
            this.always_work = options.always_work;
            this.highlight = options.highlight;
        },

        start: function () {
            var self = this;
            this._super.apply(this, arguments);
            self.render_value();

            this.on("change:value", this, function () {
                self.render_value();
            });

        },

        render_value: function () {
            this._super();
            var self = this;
            if (self.highlight && (this.get("effective_readonly") || self.always_work)) {

                var bg_color = null;
                var txt_color = null;
                var val = this.get("value");
                if (self.lower_threshold <= self.upper_threshold) {
                    if (val < self.lower_threshold) {
                        bg_color = self.lower_bg_color || "white";
                        txt_color = self.lower_txt_color || "#666666";
                    } else if (self.upper_threshold < val) {
                        bg_color = self.upper_bg_color || "white";
                        txt_color = self.upper_txt_color || "#666666";
                    } else {
                        bg_color = self.middle_bg_color || "white";
                        txt_color = self.middle_txt_color || "#666666";
                    }
                }

                this.$el.css("background-color", bg_color);
                this.$el.css("color", txt_color);
            }
        }
    });


});
