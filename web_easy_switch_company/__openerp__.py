# -*- encoding: utf-8 -*-
################################################################################
#    See Copyright and Licence Informations undermentioned.
################################################################################

{
    'name': 'Multicompany - Easy Switch Company',
    'version': '1.0',
    'category': 'web',
    'description': """
Add menu to allow user to switch to another company more easily
===============================================================

Functionnalities :
------------------
    * Add a new menu in the top bar to switch to another company more easily;
    * Remove the old behaviour to switch company;
    * Remove the display of the current company after the name of the user, 
    the information is redundant and because the name of the company is displayed
    only if company_id != 1 by default.

Documentations :
----------------
    * Video : http://www.youtube.com/watch?v=Cpm6dg-IEQQ
    
Technical informations :
------------------------
    * Create a field function 'logo_topbar' in res_company to have a good resized logo;

Limits :
--------
    * It would be interesting to show the structure of the companies;

Copyright and Licence :
-----------------------
    * 2014, Groupement Régional Alimentaire de Proximité
    * Licence : AGPL-3 (http://www.gnu.org/licenses/)

Contacts :
----------
    * Sylvain LE GAL (https://twitter.com/legalsylvain);
    * <informatique@grap.coop> for any help or question about this module.
    """,
    'author': 'GRAP',
    'website': 'http://www.grap.coop',
    'license': 'AGPL-3',
    'depends': [
            'web',
        ],
    'data': [
            'view/res_users_view.xml',
        ],
    'demo': [],
    'js': [
            'static/src/js/switch_company.js',
        ],
    'css': [],
    'qweb': [
            'static/src/xml/switch_company.xml',
        ],
    'images': [],
    'post_load': '',
    'application': False,
    'installable': True,
    'auto_install': False,
}
