CHAP Links Network

http://www.almende.com
http://almende.github.com/chap-links-library/

DESCRIPTION

The Timeline is an interactive visualization chart to visualize events in time. 
The events can take place on a single date, or have a start and end date 
(a range). You can freely move and zoom in the timeline by dragging and 
scrolling in the Timeline. Events can be created, edited, and deleted in the 
timeline. The time scale on the axis is adjusted automatically, and supports 
scales ranging from milliseconds to years.

When the timeline is defined as editable, events can be moved to another time 
by dragging them. By double clicking, the contents of an event can be changed. 
An event can be deleted by clicking the delete button on the upper right. A new 
event can be added in different ways: by double clicking in the timeline, or by 
keeping the Ctrl key down and clicking or dragging in the timeline, or by 
clicking the add button in the upper left of the timeline, and then clicking or 
dragging at the right location in the timeline.

The Timeline is developed as a Google Visualization Chart in javascript. It 
runs in every browser without additional requirements. There is a GWT wrapper 
available to use the Timeline in GWT (Google Web Toolkit), you can find relevant 
documentation here.

The Timeline is designed to display up to 100 events smoothly on any modern 
browser.


USAGE

The Timeline is no built-in visualization of Google. To load the Timeline, 
download the file timeline.zip and unzip it in a sub directory timeline on your 
html page. Include the google API and the two downloaded files in the head of 
your html code:

    <script type="text/javascript" src="http://www.google.com/jsapi"></script>
    <script type="text/javascript" src="timeline/timeline.js"></script>
    <link rel="stylesheet" type="text/css" href="timeline/timeline.css">
    
The google visualization needs to be loaded in order to use DataTable.

    google.load("visualization", "1");
    google.setOnLoadCallback(drawTimeline);
    function drawTimeline() {
      // load data and create the timeline here
    }

The class name of the Timeline is links.Timeline

    var timeline = new links.Timeline(container);

After being loaded, the timeline can be drawn via the function draw(), provided 
with data and options.

    timeline.draw(data, options);

where data is a DataTable, and options is a name-value map in the JSON format.


DOCUMENTATION

Documentation can be found in the directory doc
Examples can be found in the directory examples
