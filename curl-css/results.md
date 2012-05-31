Algorithm
---

* Chrome 19+ and FF9+ use onload and onerror
* IE can use onreadystatechange and onload to detect loading, but it fires onreadystatechange and onload for errors, too
	* false positives
* FF<9 must use a setInterval and look for "security" exception or ability to manipulate rules
	* false positives
* Opera 11.62 supports onload and onreadystatechange (but not link.readyState), but does not fire any event if there's an error
	* must use a timeout to kick-in an alternate routine to look for an error (use image, xhr, or iframe?)
* Safari doesn't fire any events at all
	* must use a setInterval and look for sheet.rules == null or successful manipulation
	* false positives

Notes:

* IE, FF9+ and Chrome19+ will fire a load event for "about:blank" (but Opera does not)
	* could be used as a way to detect for a load event
	* Chrome will fire an event for "about:bogus", but the others won't

	function loadHandler (link) {
		link.onload = function () {
			// future calls don't have to bother with multiple methods
			features["event-link-onload"] = true;
			// remove events
			cleanup(params);
			// call back
			cb();
		};
	}

	function isLinkReady (link) {
		var ready, sheet, rules;
		ready = false;
		try {
			sheet = link.sheet; // no need to check for IE's link.styleSheet
			if (sheet) {
				// FF will throw a security exception here when an XD sheet is loaded
				// webkits (that don't support onload) will return null when an XD sheet is loaded
				ready = sheet.cssRules != null;
			}
		}
		catch (ex) {
			ready = /security|denied/.test(ex.message);
		}
		return ready;
	}

	function detectError (link, cb) {
		// this should be invoked after a delay (1500msec?)
		// if the image fires any event, there must have been a silent http 404/500
		var img;
		img = document.createElement('img'); // can't use `new Image()` in webkit
		img.onerror = img.onload = cb;
		img.src = link.href;
	}

IE6
---

?url = local.css
link = [object]
readystatechange = loading complete
load = true
later = true
*****

url = http://ajax.googleapis.com/ajax/libs/dojo/1.6/dojo/resources/dojo.css
link = [object]
readystatechange = loading complete
load = true
later = true
*****

url = does-not-exist.css
link = [object]
readystatechange = complete
load = true
later = true
*****

notes:

* attempting to access link.styleSheet before link.readyState == 'loading'
  causes a hard crash (TODO: which stylesheet? local or remote?)
* onerror never fires (onload fires instead)
* readystatechange fires for "loading" and "complete" (but this.readyState == "loading" is intermittent)
* new rules can be inserted after load for local, remote, or errored sheets

IE7
---

?url = local.css
link = [object]
readystatechange = loading complete
load = true
later = true
*****

url = http://ajax.googleapis.com/ajax/libs/dojo/1.6/dojo/resources/dojo.css
link = [object]
readystatechange = loading complete
load = true
later = true
*****

url = does-not-exist.css
link = [object]
readystatechange = loading complete
load = true
later = true
*****

notes:

* seems to behave similar to IE6 (but didn't test for crashes. probably doesn't)

IE8
---

?url = local.css
link = [object]
insert = true
readystatechange = loading complete
load = true
later = true
*****

url = http://ajax.googleapis.com/ajax/libs/dojo/1.6/dojo/resources/dojo.css
link = [object]
insert = Access is denied.
readystatechange = loading complete
load = true
later = Access is denied.
*****

url = does-not-exist.css
link = [object]
insert = true
readystatechange = loading complete
load = true
later = true
*****

notes:

* seems to behave similar to IE6&7 (but didn't test for crashes. probably doesn't)

IE9
---

url = local.css
link = [object]
insert = true
readystatechange = complete
load = true
later = true
*****

url = http://ajax.googleapis.com/ajax/libs/dojo/1.6/dojo/resources/dojo.css
link = [object]
insert = true
readystatechange = complete
load = true
later = true
*****

url = does-not-exist.css
link = [object]
insert = true
readystatechange = loading complete
load = true
later = true
*****

notes:

* IE9 allows manipulation of a XD stylesheet, but not reading of rules

FF3.6
---

?url = local.css
link = [object HTMLLinkElement]
later = true
*****
url = http://ajax.googleapis.com/ajax/libs/dojo/1.6/dojo/resources/dojo.css
link = [object HTMLLinkElement]
later = Security error
*****
url = does-not-exist.css
link = [object HTMLLinkElement]
later = true
*****

notes:

* no onload or onerror
* remote stylesheet gives a security error once loaded
* sheet.insertRule gives a security error after loading a remote stylesheet
* before loading, attempting to access sheet.cssRules gives a different error than sheet.insertRule
* to detect onload/onerror: if insert passes or error is a security error
	* how to detect onerror?

FF11 (9+)
---

url = local.css
link = [object HTMLLinkElement]
insert = A parameter or an operation is not supported by the underlying object
load = true
later = true
*****
url = http://ajax.googleapis.com/ajax/libs/dojo/1.6/dojo/resources/dojo.css
link = [object HTMLLinkElement]
insert = A parameter or an operation is not supported by the underlying object
load = true
later = Security error
*****
url = does-not-exist.css
link = [object HTMLLinkElement]
insert = A parameter or an operation is not supported by the underlying object
error = true
later = true
*****

notes:

* works as expected

Safari 5
---

url = local.css
link = [object HTMLLinkElement]
insert = 'null' is not an object (evaluating 'sheet.cssRules')
later = true
*****
url = http://ajax.googleapis.com/ajax/libs/dojo/1.6/dojo/resources/dojo.css
link = [object HTMLLinkElement]
insert = 'null' is not an object (evaluating 'sheet.cssRules')
later = cssRules is null
*****
url = does-not-exist.css
link = [object HTMLLinkElement]
insert = 'null' is not an object (evaluating 'sheet.cssRules')
later = true
*****

notes:

* Safari throws when accessing sheet.cssRules until sheet is loaded
	* XD stylesheet has sheet.cssRules == null once loaded but allows insertRule()

Chrome 19
---

url = local.css
link = [object HTMLLinkElement]
insert = Cannot read property 'cssRules' of null
load = true
later = true
*****
url = http://ajax.googleapis.com/ajax/libs/dojo/1.6/dojo/resources/dojo.css
link = [object HTMLLinkElement]
insert = Cannot read property 'cssRules' of null
load = true
later = cssRules is null
*****
url = does-not-exist.css
link = [object HTMLLinkElement]
insert = Cannot read property 'cssRules' of null
error = true
later = true
*****

* works as expected!


Opera 11.62
---

url = local.css
link = [object HTMLLinkElement]
insert = NO_MODIFICATION_ALLOWED_ERR
load = true
readystatechange = undefined
later = true
*****
url = http://ajax.googleapis.com/ajax/libs/dojo/1.6/dojo/resources/dojo.css
link = [object HTMLLinkElement]
insert = Security error: attempted to read protected variable
load = true
readystatechange = undefined
later = Security error: attempted to read protected variable
*****
url = does-not-exist.css
link = [object HTMLLinkElement]
insert = NO_MODIFICATION_ALLOWED_ERR
later = NO_MODIFICATION_ALLOWED_ERR
*****

notes:

* load event fires only for successful load of local or XD stylesheets
	* no onerror or onload for 404s
* doesn't allow modification of errored sheet after "load"
* readystatechange executes for non-404s
