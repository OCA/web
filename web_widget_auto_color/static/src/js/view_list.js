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

        get_colors: function(){
            return ['#86BB74', '#DBC437', '#76A6F3', '#991592', '#F7527C', '#51D419', '#CFFB03', '#CE50BE', '#AFB32A', '#7DBD55', '#CA1BF7', '#98CDBA', '#63A99F', '#906D3E', '#73E553', '#73DC34', '#944D53', '#95FAFD', '#7C5D0E', '#DED3E4', '#4C8820', '#18A6EB', '#3DD55B', '#C19A5C', '#16F40A', '#A9E927', '#F2AFBA', '#F26CC0', '#247B5F', '#A20AF4', '#6511DC', '#086393', '#8D85F4', '#2D44AB', '#EB116B', '#8ED0DE', '#0B9C2F', '#723779', '#5A32DD', '#CA4F3E', '#A3D1FB', '#51179B', '#D20520', '#067E0E', '#199107', '#8D6623', '#FC7843', '#35FFBB', '#DDD15F', '#9F332E', '#3B2D63', '#27C2A2', '#9C02C1', '#823C84', '#0CB3A0', '#3D5E6B', '#F81915', '#AAC985', '#16FE81', '#660E42', '#68B9FB', '#D06595', '#FA4F48', '#CD675D', '#0AC360', '#7BAF44', '#FC0A9B', '#65F070', '#C3E3C7', '#043359', '#80A230', '#422F61', '#04EBE8', '#01A546', '#E52390', '#5AB35D', '#AFBB14', '#B3E029', '#23BD4B', '#A2B89B', '#80CBA5', '#6439DB', '#26F19A', '#CCB7BA', '#62351C', '#FA7E3B', '#62B1B7', '#54C9C1', '#391A14', '#F2875D', '#92D5CC', '#7D9490', '#40DF9D', '#D4B5D6', '#A7B08F', '#FDC051', '#B3F9AF', '#C59A72', '#C32F0A', '#DF1EE6', '#9F4A67', '#FBA9A4', '#F58B20', '#44E991', '#FEC3DA', '#1D4316', '#0D66E4', '#7FD5AA', '#5FFC6C', '#BD5328', '#3C478F', '#02F9C3', '#FB4950', '#E9321F', '#9E0DAD', '#FBC282', '#BD39FD', '#614934', '#11A926', '#772095', '#8D5135', '#F954E3', '#584275', '#FAE173', '#13C2C1', '#083DDF', '#5E95EE', '#835481', '#DBD066', '#659B11', '#54E4A7', '#47DA71', '#0884FA', '#97DC79', '#C029CE', '#B46420', '#2064F6', '#0DF54B', '#EE3F8A', '#E9BCEB', '#E50E16', '#A8B614', '#32B062', '#3716FE', '#8E4E03', '#B91C1F', '#8D08DA', '#3A6AD5', '#96B145', '#01DB47', '#94DBC9', '#98E120', '#763E84', '#7A97C9', '#22D5C6', '#9B9854', '#C4D269', '#0D10D9', '#4F3423', '#11EEBC', '#C4AD8A', '#224611', '#EDC679', '#B85FC8', '#D306A0', '#465C7F', '#AEBBDB', '#133DC5', '#BDBD23', '#2AD9E8', '#ACE530', '#3E2BD0', '#546DB7', '#591448', '#B121C2', '#E69709', '#DC0B33', '#2F175E', '#43F463', '#203E5E', '#D90337', '#D11569', '#C5505F', '#637F5A', '#C45D69', '#037535', '#4DFEA7', '#454B59', '#A08510', '#A8C962', '#B83346', '#BE57BF', '#40D074', '#335EF3', '#22B7E7', '#71000D', '#2B43DE', '#E02883', '#49296D', '#61052D', '#FC666E', '#C5DCAA', '#D1AE8A', '#CB3150', '#7B3162', '#DF7D2A', '#234263', '#0098E8', '#AAA3DF', '#0BF28E', '#9F7758', '#01C328', '#138A3B', '#128168', '#E77CD6', '#B71FEB', '#6F86FE', '#195E2B', '#D86AE2', '#5B1009', '#4C6B3E', '#DF1E6C', '#B0F798', '#7DC767', '#AC4319', '#117BDB', '#90C1B5', '#0E97A3', '#03DCAA', '#31143E', '#4AC1DB', '#A51DBF', '#324B05', '#4DB6CD', '#67AE4D', '#47F061', '#3D6CB6', '#32B9CF', '#1F662E', '#C6EE95', '#767F36', '#72003C', '#92E621', '#0B5F3D', '#69968E', '#8F0FC5', '#01AFF1', '#FB3152', '#C077E7', '#B710B2', '#4733AA', '#523327', '#89AE5C', '#943DCD', '#5E7F14', '#6E27A7', '#5B8879', '#E40CA7', '#232849', '#3B800F', '#5B1FB8', '#FCC8C6', '#7C9E16', '#293538', '#E1D18F', '#665E7B', '#A29B81', '#8B168E', '#A40D99', '#357658', '#83A747', '#995EB1', '#ED4AE8', '#2D4D37', '#CB1C68', '#81AE49', '#F4EF4F', '#E0F299', '#103C0B', '#37D6F7', '#2D216B', '#76E351', '#FACA69', '#E491FC', '#36AD3F', '#9E23D0', '#161031', '#D00114', '#13FE7D', '#0F5F8A', '#747BE6', '#F5E5E2', '#243F0C', '#DF1A7E', '#0A2F15', '#FC8282', '#FD875A', '#B0C957', '#CC0637', '#34CF7D', '#0B62E2', '#07B9A2', '#F89A88', '#57D090', '#18F318', '#3656CC', '#0E2AF6', '#12134E', '#420106', '#81D012', '#4B2966', '#6847D4', '#CE9AB6', '#FDC807', '#79D5A8', '#1FB3BC', '#CD3B23', '#6E204C', '#D73759', '#C477C3', '#17FA10', '#9D82E7', '#64C07B', '#AFFB18', '#E8C7FF', '#BA4D52', '#60B8C5', '#5618B5', '#094D35', '#E8D90E', '#29ED6F', '#A93D16', '#62705B', '#BEA7A0', '#0748D6', '#7BE8AA', '#96396B', '#8FD44C', '#7B7EEB', '#086361', '#7E52B3', '#8F18AB', '#12DECC', '#D48574', '#BE9C7E', '#EB3952', '#D72F47', '#3E446F', '#99363C', '#20CE69', '#06A66F', '#1BD201', '#30DF94', '#3218F5', '#7D01A3', '#B41A09', '#682D54', '#577C23', '#7C74E9', '#4A0086', '#07CE39', '#F575F9', '#32C8A8', '#E10A19', '#48E3D4', '#53165B', '#DA6FA6', '#87D417', '#A08CEA', '#8DDF31', '#194853', '#B00139', '#02FC0E', '#FE024B', '#5D4A94', '#72DA2B', '#65AA22', '#91C01D', '#3EDDDE', '#77DAD4', '#5E165C', '#937A01', '#ADA254', '#A83752', '#9A691C', '#713B91', '#020145', '#1D2B80', '#65C3AD', '#883FB9', '#79A497', '#75266F', '#35C1A3', '#4EEC2E', '#59410E', '#4425D3', '#EB783B', '#A31CA7', '#00F7ED', '#B03FDA', '#A7B9FC', '#751E9A', '#F01A02', '#E29082', '#B2BC3F', '#031CEF', '#A0FC80', '#035310', '#A946EF', '#65C6FA', '#B6FD2C', '#306D04', '#1EED05', '#0300F1', '#E6C115', '#8C15F3', '#DE31A7', '#090CB7', '#7D5F97', '#F50908', '#A1624C', '#0E47BF', '#10B0C9', '#A62B8F', '#F87E37', '#B7CD91', '#2EFC46', '#60EAD2', '#8DCF76', '#723B95', '#645B1E', '#01A7E4', '#0D0775', '#A5ED71', '#996F39', '#3B5DFE', '#522EE0', '#ED8F68', '#A49545', '#304073', '#4E6E75', '#1ED971', '#1168FB', '#FFC0D6', '#4E2F01', '#84EF42', '#BDAB4F', '#620C26', '#33C5CC', '#D321FF', '#842568', '#F1221C', '#7C4109', '#5C0361', '#1C7118', '#D722A4', '#810E15', '#F0E6AB', '#D5A78A', '#8241DE', '#C69C28', '#391451', '#B20FEF', '#669E60', '#4D1764', '#BC0A66', '#636B03', '#206B5C', '#4A7D8E', '#45AFFA', '#EAAC4C', '#F5652F', '#E6E19E', '#9B97D6', '#EC577D', '#29229F', '#BC5AC5', '#BB5566', '#5F5F77', '#B286E6', '#BEB23C', '#BF0610', '#82240E', '#225874', '#CADCB2', '#6EC498', '#97F18D', '#6DDE79', '#E5B9CB', '#6A5894', '#A376CD', '#5341C9', '#3BAEBB', '#8A61FD', '#708D49', '#578982', '#6204A5', '#F92E34', '#B54179', '#EA6367']
        },

        getIntValue: function(str){
            var sum = 0
            for (i=0; i<str.length;i++){
                sum += str.charCodeAt(i);
            }
            return sum
        },

        auto_color_cell_style: function(record, column){
            style = ''
            value = record.get(column.name)
            if (value != false && value != undefined) {
                var intValue = this.getIntValue(value)
                colors = this.get_colors()
                bgcolor = colors[intValue % colors.length]
                fontcolor = this.inverse_color(bgcolor)
                style = style + 'background-color: ' + bgcolor + ';' + 'color: ' + fontcolor + ';';
            }
            return style
        }
    });
    

    instance.web.form.widgets.add('autocolor', 'instance.web.form.FieldAutoColor');
    
    instance.web.form.FieldAutoColor = instance.web.form.FieldChar.extend({
    });

};