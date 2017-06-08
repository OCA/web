/*
  $Author: Cristian Salamea <cristian@ayni.io>
*/

openerp.web_placeholder_date = function(instance) {
    instance.web.form.FieldDatetime.include({
	initialize_content: function() {
	    //TODO: read format from res.lang
	    lang_code = this.session.user_context.lang;
	    var placeholder = 'mm/dd/YYYY'; // en_US date format by default
	    this.alive(new instance.web.Model('res.lang').call(
		'get_placeholder', [lang_code]
	    )).then(function (results) {
		placeholder = results
	    });
	    this.node.attrs.placeholder = placeholder;
	    this._super()
	}
    })
};
