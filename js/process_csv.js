var csvInput = document.getElementById('csv');
var compName;
var compNameTest;

document.getElementById('csv').onchange = function() {
	compName = document.getElementById('csv').value;
	compName = compName.replace(/^.*\\/, '');
	compname = compName.replace(/.*[\/\\]/, '');
	compNameTest = compName.split("-");
	compName = compNameTest[0];
}


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
        attempsHTML();
    }
    reader.readAsText(file);
}

$(function(){
    $('#generate').mouseup(function (){
		if($('#compName1').val() != '') compName = $('#compName1').val();
		groups = "<html><head><meta charset = 'UTF-8'><link rel='stylesheet' href='bootstrap/bootstrap.min.css'><link rel='stylesheet' href='bootstrap/bootstrap-theme.min.css'><title>Grouping</title></head><body><div class='container'><div class='blog-header' id='title'><h1 class = 'blog-title'>" + compName + " Competition Grouping</h1></div><p>* Please copy the groups before leaving!</p>";
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
        generator.generatePDF(compName, 'First Round Scoresheets');
		groups+="<br><br></div><script src='bootstrap/bootstrap.min.js'></script><script src='bootstrap/bootstrap-filestyle.min.js'></script></body></html>";
		window.open('','').document.write(groups);
		compName = '';
		compName = document.getElementById('csv').value;
		compName = compName.replace(/^.*\\/, '');
		compname = compName.replace(/.*[\/\\]/, '');
		compNameTest = compName.split("-");
		compName = compNameTest[0];
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
	group = compGroup;
	groups += "<br><br>";
    for (var e in events) {
		p=1;
		count = 0;
		g = 0;
		var eventCode = events[e];
		if (eventCode != '333fm') groups += "<br><div class='row'><h2><u><i><b>"+eventNames[eventCode]+"</b></i></u></h2>";
		_.each(regList, function (row, id) {
			if (eventCode != '333fm'){
				if (row[Number(e) + 6] == '1') {
					/*if (eventCode == '333mbf') {
						generator.addMBFScoresheet(row[1], id, p, 1, numberOfAttempts[eventCode]);
					} else {
						generator.addScoresheet(row[1], id, p, eventNames[eventCode], 1, numberOfAttempts[eventCode]);
					}*/
					count += 1;
				}
			}
        });
		lastGroup = count%group==0? group : count%group;
		realGroup = Math.ceil(count/group);
		for(var i = 0; i<realGroup; i++) {
			groupArr1.push(0);
		}
		_.each(regList, function (row, id) {
			id += 1;
			if (eventCode != '333fm'){
				if (row[Number(e) + 6] == '1') {
					p = Math.ceil(Math.random()*(realGroup));
					while(p>groupArr1.length || p==0 || (groupArr1[p-1]>=group||(p==groupArr1.length && groupArr1[p-1]>=lastGroup))) {
						p = Math.ceil(Math.random()*(realGroup));
					}
					var obj = {
						Name	: row[1],
						Group	: p
					};
					if (eventCode == '333mbf') {
						generator.addMBFScoresheet(row[1], id, p, 1, numberOfAttempts[eventCode]);
					} else {
						generator.addScoresheet(row[1], id, p, eventNames[eventCode], 1, numberOfAttempts[eventCode]);
					}
					groupArr1[p-1] += 1;
					groupArr.push(obj);
				}
			}
        });
		if (eventCode != '333fm') arrangeHtml();
		groups+="<br><br>";
		if (eventCode != '333fm') groups += "</div>";
    }
}

function generateByPlayerAll(events, compGroup, numberOfAttempts, generator) {
	totalComp = regList.length;
	group = compGroup;
	groups += "<br><br>";
	lastGroup = totalComp%group==0? group : totalComp%group;
	realGroup = Math.ceil(totalComp/group);
	for(var i = 0; i<realGroup; i++) {
		groupArr1.push(0);
	}
	_.each(regList, function (row, id) {
		p = Math.ceil(Math.random()*(realGroup));
		while(p>groupArr1.length || p==0 || (groupArr1[p-1]>=group||(p==groupArr1.length && groupArr1[p-1]>=lastGroup))) {
			p = Math.ceil(Math.random()*(realGroup));
			
		}
        id += 1;
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
			if(groupArr[i].Group > groupArr[i-1].Group) groups += "<br></div><div class='col-sm-3 col-xs-12'><h3><b>Group "+groupArr[i].Group+"</h3></b>";
		}
		else {
			groups += "<br><div group='row'><div class='col-sm-3 col-xs-12'><h3><b>Group "+groupArr[i].Group+"</h3></b>";
		}
		groups += "<div>"+groupArr[i].Name+"</div>";
	}
	groupArr1 = [];
	groupArr = [];
	groups += "<br></div></div><br>";
}

function generateByEventAll(events, compGroup, numberOfAttempts, generator) {
    generateByPlayerAll(events, compGroup, numberOfAttempts, generator);
    generator.five = _.sortBy(generator.five, 'Event');
    generator.three = _.sortBy(generator.three, 'Event');
    generator.two = _.sortBy(generator.two, 'Event');
    generator.one = _.sortBy(generator.one, 'Event');
	
}
