/*
  $Author: Cristian Salamea <cristian@ayni.io>
*/

openerp.web_placeholder_date = function(instance) {
    instance.web.form.FieldDatetime.include({
	initialize_content: function() {
	    //TODO: read format from res.lang
	    this.node.attrs.placeholder = 'dd/mm/aaaa';
	    this._super()
	}
    })
};
