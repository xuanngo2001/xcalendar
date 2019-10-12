/********************************************************************
 * Create xCalendar namespace.
 *******************************************************************/
if("undefined" == typeof(xCalendar))
{
  var xCalendar = {};
};


/********************************************************************
 * xCalendar's global variable.
 *******************************************************************/
xCalendar.isCalendarShown = false;

/********************************************************************
 * xCalendar's main function.
 *******************************************************************/
xCalendar.onStatusbarIconClick = function(event)
{
  var oStatusbarpanel = document.getElementById('xcal-hbox');
  
  // If the calendar is not displayed, then display it.
  //  Otherwise, close it.
  if(!xCalendar.isCalendarShown)
  {
    var oxCal = new xCalendar.Calendar();

    // User setting: Get the number of months to display before and after current month.
    var prefs = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService);
    prefs = prefs.getBranch("extensions.xcalendar.");
    
    // BAD: Workaround to set default value of spanYear. Don't know why defaults/preferences/pref.js is not called.
    try
    {
    	prefs.getIntPref("spanYear");
    }
    catch(error)
    {
    	prefs.setIntPref("spanYear", 2);
    }
    
    var iMonthsSpan = prefs.getIntPref("spanYear")*12; // Convert to months since user setting is in years.

    oxCal.render(oStatusbarpanel, iMonthsSpan);
    
    xCalendar.isCalendarShown = true;
    
  }
  else
  {
    xCalendar.removeAllChildren('xcal-hbox'); // Close it by removing all elements.
    oStatusbarpanel.setAttribute('style', 'overflow: auto;'); // FF issue?: Work around to fix the display of the 6th week outside of groupbox.
    oStatusbarpanel.setAttribute('class', 'no-top-separator');
    xCalendar.isCalendarShown = false;
  }
};

/********************************************************************
 * xCalendar's global functions.
 *******************************************************************/
// removeAllChildren(): Remove all children of an element.
xCalendar.removeAllChildren = function(sElementID)
{
  var element = document.getElementById(sElementID);
  while (element.firstChild)
  {
    element.removeChild(element.firstChild);
  }	  
};

// onOptionsAccept(): What to do after users accept the options.
xCalendar.onOptionsAccept = function(prefWindow)
{
  // For the moment, do nothing.
  // window.alert("accept.");
  return true;
};

/********************************************************************
 * Calendar class implementation: Heavy lifting here
 *******************************************************************/
// Calendar class
xCalendar.Calendar = function()
{
  this.oCalendar = document.createElement('hbox');
  this.oMonthListBox = null;
  this.bShowCalendarWeek = this.showCalendarWeek();
};

// getStartDate(): Return the start date.
xCalendar.Calendar.prototype.getStartDate = function(oCurrentDate, iMonthsPerYear, iMonthsSpan)
{
  var iCurrentMonth = oCurrentDate.getMonth(); // Note: Month starts from 0 to 11.

  var iMONTHS_SPAN = iMonthsSpan;
  var iMONTHS_PER_YEAR = iMonthsPerYear;
  
  var iStartMonth = iCurrentMonth-iMONTHS_SPAN;
  var iStartYear = oCurrentDate.getFullYear();
  
  // Adjust the start month and year if it is going to be in last year.
  if(iStartMonth<0)
  {
    iStartMonth = iStartMonth+iMONTHS_PER_YEAR;
    iStartYear--;
  }
  
  var oStartDate = new Date(iStartYear, iStartMonth, 1);
  
  return oStartDate;
};

// createWeek(): Create the whole week of a given date.
xCalendar.Calendar.prototype.createWeek = function(oDate)
{
  var iDAYS_PER_WEEK = 7;
  var oInitialDate = new Date(oDate.getFullYear(), oDate.getMonth(), oDate.getDate());
  var oTmpDate = oDate;

  // Force oTmpDate to start at the beginning of the week.
  //  If not Sunday(0), then find and set the Sunday of that week to oTmpDate.
  if(oTmpDate.getDay()!=0)
  {
    oTmpDate.setDate(oTmpDate.getDate()-oTmpDate.getDay());
  }

  // Render the whole week.
  // ***********************
  var oRow = document.createElement('row');
  
  // Add Calendar Week.
  var oMidWeekDate = new Date(oTmpDate.getFullYear(), oTmpDate.getMonth(), oTmpDate.getDate());
  oMidWeekDate.setDate(oMidWeekDate.getDate()+3); // To guarantee it is the right calendar week no matter whether a week starts on Monday or Sunday.
  if(this.bShowCalendarWeek)
  {
    var oCWCell = document.createElement('label');
    oCWCell.setAttribute('value', this.getWeekNumber(oMidWeekDate.getFullYear(), oMidWeekDate.getMonth(), oMidWeekDate.getDate()));
    oCWCell.setAttribute('class', 'cw');
    oRow.appendChild(oCWCell);
  }
  
  // Render days of a week.
  var oCurrentDate = new Date(); // Use for comparison only.
  for(i=0; i<iDAYS_PER_WEEK; i++)
  {
    var oCell = document.createElement('label');
    oCell.setAttribute('value', oTmpDate.getDate());
    
      /****************
       * Customization
       ****************/
      // Highlight today cell.
      if(oTmpDate.getFullYear()==oCurrentDate.getFullYear() && 
          oTmpDate.getMonth()==oCurrentDate.getMonth() && 
          oTmpDate.getDate()==oCurrentDate.getDate() &&
          oInitialDate.getMonth()==oTmpDate.getMonth() // Fix: Otherwise, it will also highlight the current date in the next month, which should be disabled(e.g 2011-03-30).         
        )
      {
        oCell.setAttribute("id", "today");
      }
      
      // Highlight weekend
      if(oTmpDate.getDay()==0 || oTmpDate.getDay()==6)// 0=Sunday, 6=Saturday
      {
        oCell.setAttribute("class", "weekend");
      }
      
      // Gray out days not part of the month.
      // Note: Put this at the end to overwrite the "Highlight weekend".
      if(oInitialDate.getMonth()!=oTmpDate.getMonth())
      {
        oCell.setAttribute("class", "day-not-part-of-month");
      }
    
    oRow.appendChild(oCell);
    oTmpDate.setDate(oTmpDate.getDate()+1);
  }

  this.oMonthListBox.appendChild(oRow); // 'this' is mandatory.
  
  return oTmpDate;
};

// createMonth(): Create the whole month of a given date.
xCalendar.Calendar.prototype.createMonth = function(oDate)
{
  var oTmpDate = oDate;
  var iCurrentMonth = oTmpDate.getMonth();

  // Force the date to start at the beginning of the month.
  oTmpDate.setDate(1);
    
  // Render weeks as long as it is within the same month.
  while(iCurrentMonth == oTmpDate.getMonth())
  { 
    oTmpDate = this.createWeek(oTmpDate);
  }
  
  return oTmpDate;
};

// createCalendar(): Create X(iMonthsSpan) months before and after the current date.
xCalendar.Calendar.prototype.createCalendar = function(iMonthsSpan)
{
  var oCurrentDate = new Date();
  var iMONTHS_PER_YEAR = 12;

  var oStartDate = this.getStartDate(oCurrentDate, iMONTHS_PER_YEAR, iMonthsSpan);
  var iMonth = oStartDate.getMonth();

  var iTOTAL_MONTHS = iMonthsSpan*2+1;

  var oMonthDate = oStartDate;
  for(j=0; j<iTOTAL_MONTHS; j++) //?? Don't know why can't use i.
  {
    // Create listbox for the month.
    this.oMonthListBox = document.createElement('rows');
    var sMonthId = oMonthDate.getFullYear()+'-'+(oMonthDate.getMonth()+1); // Make sure the ID string constructed matches with onStatusbarIconClick.oThisMonth
    this.oMonthListBox.setAttribute('id', sMonthId);
    

    // Create headers
    //*****************
    var oHeaderRow = document.createElement('row');
    // Add calendar week header.
    if(this.bShowCalendarWeek)
    {	
        var oCell = document.createElement('label');
        oCell.setAttribute('value', ' '); // No label for calendar week header.
        oCell.setAttribute('class', 'cw-header');
        oHeaderRow.appendChild(oCell);
    }
    // Create headers for each day of the week.
    var aDaysOfWeek = new Array('S', 'M', 'T', 'W', 'T', 'F', 'S');
    for(k=0; k<aDaysOfWeek.length; k++)
    {
      var oCell = document.createElement('label');
      oCell.setAttribute('value', aDaysOfWeek[k]);
      oCell.setAttribute('class', 'header');
      oHeaderRow.appendChild(oCell);
    }
    this.oMonthListBox.appendChild(oHeaderRow); 

      /****************
       * Customization
       ****************/        
      // Create group box to create Year-Month label
      var oMonthGrpBoxCaption = document.createElement('caption');
      oMonthGrpBoxCaption.setAttribute('label', '[ '+sMonthId+' ]');
      if(oMonthDate.getMonth()==oCurrentDate.getMonth() && oMonthDate.getFullYear()==oCurrentDate.getFullYear())
      {
        oMonthGrpBoxCaption.setAttribute('id', 'current-month-caption');
      }

    var oMonthGrpBox = document.createElement('groupbox');
    if(oMonthDate.getMonth()==oCurrentDate.getMonth() && oMonthDate.getFullYear()==oCurrentDate.getFullYear())
    {
      oMonthGrpBox.setAttribute('id', 'current-month-groupbox');
    }
    
    oMonthGrpBox.appendChild(oMonthGrpBoxCaption);
    var oMonthGrid = document.createElement('grid');
    oMonthGrid.appendChild(this.oMonthListBox);
    oMonthGrpBox.appendChild(oMonthGrid);
    
    // Create the whole month.
    oMonthDate = this.createMonth(oMonthDate);
    this.oCalendar.appendChild(oMonthGrpBox);
  }
  
  return this.oCalendar;
  
};

// render(oStatusbarpanel, iMonthsSpan): display calendar at the top of the status bar.
xCalendar.Calendar.prototype.render = function(oStatusbarpanel, iMonthsSpan)
{
	oStatusbarpanel.appendChild(this.createCalendar(iMonthsSpan));
	oStatusbarpanel.setAttribute('style', 'overflow: scroll;'); // FF issue?: Work around to fix the display of the 6th week outside of groupbox.
	
	oStatusbarpanel.setAttribute('class', 'top-separator');
	
	// Scroll(Center) to the current month.
	var oThisMonth = document.getElementById('current-month-groupbox'); // Make sure the ID string matches with createCalendar().
	oStatusbarpanel.scrollLeft = (oStatusbarpanel.scrollWidth/2)-(window.innerWidth/2);
};

//showCalendarWeek(): Get value of a showCalendarWeek option.
xCalendar.Calendar.prototype.showCalendarWeek = function()
{
  var prefs = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService);
  prefs = prefs.getBranch("extensions.xcalendar.");

  // BAD: Workaround to set default value of showCalendarWeek. Don't know why defaults/preferences/pref.js is not called.
  try
  {
  	prefs.getBoolPref("showCalendarWeek");
  }
  catch(error)
  {
  	prefs.setBoolPref("showCalendarWeek", false);
  }
  
  return prefs.getBoolPref("showCalendarWeek");	
};

//getWeekNumber(): Return the calendar week of a given date.
// Taken from http://www.codeproject.com/KB/cs/gregorianwknum.aspx
// Reference: http://www.linuxfocus.org/~katja/toolbox/cal_year.html
// Algorithm: http://personal.ecu.edu/mccartyr/ISOwdALG.txt
// Week 53: 2010-01-01, 2016-01-01
xCalendar.Calendar.prototype.getWeekNumber = function(year, month, day)
{
	//lets calc weeknumber the cruel and hard way :D
	//Find JulianDay 
	month += 1; //use 1-12
	var a = Math.floor((14-(month))/12);
	var y = year+4800-a;
	var m = (month)+(12*a)-3;
	var jd = day + Math.floor(((153*m)+2)/5) + 
	            (365*y) + Math.floor(y/4) - Math.floor(y/100) + 
	            Math.floor(y/400) - 32045;      // (gregorian calendar)
	//var jd = (day+1)+Math.Round(((153*m)+2)/5)+(365+y) + 
	//                 Math.round(y/4)-32083;    // (julian calendar)
	
	//now calc weeknumber according to JD
	var d4 = (jd+31741-(jd%7))%146097%36524%1461;
	var L = Math.floor(d4/1460);
	var d1 = ((d4-L)%365)+L;
	NumberOfWeek = Math.floor(d1/7) + 1;
	return NumberOfWeek;	
};