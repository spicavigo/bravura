(function(window, $, jQuery, undefined) {
    function bravura(selector, labels, opts) {
        labels = labels || {};
        opts = opts || {};
        var Data = {};
        var MainLabel = {};
        var Label = {
            "get": "Raw Data",
            "sd": "SD Running",
            "mean": "Mean Running",
            "sd_rolling": "SD Rolling (x day)",
            "mean_rolling": "Mean Rolling (x day)",
            "dailychange": "Daily Change",
            "ag_over_time": "Weekly Aggregate"
        };
        var ViewableSeries = {};
        var buttonHTML = '<div class="fl togglesize white small">Expand</div><div class="fl raw white small">Raw Data</div><div class="fl sd white small">SD</div><div class="fl mean white small">Mean</div><div class="fl sd_rolling white small">SD Rolling</div><div class="fl mean_rolling white small">Mean Rolling</div><div class="fl dailychange white small">Daily Change</div><div class="fl ag_over_time_7 white small">7 day Aggr</div><div class="clear"></div>'
        var bind_buttons = function (name){
            var container = jQuery('#'+name).parent();
            jQuery(container).find('.raw').bind('click', function(){
                if (ViewableSeries[name]['get'] == undefined) get_var(name);
                else if (ViewableSeries[name]['get'] == 0) add_series(name, "get");
                else remove_series(name, "get");
                jQuery(this).toggleClass('blue');
                jQuery(this).toggleClass('white');
            });
            jQuery(container).find('.sd').bind('click', function(){
                if (ViewableSeries[name]['sd'] == undefined) get_var(name, "sd");
                else if (ViewableSeries[name]['sd'] == 0) add_series(name, "sd");
                else remove_series(name, "sd");
                jQuery(this).toggleClass('blue');
                jQuery(this).toggleClass('white');
            });
            jQuery(container).find('.mean').bind('click', function(){
                if (ViewableSeries[name]['mean'] == undefined) get_var(name, "mean");
                else if (ViewableSeries[name]['mean'] == 0) add_series(name, "mean");
                else remove_series(name, "mean");
                jQuery(this).toggleClass('blue');
                jQuery(this).toggleClass('white');
            });
            jQuery(container).find('.sd_rolling').bind('click', function(){
                if (ViewableSeries[name]['sd_rolling'] == undefined) get_var(name, "sd_rolling", {step:3});
                else if (ViewableSeries[name]['sd_rolling'] == 0) add_series(name, "sd_rolling");
                else remove_series(name, "sd_rolling");
                jQuery(this).toggleClass('blue');
                jQuery(this).toggleClass('white');
            });
            jQuery(container).find('.mean_rolling').bind('click', function(){
                if (ViewableSeries[name]['mean_rolling'] == undefined) get_var(name, "mean_rolling", {step:3});
                else if (ViewableSeries[name]['mean_rolling'] == 0) add_series(name, "mean_rolling");
                else remove_series(name, "mean_rolling");
                jQuery(this).toggleClass('blue');
                jQuery(this).toggleClass('white');
            });
            jQuery(container).find('.dailychange').bind('click', function(){
                if (ViewableSeries[name]['dailychange'] == undefined) get_var(name, "dailychange");
                else if (ViewableSeries[name]['dailychange'] == 0) add_series(name, "dailychange");
                else remove_series(name, "dailychange");
                jQuery(this).toggleClass('blue');
                jQuery(this).toggleClass('white');
            });
            jQuery(container).find('.ag_over_time_7').bind('click', function(){
                if (ViewableSeries[name]['ag_over_time'] == undefined) get_var(name, "ag_over_time", {step:7});
                else if (ViewableSeries[name]['ag_over_time'] == 0) add_series(name, "ag_over_time");
                else remove_series(name, "ag_over_time");
                jQuery(this).toggleClass('blue');
                jQuery(this).toggleClass('white');
            });
            $(name).observe('flotr:select', function(evt){
		        var area = evt.memo[0];
		        plot(name, {
			        xaxis: {min:area.x1, max:area.x2, tickFormatter: myDateFormater},
			        yaxis: {min:area.y1, max:area.y2}
		        });

	        });
        };
        var zeroPad = function (num, places) {
            var zero = places - num.toString().length + 1;
            return Array(+(zero > 0 && zero)).join("0") + num;
        }
        var myDateFormater = function (inputTimeStamp) {
            mydate = new Date();
            mydate.setTime(inputTimeStamp*1000);
            return zeroPad(mydate.getDate(),2) + '/' + zeroPad(mydate.getMonth()+1,2);
        };
        console.log(opts);
        if (opts.dateformatter) myDateFormater = opts.dateformatter;
        var plot = function (name, opt){
            var res = [];
            for (var i in Data[name]){
                if (Data[name].hasOwnProperty(i) && ViewableSeries[name][i] == 1){
                    res.push({data:Data[name][i], label:Label[i], mouse:{track: true}});
                }
            }
            opt = opt || {xaxis:{
			                    tickFormatter: myDateFormater
			                }};
            opt = jQuery.extend(opt, {
			                
			                legend: {
			                    show:true,
			                    noColumns: 1,		// => number of colums in legend table
	                            labelBoxBorderColor: '#ccc', // => border color for the little label boxes
	                            container: null,	// => container (as jQuery object) to put legend in, null means default on top of graph
	                            position: 'ne',		// => position of default legend container within plot
	                            margin: 5,		// => distance from grid edge to default legend container within plot
	                            backgroundColor: null,	// => null means auto-detect
	                            backgroundOpacity: 0
			                },
			                points: {
	                            show: true,		// => setting to true will show points, false will hide
	                            radius: 3,		// => point radius (pixels)
	                            lineWidth: 2,		// => line width in pixels
	                            fill: true,		// => true to fill the points with a color, false for (transparent) no fill
	                            fillColor: '#ffffff'	// => fill color
                            },
                            lines: {
	                            show: true,		// => setting to true will show lines, false will hide
	                            lineWidth: 2, 		// => line width in pixels
	                            fill: false,		// => true to fill the area from the line to the x axis, false for (transparent) no fill
	                            fillColor: null		// => fill color
                            },
                            selection: {
	                            mode: 'x',		// => one of null, 'x', 'y' or 'xy'
	                            color: '#B6D9FF',	// => selection box color
	                            fps: 30			// => frames-per-second
                            },
                            mouse: {
	                            track: true,		// => true to track the mouse, no tracking otherwise
	                            color: 'purple',
		                        sensibility: 1, // => distance to show point get's smaller
		                        trackDecimals: 2,
		                        trackFormatter: function(obj){ return 'x = ' + obj.x +', y = ' + obj.y; }

                            },
                            shadowSize: 4
			            });
            var container = document.getElementById(name);
            var f = Flotr.draw(
			            container, 
			            res,
			            opt
	        );
        };
        var remove_series = function (name, series){
            ViewableSeries[name][series] = 0;
            plot(name);
        };
        var add_series = function (name, series){
            ViewableSeries[name][series] = 1;
            plot(name);
        };
        var get_var = function (name, type, options){
            type = type || 'get';
            options = options || {};
            options['type'] = type;
            options['name'] = name;
            jQuery.ajax({
                url: 'api',
                data: options,
                success: function(data){
                    data = eval(data);
                    
                    var res=[];
                    for (var i=0; i<data.length; i++) res.push([data[i][1], data[i][0]]);
                    Data[name][type]=res;
                    ViewableSeries[name][type] = 1;
                    plot(name);
                }
            });
        };

        var get_params = function (callback){
            jQuery.ajax({
                url: 'api',
                data: {"type": "get_params"},
                success: function(data){
                    PARAMS = eval(data);
                    if (callback) callback();
                }
            });
        };
        var add_item = function(index){
            Data[PARAMS[index]] = {};
            ViewableSeries[PARAMS[index]] = {}
            label = labels[PARAMS[index]] || PARAMS[index];
            var $html = jQuery('<div class="item item-' + index + '">' + '<div class="graph-title">' + label + '</div>' + buttonHTML + '<div class="graph" id="'+PARAMS[index] + '"></div>');
            try{
                jQuery(selector).append($html).isotope( 'insert', $html );
            } catch (e){
                
            }
                //get_var(PARAMS[i]);
            bind_buttons(PARAMS[index]);
            
            jQuery(selector).delegate( '.item.item-' + index + ' .togglesize', 'click', function(){
                jQuery(this).parent().toggleClass('large');
                jQuery(this).toggleClass('blue');
                jQuery(this).toggleClass('white');
                jQuery(selector).isotope('reLayout');        
                plot(jQuery(this).parent().find('.graph').attr('id'));
              });
            //jQuery('.item.item-' + index +  ' .raw').trigger('click');
        }
        this.add_item = add_item;
        var remove_item = function(index){
            jQuery(selector).isotope( 'remove', jQuery('.item.item-' + index) );
        }
        var add_items = function (){
            var html = '';
            for(var i=0; i<PARAMS.length; i++){
                html += '<div class="fl graphmenu white small" data-id="'+ i + '">' + PARAMS[i] + '</div>'
            }
            html += '<div class="clear"></div>';
            jQuery(html).insertAfter('#header');
            jQuery('.graphmenu').bind('click', function(){
                jQuery(this).toggleClass('blue');
                jQuery(this).toggleClass('white');
                var dataid = jQuery(this).attr('data-id');
                if (jQuery('.item.item-' + dataid).length)
                    remove_item(parseInt(dataid));
                else
                    add_item(parseInt(dataid));
            });
            //add_item(0);
            jQuery(selector).isotope({
                itemSelector:'.item', 
                masonry:{
                    columnWidth:30
                    }
            });
            /*jQuery(selector).delegate( '.item .togglesize', 'click', function(){
                jQuery(this).parent().toggleClass('large');
                jQuery(this).toggleClass('blue');
                jQuery(this).toggleClass('white');
                jQuery(selector).isotope('reLayout');        
                plot(jQuery(this).parent().find('.graph').attr('id'));
              });
            jQuery('.raw').trigger('click');*/
        };
        var display_dashboard = function (){
            add_items();
        };

        this.start = function(){
            get_params(display_dashboard);
        };
    }
    window.bravura = function(selector, labels, opts) {
         return new bravura(selector, labels, opts);
    };
}(window, $, jQuery));
