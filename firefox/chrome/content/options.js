/********************************************************************
 * Create xCalendar namespace.
 *******************************************************************/
if("undefined" == typeof(xCalendar))
{
  var xCalendar = {};
};

// onOptionsAccept(): What to do after users accept the options.
xCalendar.onOptionsAccept = function(prefWindow)
{
  // For the moment, do nothing.
  // window.alert("accept.");
  return true;
};