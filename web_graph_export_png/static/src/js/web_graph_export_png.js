openerp.web_graph_export_png = function(instance) {
    
    var _t = instance.web._t;
    
    instance.web_graph.Graph.include({
        option_selection: function (event) {
            this._super(event);
            if (event.currentTarget.getAttribute('data-choice') == 'export_png') {
                var svg = document.querySelector("svg");

                if (typeof window.XMLSerializer != "undefined") {
                    var svgData = (new XMLSerializer()).serializeToString(svg);
                } else if (typeof svg.xml != "undefined") {
                    var svgData = svg.xml;
                }

                var canvas = document.createElement("canvas");
                var svgSize = svg.getBoundingClientRect();
                canvas.width = svgSize.width;
                canvas.height = svgSize.height;
                var ctx = canvas.getContext("2d");
                //set background color
                ctx.fillStyle = 'white';
                //draw background / rect on entire canvas
                ctx.fillRect(0,0,canvas.width,canvas.height);

                var img = document.createElement("img");
                img.setAttribute("src", "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgData))) );
                img.onload = function() {
                    ctx.drawImage(img, 0, 0);
                    var imgsrc = canvas.toDataURL("image/png", 1.0);
                    var a = document.createElement("a");
                    a.download = "graph"+".png";
                    a.href = imgsrc;
                    document.body.appendChild(a);
                    a.click();
                    a.remove();
                };
            }
        },
    });
}
