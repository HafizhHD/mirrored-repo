var csvInput = document.getElementById('csv');
csvInput.addEventListener('change', readFile, false);
var regList;
var events;
var groups = "";
var	groupArr = [];
var groupArr1 = [];

function isGroupByPlayer(){
    return ($('input[name=grouping]:checked', '#grouping').val() == "groupByPlayer");
}

function isGroupPerEvent(){
	return ($('input[name=divGroup]:checked', '#divGroup').val() == "divGroupByEvent");
}

function readFile (evt) {
    var files = evt.target.files;
    var file = files[0];           
    var reader = new FileReader();
    reader.onload = function() {
        var csv = this.result;
        regList = csv.csvToArray({rSep:'\n'});
        var headerRow = regList[0];
        //regList = _.sortBy(_.rest(regList, 1), 1);
		regList = _.sortBy(_.rest(regList, 1), 0);
        events = headerRow.slice(6, -3);
		alert(typeof events);
        attempsHTML();
    }
    reader.readAsText(file);
}

$(function(){
    $('#generate').mouseup(function (){
		groups = "<html><head><meta charset = 'UTF-8'><link rel='stylesheet' href='bootstrap/bootstrap.min.css'><link rel='stylesheet' href='bootstrap/bootstrap-theme.min.css'><title>Grouping</title></head><body><div class='container'><div class='blog-header' id='title'><h1 class = 'blog-title'>Competition Grouping</h1></div>";
        var generator = new scoresheetGenerator();
        var numberOfAttempts = getNumberOfAttempts();
		var compGroup = $('#compGroup1').val();
        if (isGroupByPlayer()) {
            if(isGroupPerEvent()) generateByPlayer(events, compGroup, numberOfAttempts, generator);
			else generateByPlayerAll(events, compGroup, numberOfAttempts, generator);
        }
        else { // group by events
            if(isGroupPerEvent()) generateByEvent(events, compGroup, numberOfAttempts, generator);   
			else generateByEventAll(events, compGroup, numberOfAttempts, generator);
        }
        generator.generatePDF('First Round Scoresheets');
		groups+="<br><br></div><script src='bootstrap/bootstrap.min.js'></script><script src='bootstrap/bootstrap-filestyle.min.js'></script></body></html>";
		window.open("","Tes").document.write(groups);
		//myWindow.document.open();
		//myWindow.document.close();
    });
});


function attempsHTML() {
    var HTML = '<h4 style="margin-left:15px">Please select the number of attempts for the events:</h4>';
    _.each(events, function (eventCode) {
        if (eventCode != '333fm') {
            var eventName = eventNames[eventCode];
            var maxAttempts = eventDefaults[eventName].maxAttempts;
            var attempts = [5, 3, 2, 1];
            if (maxAttempts == 3) {
                attempts = [3, 2, 1];
            }
            var attemptOptions = '';
            for (var i in attempts) {
                attemptOptions += '<option>' + attempts[i] + '</option>';
            }
            var options = "<select class='form-control' id='"+ eventCode +"'>" + attemptOptions + "</select>";
            HTML += "<div class='col-sm-2 col-xs-4'>" + eventName + options + "</div>";
        }
    });
    $('#numberOfAttempts').html(HTML);
}


function getNumberOfAttempts() {
    results = {}
    _.each(events, function (eventCode) {
        if (eventCode != '333fm') {
            var eventName = eventNames[eventCode];
            var numberOfAttempts = parseInt($('#'+eventCode).find("option:selected").val());
            results[eventCode] = numberOfAttempts;
        }
    });
    return results;
}

function generateByPlayer(events, compGroup, numberOfAttempts, generator) {
	generateByEvent(events, compGroup, numberOfAttempts, generator);
    generator.five = _.sortBy(generator.five, 'ID');
    generator.three = _.sortBy(generator.three, 'ID');
    generator.two = _.sortBy(generator.two, 'ID');
    generator.one = _.sortBy(generator.one, 'ID');
}

function generateByEvent(events, compGroup, numberOfAttempts, generator) {
    
	//totalGroup = 5;
	totalComp = regList.length;
	//group = totalComp/totalGroup;
	group = compGroup;
	groups += "<br><br>";
    for (var e in events) {
		count = 0;
		g = 0;
		var eventCode = events[e];
		groups += "<br><div class='row'><h2><u><i><b>"+eventNames[eventCode]+"</b></i></u></h2>";
		_.each(regList, function (row, id) {
			id += 1;
			if(count>=group) {
				p += 1;
				count = 0;
			}
			if(g!=p) {
				groups += "<h3><b>Group "+p+"</h3></b>";
				g=p;
			}
			if (eventCode != '333fm'){
				if (row[Number(e) + 6] == '1') {
					if (eventCode == '333mbf') {
						generator.addMBFScoresheet(row[1], id, p, 1, numberOfAttempts[eventCode]);
					} else {
						generator.addScoresheet(row[1], id, p, eventNames[eventCode], 1, numberOfAttempts[eventCode]);
					}
					groups += "<div>"+row[1]+"</div>";
					count += 1;
				}
			}
        });
		groups += "</div>";
    }
}

function generateByPlayerAll(events, compGroup, numberOfAttempts, generator) {
	//totalGroup = 5;
	totalComp = regList.length;
	//group = totalComp/totalGroup;
	group = compGroup;
	groups += "<br><br>";
	//p = 1;
	//g = 0;
	for(var i = 0; i<(totalComp/group)+1; i++) {
		groupArr1.push(0);
	}
	_.each(regList, function (row, id) {
		p = Math.floor((Math.random()*totalComp/group)+1);
		while(groupArr1[p-1]>=group) {
			p = Math.floor((Math.random()*totalComp/group)+1);
		}
		//console.log(p);
        id += 1;
		/*if(((id-2)%group)+1>=group) {
			p += 1;
			groups += "</div>";
		}
		if(g!=p) {
			groups += "<div class='row'><br><h3><b>Group "+p+"</h3></b>";
			g=p;
		}*/
		var obj = {
			Name	: row[1],
			Group	: p
		};
        for (var e in events) {
            var eventCode = events[e];
            if (eventCode == '333fm'){
                continue;
            }
            if (row[Number(e) + 6] == '1') {
				if (eventCode == '333mbf') {
					generator.addMBFScoresheet(row[1], id, p, 1, numberOfAttempts[eventCode]);
				} else {
					generator.addScoresheet(row[1], id, p, eventNames[eventCode], 1, numberOfAttempts[eventCode]);
				}
			}
        }
		groupArr1[p-1] += 1;
		//groups += "<div>"+row[1]+"</div>";
		groupArr.push(obj);
    });
	arrangeHtml();
}

function arrangeHtml() {
	groupArr.sort(function(a,b) {
		return a.Group - b.Group;
	});
	for(var i = 0; i<groupArr.length; i++) {
		if(i!==0) {
			if(groupArr[i].Group > groupArr[i-1].Group) groups += "</div><div class='row'><br><h3><b>Group "+groupArr[i].Group+"</h3></b>";
		}
		else {
			groups += "<div class='row'><br><h3><b>Group "+groupArr[i].Group+"</h3></b>";
		}
		//alert(groupArr[i].Name + " " + groupArr[i].Group);
		groups += "<div>"+groupArr[i].Name+"</div>";
	}
	groups += "</div>";
}

function generateByEventAll(events, compGroup, numberOfAttempts, generator) {
    generateByPlayerAll(events, compGroup, numberOfAttempts, generator);
    generator.five = _.sortBy(generator.five, 'Event');
    generator.three = _.sortBy(generator.three, 'Event');
    generator.two = _.sortBy(generator.two, 'Event');
    generator.one = _.sortBy(generator.one, 'Event');
	
}
