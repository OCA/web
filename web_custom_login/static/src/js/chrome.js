openerp.web_custom_login = function(instance){
    var module = instance.web;

    module.Login.include({
        on_db_loaded: function(result) {
            this._super(result);
            var loginImg = $('.oe_login_logo img');
            loginImg.load(function(){
                $('.oe_login_logo').css({'top': '-' + (loginImg.height() + 10) + 'px'});
            }).attr('src', '/web/css/company_login_logo?dbname=' + this.selected_db);

            $('head').append($('<link rel="stylesheet" href="/web/css/company_css?dbname=' + this.selected_db + '"/>'));
        }
    });
};
