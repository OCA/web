openerp.web_calendar_year = function(instance) {

    instance.web_calendar.CalendarView.include({
        get_fc_init_options: function() {
            var options = this._super();
            options.buttonText.year = instance.web._t("Year");
            options.header.right = "year,month,agendaWeek,agendaDay";
            options.eventAfterAllRender = function() {
                var tableBody = $('.oe_view_manager_body');
                tableBody.find('.fake-thead').remove();
                tableBody.scroll();
            }
            return options;
        },
        init_calendar: function() {
            $('.oe_view_manager_body').scroll(function(e, handler) {
                if($(this).scrollTop() > 43) {
                    var theads = $(this).find('.fake-thead');
                    if(theads.length == 0) {
                        var original = $(this).find(".fc-skeleton");
                        var headClone = original.clone();
                        headClone.find("tbody").remove();
                        headClone.css({ 'position': 'absolute', 'left': 0, 'top': $(this).scrollTop(), 'margin-left': '5px', 'z-index': 10, 'width': (original.css("width") == "100%") ? original.width() + 'px' : original.css("width") });
                        headClone.find("th").css({'text-align': 'center'});
                        headClone.addClass('fake-thead');
                        $(this).append(headClone);
                    } else {
                        theads.css({ 'top': $(this).scrollTop() });
                    }
                } else {
                    $(this).find('.fake-thead').remove();
                }
            });
            return this._super.apply(this, arguments);
        }
    });
};
