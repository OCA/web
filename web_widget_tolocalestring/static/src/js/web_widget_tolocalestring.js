openerp.web_widget_tolocalestring = function (instance) {
    instance.web.list.toLocaleString = instance.web.list.Column.extend({
        format: function (row_data, options) {
            var value = row_data[this.id].value;
            if (typeof this.tolocalestring != "undefined") { 
                var x=this.tolocalestring;
                if(x!="") {
                    if(typeof eval(x)!="undefined"){ ;
                        x = eval(x);
                        if (typeof x[0] != "undefined") { 
                            locales = x[0];
                            options = x[1];
                            extra   = x[2];
                            if(extra=="clears_zero") {
                                if (value==0) {
                                    value="";
                                }
                            }
                        }
                    }
                }
            }
            if (value!=="") {                                                    
                //https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/toLocaleString
                value=value.toLocaleString(locales, options);
            }
            return instance.web.qweb.render('ListView.row.tolocalestring', {widget: this, style: "", value: value});
        }
    });
    instance.web.list.columns.add('field.tolocalestring', 'instance.web.list.toLocaleString');
};


