web auto refresh

Standard odoo does not support auto refresh the inbox message, kanban and list view when underlying model data updated by others, even though there is auto refresh option in ir.actions.act_window, this only works for old GUI client(version < 7.0). for inbound message, orders, tickets etc auto refresh function will be very useful.

Usage

To use this module, you need to:

    install
    1. get the depended module from https://bitbucket.org/anybox/bus_enhanced/
    2. install as standard procedure

    For list and kanban view auto refresh
    1. For selected model,set auto refresh parameter(>0 is enough) under setting->technical->actions->window actions
    2. goes to the list or kanban view of the selected model, in display mode
    3. login to system by open other session(another browser), create, change or delete records of the model, then save
    4. the list or kanban view will be auto refreshed
    
    For inbox message/ mail wall auto refresh
    1. no setting needed
    2. login to system and stay at the initial inbox screen, in display mode( do not invoke the compose message)
    3. from another session, create internal message on documents which you are the follower
    4. the inbox message will be auto refreshed
    
    
Techical implementation
    1. on backend(Python), generate one record into model bus.bus(notification) when relevant model data updated(create/write/unlink) by calling
    the bus.sendone('channel','message') in overwritten method create/write/unlink
    2. on frontend(javascript), declare the event listener to handle the notification message, check to see whether the notification(message)
    is relevant for the current view/ user, if so auto refresh the view, either call reload(),do_reload(), or do_search_view_search()
    
    3. this module is designed as a generic solution, if only limited models need this kind of auto refresh function, in 
    order to reduce the extra overhead(every call to create/write/unlink need to check whether notificaiton to be generated)
    introduced by this module, it is suggested to enhance the individual module accordingly.
    
    

For further information, please visit:

    https://www.odoo.com/forum/help-1

Credits
Contributors

    Fisher <szufisher@gmail.com>

Maintainer
Odoo Community Association

This module is maintained by the OCA.

OCA, or the Odoo Community Association, is a nonprofit organization whose mission is to support the collaborative development of Odoo features and promote its widespread use.

To contribute to this module, please visit http://odoo-community.org.
