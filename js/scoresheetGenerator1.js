/**
 * The Generator object is to be passed into the generate pdf function.
 * It stores the scoresheet objects according to the number of attempts
 */
var scoresheetGenerator1 = function () {
    var A4PtSize = {
        height : 842,
        width : 595,
        topAndBottompadding: -9
    };

    var images = [];
    var canva;
    var ctx;
    var scale = 10;
	var mbfAttempts;
	var competitionName;

    this.five = [];
    this.three = [];
    this.two = [];
    this.one = [];
    this.mbf = [];

    /**
     * Add a new scoresheet in the queue for generating PDF
     * @param {string} player   
     * @param {integer} index  
	 * @param {integer} group 
     * @param {string} event  all events except 3x3 cube multiple-blindfolded
     * @param {integer} round
     * @param {integer} attempts number of attempts of the event
     */
    this.addScoresheet = function (player, index, group, event, round, attempts) {
        var scoresheet = {
            Name    : player,
            ID      : index,
			Group	: 'Group: ' + group,
            Event   : event,
            Round   : round
        };
		if(round === '' || round === '1' || round === '2' || round === '3' || round === '4' || round === 1) scoresheet.Round = 'Round ' + round;
    
        switch(attempts) {
            case 5:
                (this.five).push(scoresheet);
                break;
            case 3:
                (this.three).push(scoresheet);
                break;
            case 2:
                (this.two).push(scoresheet);
                break;
            case 1:
                (this.one).push(scoresheet);
                break;
        }
    }

    /**
     * Add a new multiple-blindfolded scoresheet in the queue for generating PDF
     * @param {string} player   
     * @param {integer} index  
	 * @param {integer} group
     * @param {integer} round
     * @param {integer} attempts number of attempts of the event
     */
    this.addMBFScoresheet = function (player, index, group, round, attempts) {
        var scoresheet = {
            Name    : player,
            ID      : index,
			Group	: 'Group: ' + group,
            Event   : "3×3 Multi-BF",
            Round   : round
        };
		if(round === '' || round === '1' || round === '2' || round === '3' || round === '4' || round === 1) scoresheet.Round = 'Round ' + round;
		scoresheet.attempts = attempts;
        (this.mbf).push(scoresheet);
    }

    /**
     * Generate the PDF for downloading
     * @param  {String} fileName the name of the file
     * @return {PDF}
     */
    this.generatePDF = function (compName, fileName) {
        setUpCanvas();
        var doc = new jsPDF('p', 'pt');
		competitionName = compName;

        var firstPage = true;
        if (this.five.length > 0){
            firstPage = false;
            generateByAttempts(this.five, doc, fiveAttemptsSettings1);
        }
        if (this.three.length > 0){
            if (!firstPage) { doc.addPage();}
            else {firstPage = false;}
            generateByAttempts(this.three, doc, threeAttemptsSettings1);
        }
        if (this.two.length > 0){
            if (!firstPage) { doc.addPage();}
            else {firstPage = false;}
            generateByAttempts(this.two, doc, twoAttemptsSettings1);
        }
        if (this.one.length > 0){
            if (!firstPage) { doc.addPage();}
            else {firstPage = false;}
            generateByAttempts(this.one, doc, oneAttemptSettings1);
        }
        if (this.mbf.length > 0){
            if (!firstPage) { doc.addPage();}
            else {firstPage = false;}
            switch ((this.mbf)[0].attempts) {
                case 3:
                    generateMBFByAttempts(this.mbf, doc, threeAttemptsSettings1);
					mbfAttempts = 6;
                    break;
                case 2:
                    generateMBFByAttempts(this.mbf, doc, twoAttemptsSettings1);
					mbfAttempts = 8;
                    break;
                case 1:
                    generateMBFByAttempts(this.mbf, doc, oneAttemptSettings1);
					mbfAttempts = 10;
                    break;
            }  
        }
		doc.save(compName + ' ' + fileName+'.pdf');
    }

    function setUpCanvas() {
        canva = document.createElement("CANVAS");
        var width = document.createAttribute("width");
        width.value = 1000;
        var height = document.createAttribute("height");
        height.value = 500;
        var style = document.createAttribute("style");
        style.value = "display:none";                          
        canva.setAttributeNode(width);
        canva.setAttributeNode(height);
        canva.setAttributeNode(style);

        ctx = canva.getContext("2d"); 
        ctx.font = "bold " + 35 * scale +"px Helvetica";
    }

    var AttemptsSettings1 = function (numberOfAttempts, sheetPerPage) {
        this.number = numberOfAttempts;
        this.sheetPerPage = sheetPerPage;
        this.spacePerSheet = (A4PtSize.height - 2 * A4PtSize.topAndBottompadding) / sheetPerPage;
        this.headerPlus1 = (this.spacePerSheet - (25 * (numberOfAttempts + 2)) - 5) / 2;
		this.headerPlus2 = this.headerPlus1 + 25
        this.attempsPlus = this.headerPlus2 + 25;
    }

    var fiveAttemptsSettings1 = new AttemptsSettings1(5, 4);
    var threeAttemptsSettings1 = new AttemptsSettings1(3, 6);
    var twoAttemptsSettings1 = new AttemptsSettings1(2, 8);
    var oneAttemptSettings1 = new AttemptsSettings1(1, 10);

    function generateByAttempts(generator, doc, settings) {
        var data = [];
        for (var a = 1; a <= settings.number; a++) {
            data.push({'attempt' : a});
        }
        var counter = 0;
        var yStart = A4PtSize.topAndBottompadding;
		var xPlus = 0;
        for (var sc in generator) {
			if (counter == settings.sheetPerPage/2) {
				xPlus = 298;
				doc.line(A4PtSize.width/2, 0, A4PtSize.width/2, A4PtSize.height);
			}
            if (counter == settings.sheetPerPage) {
                counter = 0;
                doc.addPage();
				xPlus = 0;
            }
            y = yStart + 2 * (counter%(settings.sheetPerPage/2)) * settings.spacePerSheet;
            doc.line(0, y, A4PtSize.width, y);
			y+=13*(13-settings.sheetPerPage);
			doc.setTextColor(0);
			doc.setFont("helvetica");
			doc.setFontStyle('bold');
			doc.setFontSize(14);
			asd = 0;
			if(settings.number == 5) asd = 72;
			else if(settings.number == 3) asd = 64;
			else if(settings.number == 2) asd = 40;
			else if(settings.number == 1) asd = 16;
			doc.text(competitionName, 10 + xPlus, y-asd);
			if(settings.number == 5) y-=asd/1.4;
			else if(settings.number == 3) y-=asd/1.3;
			else if(settings.number == 2) y-=asd/1.2;
			else if(settings.number == 1) y-=asd/1.5;
            var scoresheet = generator[sc];
            doc.autoTable(header1, [scoresheet], headerOptions(doc, y, settings.headerPlus1, xPlus));
			doc.autoTable(header2, [scoresheet], headerOptions(doc, y, settings.headerPlus2, xPlus));
            doc.autoTable(columns1, data, attemptsOptions(doc, y, settings.attempsPlus, xPlus, headerSpacing));
            counter++;
        }
        for (var i = counter; i < settings.sheetPerPage; i++) {
            var sc = [];
            sc.Round = 'Round';
			if (i == settings.sheetPerPage/2) {
				xPlus = 298;
				doc.line(A4PtSize.width/2, 0, A4PtSize.width/2, A4PtSize.height);
			}
            y = yStart + 2 * (i%(settings.sheetPerPage/2)) * settings.spacePerSheet;
            doc.line(0, y, A4PtSize.width, y);
			y+=13*(13-settings.sheetPerPage);
			doc.setTextColor(0);
			doc.setFont("helvetica");
			doc.setFontStyle('bold');
			doc.setFontSize(14);
			asd = 0;
			if(settings.number == 5) asd = 72;
			else if(settings.number == 3) asd = 64;
			else if(settings.number == 2) asd = 40;
			else if(settings.number == 1) asd = 16;
			doc.text(competitionName, 10 + xPlus, y-asd);
			if(settings.number == 5) y-=asd/1.4;
			else if(settings.number == 3) y-=asd/1.3;
			else if(settings.number == 2) y-=asd/1.2;
			else if(settings.number == 1) y-=asd/1.5;
            doc.autoTable(header1, [sc], headerOptions(doc, y, settings.headerPlus1, xPlus));
			doc.autoTable(header2, [sc], headerOptions(doc, y, settings.headerPlus2, xPlus));
            doc.autoTable(columns1, data, attemptsOptions(doc, y, settings.attempsPlus, xPlus, headerSpacing));
        }
    }

    function generateMBFByAttempts(generator, doc, settings) {
        var data = [];
        for (var a = 1; a <= settings.number; a++) {
            data.push({'attempt' : a});
        }
        var counter = 0;
        var yStart = A4PtSize.topAndBottompadding;
		var xPlus = 0;
        for (var scoresheet in generator) {
			if (counter == settings.sheetPerPage/2) {
				xPlus = 298;
				doc.line(A4PtSize.width/2, 0, A4PtSize.width/2, A4PtSize.height);
			}
            if (counter == settings.sheetPerPage) {
                counter = 0;
                doc.addPage();
				xPlus = 0;
            }
            y = yStart + 2 * (counter%(settings.sheetPerPage/2)) * settings.spacePerSheet;
            doc.line(0, y, A4PtSize.width, y);
			y+=13*(13-settings.sheetPerPage);
            var sc = generator[scoresheet];
            sc.Event = '3×3 Multi-BF';
			doc.setTextColor(0);
			doc.setFont("helvetica");
			doc.setFontStyle('bold');
			doc.setFontSize(14);
			asd = 0;
			if(settings.number == 5) asd = 72;
			else if(settings.number == 3) asd = 64;
			else if(settings.number == 2) asd = 40;
			else if(settings.number == 1) asd = 16;
			doc.text(competitionName, 10 + xPlus, y-asd);
			if(settings.number == 5) y-=asd/1.4;
			else if(settings.number == 3) y-=asd/1.3;
			else if(settings.number == 2) y-=asd/1.2;
			else if(settings.number == 1) y-=asd/1.5;
            doc.autoTable(header1, [sc], headerOptions(doc, y, settings.headerPlus1, xPlus));
			doc.autoTable(header2, [sc], headerOptions(doc, y, settings.headerPlus2, xPlus));
            doc.autoTable(columns1, data, attemptsOptions(doc, y, settings.attempsPlus, xPlus, headerSpacing));
            counter++;
        }
        for (var i = counter; i < settings.sheetPerPage; i++) {
            var sc = [];
            sc.Event = '3×3 Multi-BF';
            sc.Round = 'Round';
			if (i == settings.sheetPerPage/2) {
				xPlus = 298;
				doc.line(A4PtSize.width/2, 0, A4PtSize.width/2, A4PtSize.height);
			}
            y = yStart + 2 * (i%(settings.sheetPerPage/2)) * settings.spacePerSheet;
            doc.line(0, y, A4PtSize.width, y);
			y+=13*(13-settings.sheetPerPage);
			doc.setTextColor(0);
			doc.setFont("helvetica");
			doc.setFontStyle('bold');
			doc.setFontSize(14);
			asd = 0;
			if(settings.number == 5) asd = 72;
			else if(settings.number == 3) asd = 64;
			else if(settings.number == 2) asd = 40;
			else if(settings.number == 1) asd = 16;
			doc.text(competitionName, 10 + xPlus, y-asd);
			if(settings.number == 5) y-=asd/1.4;
			else if(settings.number == 3) y-=asd/1.3;
			else if(settings.number == 2) y-=asd/1.2;
			else if(settings.number == 1) y-=asd/1.5;
            doc.autoTable(header1, [sc], headerOptions(doc, y, settings.headerPlus1, xPlus));
			doc.autoTable(header2, [sc], headerOptions(doc, y, settings.headerPlus2, xPlus));
            doc.autoTable(columns1, data, attemptsOptions(doc, y, settings.attempsPlus, xPlus, headerSpacing));
        }
    }

    var header1 = [
        {key: 'ID', width : 5},
        {key: 'Name', width : 420}
    ];
	
	var header2 = [
        {key: 'Group' , width : 70},
        {key: 'Event', width : 147},
        {key: 'Round', width : 70}
    ];

    var columns1 = [
        {title: ' ', key: 'attempt', width : 5},
        {title: 'Result ([Pen]+Time+[Pen]=Result)', key: 'result', width : 400}, 
        {title: 'Judge', key: 'js', width : 50}, 
        {title: 'Player', key: 'ps', width : 50}
    ];

    var MBFcolumns = [
        {title: ' ', key: 'attempt', width : 5},
        {title: 'Displayed Time', key: 'time', width : 124},
        {title: 'Starting', key: 'start', width : 34}, 
        {title: 'Stopping', key: 'stop', width : 38},
        {title: 'Solved State', key: 'ss', width : 53},
        {title: 'Completed/Attempted', key: 'ca', width : 91},
        {title: 'Final Result', key: 'result', width : 124}, 
        {title: 'Judge Initial', key: 'js', width : 52},
        {title: 'Player Sign', key: 'ps', width : 52}
    ];

    function headerOptions(doc, yStart, yPlus, xPlus) {
        padding = 0;
        var leftAndRight = 20;
        var topAndBottom = 10;
        function containsSpecial(string){
            var allowed = 'abcdefghijklmnopqrstuvwxyz' +
                          'ABCDEFGHIJKLMNOPQRSTUVWXYZ' +
                          "1234567890 ×-.'";
            return _.some(string, function(char) {
                return !_.contains(allowed, char);
            });
        }
        return {
            lineHeight : 25,
            margins : {
                left : leftAndRight,
                right : leftAndRight,
            },
            startY : yStart + yPlus - 30,
            overflow: false,
            renderHeaderCell: function (x, y, width, height, key, value, settings) {
                // do nothing
            },
            renderCell: function (x, y, width, height, key, value, row, settings) {
                doc.setFontSize(10);
                doc.setFont("helvetica");
                doc.setFillColor(255);
                doc.rect(x/2+xPlus, y, width/2, height, 'S');
                doc.setFontStyle('bold');
                doc.setFontSize(14);
                x += 1/2;
                y += settings.lineHeight / 2 + doc.internal.getLineHeight() / 2 - 2.5;
                if (key == 'Name' && containsSpecial(value)){
                    var imgData;
                    if (localStorage.getItem(value)) {
                        imgData = localStorage.getItem(value);
                    }
                    else {
                        ctx.scale(1/scale, 1/scale);
                        ctx.fillText(value, 5 * scale, 40 * scale);
                        ctx.scale(scale, scale);
                        imgData = canva.toDataURL(value+'/png');
                        localStorage.setItem(value, imgData);
                    }
                    ctx.clearRect (0 , 0 , canva.width, canva.height);
                    doc.addImage(imgData, 'PNG', x/2 + xPlus + settings.padding/2 - 1/2, y - 16, 4 * canva.width/scale, 4 * canva.height/scale);
                }
                else {
                    if (value) {
                        doc.text('' + value, x/2 + xPlus + settings.padding/2, y);
                    }
                    else {
                        doc.setTextColor(223);
                        doc.text('' + key, x/2 + xPlus + settings.padding/2, y);
                        doc.setTextColor(0);
                    }
                    
                }
            }
        };
    }

    function attemptsOptions(doc, yStart, yPlus, xPlus, headerSpacing) {
        padding = 0;
        var leftAndRight = 20;
        var topAndBottom = 10;
        return {
            margins : {
                left : leftAndRight,
                right : leftAndRight,
            },
            startY: yStart + yPlus,
            lineHeight : 36,
            renderHeaderCell: function (x, y, width, height, key, value, settings) {
                doc.setFillColor(255);
                doc.setTextColor(0);
                doc.rect(x/2+xPlus, y, width/2, height, 'S');
                x = headerSpacing(x, key, doc);
                y += settings.lineHeight / 2 + doc.internal.getLineHeight() / 2 - 1;
                doc.text('' + value, x/2+xPlus, y);
                doc.setFontSize(7);
            },
            renderCell: function (x, y, width, height, key, value, row, settings) {
                doc.setFontSize(9);
                doc.setFillColor(row % 2 === 0 ? 245 : 255);
                doc.rect(x/2+xPlus, y, width/2, height, 'B');
                y += settings.lineHeight / 2 + doc.internal.getLineHeight() / 2 - 2.5;
                if (key == 'ca'){
                    doc.text('/', x/2 + xPlus + 43/2, y);
                } else {
                    doc.text('' + value, x/2 + xPlus + settings.padding/2, y);
                }
            }
        };
    }

    function headerSpacing(x, key, doc) {
        switch (key) {
            case 'start':
                x += 3;
            case 'stop':
                x += 2;
            case 'in':
            case 'ss':
                doc.setFontSize(8);
                x += 5;
                break;
            case 'result':
                x += 9;
            case 'time':
                x += 22;
                doc.setFontSize(11);
                break;
            case 'js':
                doc.setFontSize(8.5);
                x += 7;
                break;
            case 'ps':
                doc.setFontSize(8.5);
                x += 8;
                break;
        }
        return x;
    }

    function MBFHeaderSpacing(x, key, doc) {
        switch (key) {
            case 'ca':
                x += 1;
            case 'start':
            case 'stop':
            case 'ss':
                x += 6;
                doc.setFontSize(7.5);
                break;
            case 'result':
                x += 9;
            case 'time':
                x += 21;
                doc.setFontSize(11);
                break;
            case 'js':
                doc.setFontSize(8.5);
                x += 4;
                break;
            case 'ps':
                doc.setFontSize(8.5);
                x += 5;
                break;
        }
        return x;    
    }
}
