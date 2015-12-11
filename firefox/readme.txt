DESCRIPTION
======================
xCalendar is a plug-in for Firefox browser. It displays each month of the calendar year on the top of the status bar.
It simplifies meetings scheduling.


USAGE
======================
After the plug-in is installed, the xCalendar icon is located at bottom right most of your browser.
Simply click on the icon for the calendar to appear and click on it again to close the calendar.

For Firefox 4+, enable the "Add-ons" located at Firefox->Options.

OPTIONS
======================
Show Calendar Week(ISO 8601 Week dates): Show calendar week on the first column of each month.
Number of years to display: Display the number of years before and after the current month.

AUTHOR
======================
Xuan Ngo(xuanngolist[/@+-]yahoo.ca)
Homepage: https://github.com/limelime/xcalendar
 
TODO
======================
-When options are saved, refresh the calendar.
-Find out why default preferences are not loaded. Currently implemented a workaround in the code.
-Allow users to set first day of week.
-Show weekends

CHANGELOG
======================
 1.5(2012-03-01):
    -Code: Add xCalendar in Toolbar Layout so that user can choose to add in the toolbar.
 
 1.4(2012-01-11):
    -Fix: Doesn't exactly scroll to the center if "Number of years to display" is set to a big number(e.g. 10).

 1.3(2012-01-06):
    -Feature: Add an option: Show Calendar Week(ISO 8601 Week dates).
    -Feature: Add an option: Number of years to display.
 
 1.2(2011-04-28):
    -Code: Clean up code and add more comments for the Full Review.
    -Code: Encapsulate all Javascript codes into xCalendar namespace.
 
 1.1(2011-04-13):
    -Fix: Will not highlight the current date in the next month, which is disabled(e.g 2011-03-30).
    -Fix: The 6th week is now fully visible.
    -Fix: The vertical scrollbar will not appear inside the month if the browser size is changed.
    -Code: Use Grid instead of Listbox.
    -Code: Indent code properly.
    -Code: Fully use CSS to style the extension.
    -Code: Constraint CSS within the extension so that it will style this extension only.
 
 1.0(2011-03-25):
    -Initial release