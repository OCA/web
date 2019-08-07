For accessing the timeline view, you have to click on the button with the clock
icon in the view switcher. The first time you access to it, the timeline window
is zoomed to fit all the current elements, the same as when you perform a
search, filter or group by operation.

You can use the mouse scroll to zoom in or out in the timeline, and click on
any free area and drag for panning the view in that direction.

The records of your model will be shown as rectangles whose widths are the
duration of the event according our definition. You can select them clicking
on this rectangle. You can also use Ctrl or Shift keys for adding discrete
or range selections. Selected records are hightlighted with a different color
(but the difference will be more noticeable depending on the background color).
Once selected, you can drag and move the selected records across the timeline.

When a record is selected, a red cross button appears on the upper left corner
that allows to remove that record. This doesn't work for multiple records
although they were selected.

Records are grouped in different blocks depending on the group by criteria
selected (if none is specified, then the default group by is applied).
Dragging a record from one block to another change the corresponding field to
the value that represents the block. You can also click on the group name to
edit the involved record directly.

Double-click on the record to edit it. Double-click in open area to create a
new record with the group and start date linked to the area you clicked in.
By holding the Ctrl key and dragging left to right, you can create a new record
with the dragged start and end date.

**DEFAULT GROUP BY M2M or O2M FIELD**

**Use Case**:

* Timeline view

For each attendee I want to see a line in time with all of his calendar.event.
As a calendar.event can have multiple attendee, my timeline view needs to be able to display the event more than once (One time per attendee).

* Timeline filtering

I want to be able to filter on calendar.event (as usual in Odoo) but I want to be able to display only a few attendees I selected.

Let's assume that "Me" is an attendee of an event "Meeting". This event has 15 other attendees. If I search (with Odoo search bar) for event with attendee like "me", I will get the "Meeting" as result.
The timeline view will display the event "Meeting" but it has 16 attendees, therefore the timeline view will display 16 lines (corresponding to attendees).


**Feature Description**:

* Timeline view

To be able to display more than once the event on the timeline view, we made changes in the JS. The problem of displaying that information is not a "model" problem so everything should be handled in the JS part.
- To create the timeline view we get all the events (records). 
- From those events we collect all the attendees (M2M or O2M field). 
- We apply a name_get on the attendees (M2M or O2M field) collected to be able to create the lines (groups) on the timeline view.
- For each events collected we generate a fake 'id' (because the VIS library needs a unique identifier for each element) but we can reverse the fake id to get the real id.
The calls to Odoo backend are therefore standard because we send only the real ids.

* Timeline filtering

To be able to filter on display we had to create a new feature as the behaviour of the search view in Odoo should not be modified.
To do so, we add a filter (with multiselect bootstrap library) on the top left of the timeline view. This filter contains all the attendees (M2M or O2M) collected. You can search on that filter, select all or select only a part of the result.


