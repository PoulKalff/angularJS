# An alternative web user interface for tvheadend, created with angularJS

Must be located in:<br>
	/usr/share/tvheadend/src/webui/static/<br>
.
..and called as:<br>
	IP:9981/static/angularJS/index.html<br>

Redirected in Apache as: <br>
        <Location "/hts">
                Redirect permanent "http://192.168.1.8:9981/static/angularJS/index.html"
        </Location>
