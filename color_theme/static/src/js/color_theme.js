openerp.color_theme = function(instance) {
    
    var run_once_flag = false;
    var res;
    
    instance.web.WebClient.include({
        
        set_title: function(parent) {
        	
        	this._super(parent);
			
            if (this.session.session_is_valid())
            {       
                if($('.tob_bar_gradient_1 > input').length !== 0)
                {
                    $('.tob_bar_gradient_1 > input, .tob_bar_gradient_2 > input, .button_gradient_1 > input, .button_gradient_2 > input, .left_bar > input, .body_font > input, .main_menu_font > input, .sub_menu_font > input, .top_bar_menu_font > input, .tab_string > input, .many2one_font > input').ColorPicker({
                        onSubmit: function(hsb, hex, rgb, el) {
                            $(el).val(hex);
                            $(el).ColorPickerHide();
                        },
                        onBeforeShow: function () {
                            $(this).ColorPickerSetColor(this.value);
                        },
                    })
                    .bind('keyup', function(){
                        $(this).ColorPickerSetColor(this.value);
                    });
                 };                   
                
                if(run_once_flag == false)		// no need to get user theme every time page changed, load it only once
                {
                	
	                new instance.web.Model("user.theme").get_func("get_user_theme")([]).pipe(function(result) {
						res = result;
						run_once_flag = true;
					});
				};
                if(res !== null && res !== undefined)
                {
                	
					if ('WebkitTransform' in document.body.style){
                        var top_bar_gradiant = "-webkit-linear-gradient(top, #"+res['top_bar_gradient_1']+", #"+res['top_bar_gradient_2']+")";
                    	var button_gradient = "-webkit-linear-gradient(top, #"+res['button_gradient_1']+", #"+res['button_gradient_2']+")";
                    }
                    else if('MozTransform' in document.body.style){
                        var top_bar_gradiant = "-moz-linear-gradient(top, #"+res['top_bar_gradient_1']+", #"+res['top_bar_gradient_2']+")";
				        var button_gradient = "-moz-linear-gradient(top, #"+res['button_gradient_1']+", #"+res['button_gradient_2']+")";
                    }
                    else if('OTransform' in document.body.style){
					    var top_bar_gradiant = "-o-linear-gradient(top, #"+res['top_bar_gradient_1']+", #"+res['top_bar_gradient_2']+")";
					    var button_gradient = "-o-linear-gradient(top, #"+res['button_gradient_1']+", #"+res['button_gradient_2']+")";
                    }
                    else if('transform' in document.body.style){
                        var top_bar_gradiant = "linear-gradient(top, #"+res['top_bar_gradient_1']+", #"+res['top_bar_gradient_2']+")";
					    var button_gradient = "linear-gradient(top, #"+res['button_gradient_1']+", #"+res['button_gradient_2']+")";
                    };
                	
                	if($('.openerp .oe_topbar').length !== 0)	//OpenERP 7 CSS
                	{	
                        $('.oe_topbar').css({ 'background-image': top_bar_gradiant});
					    $('.openerp a.button:link, .openerp a.button:visited, .openerp button, .openerp input[type="submit"], .openerp .ui-dialog-buttonpane .ui-dialog-buttonset .ui-button').css({ 'background-image': button_gradient});
					    $('.oe_leftbar').css({ 'background': '#'+res['left_bar']});
                        $('.openerp').css({ 'color': '#'+res['body_font']});
                        $('.ui-widget-content').css({ 'color': '#'+res['body_font']});
                        $('.openerp .oe_dropdown_menu > li > a').css({ 'color': '#'+res['body_font']});
                        $('.openerp .oe_secondary_menu_section').css({ 'color': '#'+res['main_menu_font']});
                        $('.oe_secondary_submenu li a').css({ 'color': '#'+res['sub_menu_font']});
                        $('.oe_menu > li > a').css({ 'color': '#'+res['top_bar_menu_font']});
                        $('.oe_notebook > li > a').css({ 'color': '#'+res['tab_string']});
                        $('.openerp .oe_application a').css({ 'color': '#'+res['many2one_font']});
					}
					else if($('.openerp .navbar').length !== 0)		// OpenERP 8 CSS
					{
						$('.openerp .navbar').css({ 'background-image': top_bar_gradiant});
					    $('.openerp a.button:link, .openerp a.button:visited, .openerp button, .openerp input[type="submit"], .openerp .ui-dialog-buttonpane .ui-dialog-buttonset .ui-button').css({ 'background-image': button_gradient});
					    $('.oe_leftbar').css({ 'background': '#'+res['left_bar']});
                        $('.openerp').css({ 'color': '#'+res['body_font']});
                        $('.ui-widget-content').css({ 'color': '#'+res['body_font']});
                        $('.openerp .oe_dropdown_menu > li > a').css({ 'color': '#'+res['body_font']});
                        $('.openerp .oe_secondary_menu_section').css({ 'color': '#'+res['main_menu_font']});
                        $('.oe_secondary_submenu li a').css({ 'color': '#'+res['sub_menu_font']});
                        $('.oe_menu_toggler .oe_menu_text').css({ 'color': '#'+res['top_bar_menu_font']});
                        $('.oe_notebook > li > a').css({ 'color': '#'+res['tab_string']});
                        $('.openerp .oe_application a').css({ 'color': '#'+res['many2one_font']});
					};
                };
	                
            };

        },        
        
    });
    
    
    
    
};