/* 

   Copyright (C) 2013 Therp BV
   License: GNU AFFERO GENERAL PUBLIC LICENSE
            Version 3 or any later version

   @authors: Holger Brunn (hbrunn@therp.nl)
             Stefan Rijnhart (stefan@therp.nl)

*/

openerp.web_popup_large = function(instance) {
    instance.web.Dialog.include({
        init: function(parent, options, content)
        {
            if(!options) {
                options = {}
            }
            if (!options.width) {
                options.width = '95%';
            }
            return this._super(parent, options, content);
        },
    });
}
