var player;
var selAnnIdx = 0;
var maxAnnIdx = 0;
var duration = 0;

function navigate(panel, navbar) {
	$(".nav-panel").hide();
	$("#" + panel).show();
	$(".navbar-nav li").removeClass('active');
	$("#" + navbar).addClass('active');

}

function createElementFromHTML(htmlString) {
  var div = document.createElement('div');
  div.innerHTML = htmlString.trim();

  // Change this to div.childNodes to support multiple top-level nodes
  return div.firstChild; 
}

function sec2Time(second) {
	var min = parseInt(second/60);
	var sec = parseInt(second%60);
	if(sec==0)
		sec = "00";
	return min + ":" + sec;
}

function drawAnnotation( currentTime ) {
	$('.annotation').each( function() {
	$start_time = $(this).attr('data-start');
	$end_time   = $(this).attr('data-end');
	if ( currentTime >= $start_time && currentTime <= $end_time ) {
		$(this).css('display', "block");
			$(this).css('opacity', 1);
		} else {
			$(this).css('opacity', 0);
			$(this).css('display', "none");
		}

	});
}

function drawTimeline() {
	$(".timeline").css('width', parseInt(duration * 10));
	var str = '<span class="second-mark" style="position:absoulute; left:' + (parseInt(duration * 10) - 27) + 'px;">' + sec2Time(duration) + '</span>';
	$(".time-trackbar").append(str);
	for(var i=0; i<duration; i+=30) {
		var left = i*10 - 10;
		if(i == 0)
			left = 0;
		var str = '<span class="second-mark" style="position:absoulute; left:' + (left) + 'px;">' + sec2Time(i) + '</span>';
		$(".time-trackbar").append(str);
	}
}
$(document).ready(function() {
	var screenWidth = $(window).width();
	var screenHeight = $(window).height();
	$(".right-panel").css("height", (screenHeight-66-200) + "px" );
	// $(".timeline-panel").css("width", (screenWidth) + "px");
	$("#font-panel").show();

	//$(".right-panel *").children().prop("disabled", true);


	$( ".annotation" ).draggable();

	player = videojs('my-player');
	var options = {};
	player = videojs('my-player', options, function onPlayerReady() {
	  	videojs.log('Your player is ready!');
	 
	  	// In this context, `this` is the player that was created by Video.js.
	  	//this.play();
	 
	  	// How about an event listener?
	  	this.on('ended', function() {
	    	videojs.log('Awww...over so soon?!');
	  	});

	  	this.on('loadeddata', function() {
	  		duration = this.duration();

	  		drawTimeline();
	  	})
	  	this.on('timeupdate', function () {
	  		var currentTime = this.currentTime();
	  		drawAnnotation(currentTime);
	  		
	    });

	});


	$(".video-action").on("click", function() {

		player.pause();
		$("#right-overlay").css("display", "none");

		var currentTime = player.currentTime();
		var video_wrapper = $(".video-wrapper");
		var video_wrapper = document.getElementById('videos');

		selAnnIdx = (++maxAnnIdx);

		$template = $("#annotation-template").html();
		$template = $template.replace("{{ID}}", maxAnnIdx);
		$template = $template.replace("{{LEFT}}", "300");
		$template = $template.replace("{{TOP}}", "200");
		$template = $template.replace("{{BACKGROUND}}", "rgba(0,0,0,0.6)");
		$template = $template.replace("{{FONT-SIZE}}", "12");
		$template = $template.replace("{{DATA-START}}", currentTime);
		$template = $template.replace("{{DATA-END}}", currentTime + 5);
		$template = $template.replace("{{SEL_ID}}", selAnnIdx);

		$(".video-wrapper").append($template);

		$("#annotation-" + maxAnnIdx).css("display", "block");
		$("#annotation-" + maxAnnIdx).css("opacity", 1);
		$("#annotation-" + maxAnnIdx).draggable({
			start: function( event, ui) {
				player.pause();
				$id = $(this).attr('id');
				console.log($id);
				selAnnIdx = $id.split("-")[1];
			}
		});

		setStyleDefault();
		//$('.ta-annotation').val('My Annoation');

		// append to time line
		var str = '<div class="timeline-wrapper" id="timeline-wrapper-' + maxAnnIdx + '" style="left: ' + currentTime*10 + 'px;" onclick="onTimeLineAnnotation(\'timeline-wrapper-' + selAnnIdx + '\');"><span id="inner-text-' + maxAnnIdx + '">' + $("#annotation-" + selAnnIdx).html() + '</span></div>';
		$("#timeline-1").append(str);

		$("#timeline-wrapper-" + maxAnnIdx).draggable({
			//grid: [10, 0],
			axis: "x",
			start: function() {
				selAnnIdx = $(this).attr('id').split("-")[2];
			},
			drag: function() {
				onTimelineDrag_Resize($(this).attr('id'));
				drawAnnotation(player.currentTime());
				onTimeLineAnnotation($(this).attr('id'));
			},
			stop: function() {
				onTimeLineAnnotation($(this).attr('id'));
			}
		});
		$("#timeline-wrapper-" + maxAnnIdx).resizable({
			handles: "e, w",
			resize: function(event, ui) {
				onTimelineDrag_Resize($(this).attr('id'));
				drawAnnotation(player.currentTime());
			}
		});
	});

	$(".ta-annotation").on("input", function() {
		$("#annotation-" + selAnnIdx).html($(this).val());
		$("#inner-text-" + selAnnIdx).html($(this).val());
	});

	$("#inp-bgcolor").on("change", function() {
		console.log("change", $(this).val());
		$("#annotation-" + selAnnIdx).css("background", hexToRGB($(this).val(), 0.6));
	});

	$("#inp-fcolor").on("change", function() {
		$("#annotation-" + selAnnIdx).css("color", $(this).val());
	})

	$("#sel-fsize").on("change", function() {
		console.log(this.value);
		$("#annotation-" + selAnnIdx).css("font-size", $(this).val() + "px");
	})

});

function onTimeLineAnnotation(selIdx) {
	selAnnIdx = getIndex(selIdx);
	player.currentTime($("#annotation-" + selAnnIdx).attr('data-start'));
	player.pause();
	setAnnotationStyle(selAnnIdx);
	$(".timeline-wrapper").css('border-color', 'blue');
	$("#timeline-wrapper-" + selAnnIdx).css('border-color', 'red');
}

function setAnnotationStyle(selIdx) {
	$(".ta-annotation").val($("#annotation-" + selIdx).html());
	$("#inp-bgcolor").val(rgb2hex($("#annotation-" + selIdx).css("background-color")));
	$("#inp-fcolor").val(rgb2hex($("#annotation-" + selIdx).css("color")));
	$("#sel-fsize").val($("#annotation-" + selIdx).css("font-size").replace("px", ""));
	
}

function onVideoAnnotation(selIdx) {
	selAnnIdx = getIndex(selIdx);
	player.pause();
	setAnnotationStyle(selAnnIdx);
}

function onTimelineDrag_Resize(id) {
	var idx = id.split("-")[2];
	var left = $("#" + id).css("left");
	left = left.replace("px", "");
	var width = $("#" + id).css("width").replace("px", "");
	$("#annotation-" + idx).attr('data-start', parseInt(left/10));
	$("#annotation-" + idx).attr('data-end', parseInt(left/10) + width/10);
}

function getIndex(id) {

	var temp = id.split("-");
	return temp[temp.length - 1];
}

function hexToRGB(hex, alpha) {
    var r = parseInt(hex.slice(1, 3), 16),
        g = parseInt(hex.slice(3, 5), 16),
        b = parseInt(hex.slice(5, 7), 16);

    if (alpha) {
        return "rgba(" + r + ", " + g + ", " + b + ", " + alpha + ")";
    } else {
        return "rgb(" + r + ", " + g + ", " + b + ")";
    }
}

function rgb2hex(rgb){
 rgb = rgb.match(/^rgba?[\s+]?\([\s+]?(\d+)[\s+]?,[\s+]?(\d+)[\s+]?,[\s+]?(\d+)[\s+]?/i);
 return (rgb && rgb.length === 4) ? "#" +
  ("0" + parseInt(rgb[1],10).toString(16)).slice(-2) +
  ("0" + parseInt(rgb[2],10).toString(16)).slice(-2) +
  ("0" + parseInt(rgb[3],10).toString(16)).slice(-2) : '';
}

function setStyleDefault() {
	$(".ta-annotation").val("My Annoation");
	$("#inp-bgcolor").val("#000000");
	$("#inp-fcolor").val("#FFFFFF");
	$("#sel-fsize").val("16");
}