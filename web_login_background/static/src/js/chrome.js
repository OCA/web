openerp.web_login_background = function(instance){
    var module = instance.web;

    module.Login.include({
        on_db_loaded: function(result) {
            this._super(result);
            url = "/web/background/login_background_img?dbname=" + this.selected_db;
            
            $.get(url).done(function() {
                $('.oe_login').css({
                    "background-image": "url("+url+")",
                    "background-size": "cover",
                    "background-repeat": "no-repeat",
                    "background-position": "center"
                });

                $('.oe_login_bottom').css( "display", "None" );

            });
            
            login_logo_url = "/web/background/display_login_logo?dbname=" + this.selected_db;
            $.get(login_logo_url).done(function(data) {
                 if(data == "False"){
                     $('.oe_login_logo').css( "display", "None" );
                 }
            });

        }
    });
};
