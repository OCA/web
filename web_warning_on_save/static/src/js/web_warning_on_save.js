openerp.web_warning_on_save = function (instance) {

    instance.web.FormView.include({
        on_button_save: function(e) {
//			inherit method to be able to display an alert if
//			method called returns a string
            var self = this;
            return self._super.apply(this, arguments).done(function(id){
                var model = self.model;
                var param = {
                        'model': model, 
                        'id': self.datarecord.id ? self.datarecord.id : id
                        };
                self.rpc('/web_warning_on_save/check_warning_on_save', param)
                .done(function(res) {
                    if (res != false){
                        var dialog = new instance.web.Dialog(this, {
                            title: _t("Warning"),
                            width: 850,
                        }).open();
                        dialog.$el.html(res);
                    }
                });
            })
        },
    });

};
