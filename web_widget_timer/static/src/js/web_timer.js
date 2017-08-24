odoo.define("web.datetime.timer", function (require) {
    "use strict";
    var core = require('web.core');
    var form_common = require('web.form_common');

    var TimerWidget = form_common.FormWidget.extend(form_common.ReinitializeWidgetMixin, {

        template: 'TimerWidget',

        init: function () {
            this._super.apply(this, arguments);

            var date_field = (this.node.attrs && this.node.attrs.reference_date) || false;

            if (date_field) {
                this.set({"reference_date_name": date_field});
                this.field_manager.on("field_changed:" + date_field, this, function() {
                    this.set({"reference_date": this.field_manager.get_field_value(date_field)});
                    this.set({"countDate": new Date(this.get("reference_date")).getTime()});
                });
            }

            var hours = true;
            if (this.node.attrs && this.node.attrs.hours == '0')
                hours = false;

            var minutes = true;
            if (this.node.attrs && this.node.attrs.minutes == '0')
                minutes = false;

            var seconds = true;
            if (this.node.attrs && this.node.attrs.seconds == '0')
                seconds = false;

            var options = {
                counting: (this.node.attrs && this.node.attrs.counting == 'down' && 'down') || 'up',
                hours: hours,
                minutes: minutes,
                seconds: seconds,
            }
            this.options = options;

            var self = this;
            var x = setInterval(function() {

                var now = new Date().getTime();
                var distance = 0;
                var invert = false;
                var countDate = self.get("countDate");

                if (countDate) {
                    distance = now - countDate;
                    if (distance < 0) {
                        invert = true;
                        distance = -distance;
                    }

                    var days = Math.floor(distance / (1000 * 60 * 60 * 24));
                    var hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                    var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
                    var seconds = Math.floor((distance % (1000 * 60)) / 1000);

                    if (!self.options.hours) minutes += hours * 60;
                    if (!self.options.minutes) seconds += minutes * 60;

                    var txt = days + "d "
                    if (self.options.hours) txt += hours + "h ";
                    if (self.options.minutes) txt += minutes + "m ";
                    if (self.options.seconds) txt += seconds + "s ";


                    if (invert) txt += "until ";
                    else txt += "since ";

                    txt += "<b>" + self.field_manager.fields[date_field].string + "</b>";

                    var color = 'black'
                    if ((invert && self.options.counting == 'up') || (!invert && self.options.counting == 'down')) color ='red';

                    this.$(".o_web_timer_field_draw." + self.get("reference_date_name")).html(txt).css("color",color).css('display','block');
                }
                else
                {
                    var txt =
                    this.$(".o_web_timer_field_draw." + self.get("reference_date_name")).css('display','none');
                }

            }, 1000);

        },
    });
    core.form_custom_registry.add('timer', TimerWidget);

});
