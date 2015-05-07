openerp.web_widget_auto_color = function(instance) {
    var _t = instance.web._t,
        _lt = instance.web._lt;
    var QWeb = instance.web.qweb;

    instance.web.ListView.include({ 
    
        dh : function (n){
            var hex = (255-n).toString(16).toUpperCase();
            if (hex.length==1) {
                    hex='0'+hex;
            }
            return (hex);
        },
        
        inverse_color: function (couleur) {
            
            var r = /#?(\w{2})(\w{2})(\w{2})/i;
            var splitH = r.exec(couleur);
    
            var ar=16*Number('0x'+splitH[1].slice(0,1))+Number('0x'+splitH[1].slice(1,2));
            var br=16*Number('0x'+splitH[2].slice(0,1))+Number('0x'+splitH[2].slice(1,2));
            var cr=16*Number('0x'+splitH[3].slice(0,1))+Number('0x'+splitH[3].slice(1,2));
    
            return ('#'+this.dh(ar)+this.dh(br)+this.dh(cr));
    
        },

        get_seed_random_color: function(seed){
            color = Math.floor((Math.abs(Math.sin(seed) * 16777215)) % 16777215);
            color = color.toString(16);
            while(color.length < 6) {
                color = '0' + color;
            }
            return '#' + color;
        },

        getIntValue: function(str){
            var sum = 0
            for (i=0; i<str.length;i++){
                sum += str.charCodeAt(i);
            }
            return sum
        },

        auto_color_cell_style: function(value){
            style = ''
            if (value != "" && value != undefined) {
                var intValue = this.getIntValue(value)
                bgcolor = this.get_seed_random_color(intValue)
                fontcolor = this.inverse_color(bgcolor)
                style = style + 'background-color: ' + bgcolor + ';' + 'color: ' + fontcolor + ';';
            }
            return style
        }
    });
    

    instance.web.form.widgets.add('autocolor', 'instance.web.form.AbstractField');

};