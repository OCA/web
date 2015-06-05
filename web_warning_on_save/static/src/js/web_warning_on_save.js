openerp.web_warning_on_save = function (instance) {

	instance.web.FormView.include({
		on_button_save: function(e) {
//			inherit method to be able to display an alert if
//			method called returns a string
			var id = 0;
			var self = this;
			self._super.apply(this, arguments).done(function(id){
				var model = self.model;
				var param = {'model': model, 
						'id': self.datarecord.id ? self.datarecord.id : id};
//				try {
				self.rpc('/web/warning_on_save/check_warning_on_save', param)
				.done(function(res) {
					if (res != false){
						alert(res);
					}
				});
//				}
//				catch(err){
//					// nothing
//				}
			})
	    },
	});

};
