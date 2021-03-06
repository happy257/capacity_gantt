$(document).ready(function(){
var empLookup = JSON.parse(sessionStorage.empLookup);
for(emp in empLookup){
	$('#devList').append('<option value="'+emp.replace('A',"")+'">'+empLookup[emp]+'</option>')
}

$("#getByDev").click(function(){
	ganttForDev($("#devList").val(),"div_"+$("#devList").val())
})
ganttForDev=function(devID,domID){
        //Get emp data from cached web service call result in session
        
        //Find target div in DOM, if not present create one
        if(domID==undefined || $("#"+domID).length==0){
            if(domID==undefined){
			    domID = "div_"+Date.now();console.log("No target Div")
			}
            $("#ganttArea").append("<div class='card ganttWrap' id='"+domID+"'><div class='ganttHead'><span class='devName'></span><span class='headCtrl'><a href='#!' class='min-ctrl'></a><a href='#!' class='del-ctrl'></a></span></div><div class='chartArea' id='"+domID+"_chart'></div></div>")
        }
        $("#"+domID+">div.ganttHead>span.devName").html(empLookup['A'+devID]+' / '+devID)
        $.get("http://localhost:3000/api/dataByDev/"+devID, function( data ) {
			  data.forEach(function(e,i){
				  var id=e.developer.split('|')[0];
				  //e.developer = e.developer.replace(id,empLookup['A'+id]);
                  e.developer =e.developer.replace(/\d{6,7}\W/g,'')
				  e.schedule.forEach(function(schEle,schIndex){
                    //SET HOVER TITLE AND COLOR CODE PER STAGE
                    schEle.title=e.title;
                    if(schEle.stage=="DEV")
                        schEle.color="#42a5f5"
                    else if(schEle.stage=="DEV-QA")
                        schEle.color="#3f51b5"
                    else if(schEle.stage=="INTERNAL-QA")
                        schEle.color="#689f38"
                    else if(schEle.stage=="QC")
                        schEle.color="#ffb74d"
				  })
			  })    
		      $("#"+domID+"_chart").css("height",data.length*25+70)
		      var chart = AmCharts.makeChart(domID+'_chart', {
				"type": "gantt",
				"period": "DD",
				"valueAxis": {
					"type": "date"
				},
				"brightnessStep": 10,
				"graph": {
					"fillAlphas": 1,
					"balloonText": "<strong>[[title]]</strong><br>[[open]]-[[value]]"
				},
				"rotate": true,
				"categoryField": "developer",
				"segmentsField": "schedule",
				"dataDateFormat": "YYYY-MM-DD",
				"colorField" : "color",
				"startDateField": "start",
				"endDateField": "end",
				"dataProvider": data,
				"chartCursor": {
					"valueBalloonsEnabled": false,
					"cursorAlpha": 0,
					"valueLineBalloonEnabled": true,
					"valueLineEnabled": true,
					"valueZoomable":true,
					"zoomable":false
				},
				"valueScrollbar": {
					"position":"top",
					"autoGridCount":true,
					"color":"#999"
				}
			});
		}).fail(function(XHR,errState,errMsg) {
			if(errState=="error"){
				console.log(XHR,errState,errMsg);
				if(XHR.status==404){
					$("#"+domID).html("<h2 class='error'>Web service not found, check URL</h2>")
				}else if(XHR.status==400){
					$("#"+domID+">.chartArea").html("<h2 class='error'>"+XHR.responseText+"</h2>")
				}
			}
		});
}
	$(document).on('click',".min-ctrl",function(){
		$(this).parents(".card").children(".chartArea").toggleClass('hide')
	})
	$(document).on('click','.del-ctrl',function(){
		$(this).parents(".card").remove()
	})
	$("#ganttForAll").click(function(){
		$("#devList option").each(function(i,e){
			$("#devList").val($(e).attr("value"));
			$("#getByDev").click();
		})
		$("#clearAll").show();
	})
	$("#clearAll").click(function(){
		$("#ganttArea").html("");
		$(this).hide();
	})
});
