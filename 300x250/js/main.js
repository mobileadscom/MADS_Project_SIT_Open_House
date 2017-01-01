/*
*
* mads - version 2.00.01
* Copyright (c) 2015, Ninjoe
* Dual licensed under the MIT or GPL Version 2 licenses.
* https://en.wikipedia.org/wiki/MIT_License
* https://www.gnu.org/licenses/old-licenses/gpl-2.0.en.html
*
*/
var mads = function (options) {

    var _this = this;

    this.render = options.render;

    /* Body Tag */
    this.bodyTag = document.getElementsByTagName('body')[0];

    /* Head Tag */
    this.headTag = document.getElementsByTagName('head')[0];

    /* json */
    if (typeof json == 'undefined' && typeof rma != 'undefined') {
        this.json = rma.customize.json;
    } else if (typeof json != 'undefined') {
        this.json = json;
    } else {
        this.json = '';
    }

    /* fet */
    if (typeof fet == 'undefined' && typeof rma != 'undefined') {
        this.fet = typeof rma.fet == 'string' ? [rma.fet] : rma.fet;
    } else if (typeof fet != 'undefined') {
        this.fet = fet;
    } else {
        this.fet = [];
    }

    this.fetTracked = false;

    /* load json for assets */
    this.loadJs(this.json, function () {
        _this.data = json_data;

        _this.render.render();
    });

    /* Get Tracker */
    if (typeof custTracker == 'undefined' && typeof rma != 'undefined') {
        this.custTracker = rma.customize.custTracker;
    } else if (typeof custTracker != 'undefined') {
        this.custTracker = custTracker;
    } else {
        this.custTracker = [];
    }

    /* CT */
    if (typeof ct == 'undefined' && typeof rma != 'undefined') {
        this.ct = rma.ct;
    } else if (typeof ct != 'undefined') {
        this.ct = ct;
    } else {
        this.ct = [];
    }

    /* CTE */
    if (typeof cte == 'undefined' && typeof rma != 'undefined') {
        this.cte = rma.cte;
    } else if (typeof cte != 'undefined') {
        this.cte = cte;
    } else {
        this.cte = [];
    }

    /* tags */
    if (typeof tags == 'undefined' && typeof tags != 'undefined') {
        this.tags = this.tagsProcess(rma.tags);
    } else if (typeof tags != 'undefined') {
        this.tags = this.tagsProcess(tags);
    } else {
        this.tags = '';
    }

    /* Unique ID on each initialise */
    this.id = this.uniqId();

    /* Tracked tracker */
    this.tracked = [];
    /* each engagement type should be track for only once and also the first tracker only */
    this.trackedEngagementType = [];
    /* trackers which should not have engagement type */
    this.engagementTypeExlude = [];
    /* first engagement */
    this.firstEngagementTracked = false;

    /* RMA Widget - Content Area */
    this.contentTag = document.getElementById('rma-widget');

    /* URL Path */
    this.path = typeof rma != 'undefined' ? rma.customize.src : '';

    /* Solve {2} issues */
    for (var i = 0; i < this.custTracker.length; i++) {
        if (this.custTracker[i].indexOf('{2}') != -1) {
            this.custTracker[i] = this.custTracker[i].replace('{2}', '{{type}}');
        }
    }
};

/* Generate unique ID */
mads.prototype.uniqId = function () {

    return new Date().getTime();
}

mads.prototype.tagsProcess = function (tags) {

    var tagsStr = '';

    for(var obj in tags){
        if(tags.hasOwnProperty(obj)){
            tagsStr+= '&'+obj + '=' + tags[obj];
        }
    }

    return tagsStr;
}

/* Link Opner */
mads.prototype.linkOpener = function (url) {

	if(typeof url != "undefined" && url !=""){

        if(typeof this.ct != 'undefined' && this.ct != '') {
            url = this.ct + encodeURIComponent(url);
        }

		if (typeof mraid !== 'undefined') {
			mraid.open(url);
		}else{
			window.open(url);
		}

        if(typeof this.cte != 'undefined' && this.cte != '') {
            this.imageTracker(this.cte);
        }
	}
}

/* tracker */
mads.prototype.tracker = function (tt, type, name, value) {

    /*
    * name is used to make sure that particular tracker is tracked for only once
    * there might have the same type in different location, so it will need the name to differentiate them
    */
    name = name || type;

    if ( tt == 'E' && !this.fetTracked ) {
        for ( var i = 0; i < this.fet.length; i++ ) {
            var t = document.createElement('img');
            t.src = this.fet[i];

            t.style.display = 'none';
            this.bodyTag.appendChild(t);
        }
        this.fetTracked = true;
    }

    if ( typeof this.custTracker != 'undefined' && this.custTracker != '' && this.tracked.indexOf(name) == -1 ) {
        for (var i = 0; i < this.custTracker.length; i++) {
            var img = document.createElement('img');

            if (typeof value == 'undefined') {
                value = '';
            }

            /* Insert Macro */
            var src = this.custTracker[i].replace('{{rmatype}}', type);
            src = src.replace('{{rmavalue}}', value);

            /* Insert TT's macro */
            if (this.trackedEngagementType.indexOf(tt) != '-1' || this.engagementTypeExlude.indexOf(tt) != '-1') {
                src = src.replace('tt={{rmatt}}', '');
            } else {
                src = src.replace('{{rmatt}}', tt);
                this.trackedEngagementType.push(tt);
            }

            /* Append ty for first tracker only */
            if (!this.firstEngagementTracked && tt == 'E') {
                src = src + '&ty=E';
                this.firstEngagementTracked = true;
            }

            /* */
            img.src = src + this.tags + '&' + this.id;

            img.style.display = 'none';
            this.bodyTag.appendChild(img);

            this.tracked.push(name);
        }
    }
};

mads.prototype.imageTracker = function (url) {
    for ( var i = 0; i < url.length; i++ ) {
        var t = document.createElement('img');
        t.src = url[i];

        t.style.display = 'none';
        this.bodyTag.appendChild(t);
    }
}

/* Load JS File */
mads.prototype.loadJs = function (js, callback) {
    var script = document.createElement('script');
    script.src = js;

    if (typeof callback != 'undefined') {
        script.onload = callback;
    }

    this.headTag.appendChild(script);
}

/* Load CSS File */
mads.prototype.loadCss = function (href) {
    var link = document.createElement('link');
    link.href = href;
    link.setAttribute('type', 'text/css');
    link.setAttribute('rel', 'stylesheet');

    this.headTag.appendChild(link);
}

var helpers = (function() {
  var element = (function() {
    var elements = {}
    return {
      add: function(el) {
        elements[el.id] = el
      },
      of: function(id) {
        return elements[id]
      },
      all: function() {
        return elements
      }
    }
  })()
  return {
    element: element
  }
})()

var SitAd = function() {
  this.app = new mads({
    'render': this
  })

  this.render()
  this.style()
  this.events()
}

SitAd.prototype.render = function() {
  this.app.contentTag.innerHTML = '<div id="container"><img id="bg" style="left:0px;" src="'+this.app.path+'img/sit-bg.png"><img src="'+this.app.path+'img/one.png" id="one"><img src="'+this.app.path+'img/two.png" id="two"></div>'
}

SitAd.prototype.style = function() {
  var css = 'body {margin:0;padding:0;}  #container { position: relative; width: 300px; height: 250px; overflow: hidden; margin: 0; padding: 0; }'
  css += '#bg {position:absolute;transition:left 1s;-webkit-transition: left 1s;}'
  css += '#one {position:absolute;left:15px;top:10px;transition:opacity 1s;-webkit-transition: opacity 1s;opacity:1}'
  css += '#two{position:absolute;left:15px;top:20px;transition:opacity 1s;-webkit-transition: opacity 1s;opacity:0}'

  head = document.head || document.getElementsByTagName('head')[0],
  style = document.createElement('style');

  style.type = 'text/css';
  if (style.styleSheet){
      style.styleSheet.cssText = css;
  } else {
      style.appendChild(document.createTextNode(css));
  }

  head.appendChild(style);
}

function getMobileOperatingSystem() {
  var userAgent = navigator.userAgent || navigator.vendor || window.opera;

      // Windows Phone must come first because its UA also contains "Android"
    if (/windows phone/i.test(userAgent)) {
        return "Windows Phone";
    }

    if (/android/i.test(userAgent)) {
        return "Android";
    }

    // iOS detection from: http://stackoverflow.com/a/9039885/177710
    if (/iPad|iPhone|iPod/.test(userAgent) && !window.MSStream) {
        return "iOS";
    }

    return "unknown";
}

SitAd.prototype.events = function() {
  var self = this
  setTimeout(function() {
      document.getElementById('bg').style.left = '-300px'
      document.getElementById('one').style.opacity = '0'
      document.getElementById('two').style.display = 'block'
      document.getElementById('two').style.opacity = '1'
  }, 1500)
  setTimeout(function() {
      document.getElementById('container').addEventListener('click', function() {
        if (getMobileOperatingSystem() === 'iOS') {
          // self.app.linkOpener(self.app.path + 'events.ics')
          self.app.linkOpener('webcal://addtocalendar.com/atc/ical?f=m&e[0][date_start]=2017-01-14%2010%3A00%3A00&e[0][date_end]=2017-01-14%2018%3A00%3A00&e[0][timezone]=Asia%2FSingapore&e[0][title]=Singapore%20Institute%20of%20Technology%20(SIT)%20(SIT)%20Open%20House%202017&e[0][description]=Discover%20opportunities%20to%20pursue%20an%20industry-focussed%20degree%20and%20learn%20more%20about%20the%20wide%20array%20of%20degree%20programmes%20from%20SIT%20Faculty%20and%20Staff.%0ACome%20and%20Find%20Your%20Place%20at%20the%20SIT%20Open%20House%202017!%0A%0A-%20Singapore%20Institute%20of%20Technology%20(SIT)%0Aadm@SingaporeTech.edu.sg&e[0][location]=Suntec%20Singapore%20Convention%20%26%20Exhibition%20Centre%2C%20Level%203&e[0][organizer]=Singapore%20Institute%20of%20Technology%20(SIT)&e[0][organizer_email]=Adm%40SingaporeTech.edu.sg&e[0][privacy]=public&e[1][date_start]=2017-01-15%2010%3A00%3A00&e[1][date_end]=2017-01-15%2018%3A00%3A00&e[1][timezone]=Asia%2FSingapore&e[1][title]=Singapore%20Institute%20of%20Technology%20(SIT)%20(SIT)%20Open%20House%202017&e[1][description]=Discover%20opportunities%20to%20pursue%20an%20industry-focussed%20degree%20and%20learn%20more%20about%20the%20wide%20array%20of%20degree%20programmes%20from%20SIT%20Faculty%20and%20Staff.%0ACome%20and%20Find%20Your%20Place%20at%20the%20SIT%20Open%20House%202017!%0A%0A-%20Singapore%20Institute%20of%20Technology%20(SIT)%0Aadm@SingaporeTech.edu.sg&e[1][location]=Suntec%20Singapore%20Convention%20%26%20Exhibition%20Centre%2C%20Level%203&e[1][organizer]=Singapore%20Institute%20of%20Technology%20(SIT)&e[1][organizer_email]=Adm%40SingaporeTech.edu.sg&e[1][privacy]=public')
        }

        if (getMobileOperatingSystem() === 'Android') {
          // self.app.linkOpener('http://www.google.com/calendar/render?action=TEMPLATE&text=Singapore%20Institute%20of%20Technology%20(SIT)%20(SIT)%20Open%20House%202017&dates=20170114T020000Z/20170114T100000Z&details=Discover%20opportunities%20to%20pursue%20an%20industry-focussed%20degree%20and%20learn%20more%20about%20the%20wide%20array%20of%20degree%20programmes%20from%20SIT%20Faculty%20and%20Staff.%0ACome%20and%20Find%20Your%20Place%20at%20the%20SIT%20Open%20House%202017!%0A%0A-%20Singapore%20Institute%20of%20Technology%20(SIT)%0Aadm@SingaporeTech.edu.sg&location=Suntec%20Singapore%20Convention%20%26%20Exhibition%20Centre%2C%20Level%203&sprop=website:singaporetech.edu.sg')
          // 'http://addtocalendar.com/atc/google?f=m&e[0][date_start]=2016-05-04%2012%3A00%3A00&e[0][date_end]=2016-05-04%2018%3A00%3A00&e[0][timezone]=Pacific%2FMidway&e[0][title]=Star%20Wars%20Day%20Party&e[0][description]=May%20the%20force%20be%20with%20you%0Asadf%0Asdfsfd%0Asdfdfsdf&e[0][location]=Tatooine&e[0][organizer]=Luke%20Skywalker&e[0][organizer_email]=luke%40starwars.com&e[0][privacy]=public'
          self.app.linkOpener('http://addtocalendar.com/atc/google?f=m&e[0][date_start]=2017-01-14%2010%3A00%3A00&e[0][date_end]=2017-01-14%2018%3A00%3A00&e[0][timezone]=Asia%2FSingapore&e[0][title]=Singapore%20Institute%20of%20Technology%20(SIT)%20(SIT)%20Open%20House%202017&e[0][description]=Discover%20opportunities%20to%20pursue%20an%20industry-focussed%20degree%20and%20learn%20more%20about%20the%20wide%20array%20of%20degree%20programmes%20from%20SIT%20Faculty%20and%20Staff.%0ACome%20and%20Find%20Your%20Place%20at%20the%20SIT%20Open%20House%202017!%0A%0A-%20Singapore%20Institute%20of%20Technology%20(SIT)%0Aadm@SingaporeTech.edu.sg&e[0][location]=Suntec%20Singapore%20Convention%20%26%20Exhibition%20Centre%2C%20Level%203&e[0][organizer]=Singapore%20Institute%20of%20Technology%20(SIT)&e[0][organizer_email]=Adm%40SingaporeTech.edu.sg&e[0][privacy]=public&e[1][date_start]=2017-01-15%2010%3A00%3A00&e[1][date_end]=2017-01-15%2018%3A00%3A00&e[1][timezone]=Asia%2FSingapore&e[1][title]=Singapore%20Institute%20of%20Technology%20(SIT)%20(SIT)%20Open%20House%202017&e[1][description]=Discover%20opportunities%20to%20pursue%20an%20industry-focussed%20degree%20and%20learn%20more%20about%20the%20wide%20array%20of%20degree%20programmes%20from%20SIT%20Faculty%20and%20Staff.%0ACome%20and%20Find%20Your%20Place%20at%20the%20SIT%20Open%20House%202017!%0A%0A-%20Singapore%20Institute%20of%20Technology%20(SIT)%0Aadm@SingaporeTech.edu.sg&e[1][location]=Suntec%20Singapore%20Convention%20%26%20Exhibition%20Centre%2C%20Level%203&e[1][organizer]=Singapore%20Institute%20of%20Technology%20(SIT)&e[1][organizer_email]=Adm%40SingaporeTech.edu.sg&e[1][privacy]=public')
          // self.app.linkOpener(self.app.path + 'events.ics')
          //self.app.linkOpener('webcal://addtocalendar.com/atc/google?f=m&e[0][date_start]=2017-01-14%2010%3A00%3A00&e[0][date_end]=2017-01-14%2018%3A00%3A00&e[0][timezone]=Asia%2FSingapore&e[0][title]=Singapore%20Institute%20of%20Technology%20(SIT)%20(SIT)%20Open%20House%202017&e[0][description]=Discover%20opportunities%20to%20pursue%20an%20industry-focussed%20degree%20and%20learn%20more%20about%20the%20wide%20array%20of%20degree%20programmes%20from%20SIT%20Faculty%20and%20Staff.%0ACome%20and%20Find%20Your%20Place%20at%20the%20SIT%20Open%20House%202017!%0A%0A-%20Singapore%20Institute%20of%20Technology%20(SIT)%0A<adm@SingaporeTech.edu.sg>&e[0][location]=Suntec%20Singapore%20Convention%20%26%20Exhibition%20Centre%2C%20Level%203&e[0][organizer]=Singapore%20Institute%20of%20Technology%20(SIT)&e[0][organizer_email]=Adm%40SingaporeTech.edu.sg&e[0][privacy]=public&e[1][date_start]=2017-01-15%2010%3A00%3A00&e[1][date_end]=2017-01-15%2018%3A00%3A00&e[1][timezone]=Asia%2FSingapore&e[1][title]=Singapore%20Institute%20of%20Technology%20(SIT)%20(SIT)%20Open%20House%202017&e[1][description]=Discover%20opportunities%20to%20pursue%20an%20industry-focussed%20degree%20and%20learn%20more%20about%20the%20wide%20array%20of%20degree%20programmes%20from%20SIT%20Faculty%20and%20Staff.%0ACome%20and%20Find%20Your%20Place%20at%20the%20SIT%20Open%20House%202017!%0A%0A-%20Singapore%20Institute%20of%20Technology%20(SIT)%0A<adm@SingaporeTech.edu.sg>&e[1][location]=Suntec%20Singapore%20Convention%20%26%20Exhibition%20Centre%2C%20Level%203&e[1][organizer]=Singapore%20Institute%20of%20Technology%20(SIT)&e[1][organizer_email]=Adm%40SingaporeTech.edu.sg&e[1][privacy]=public')
        }
      })
  }, 2500)

}

var sitAd = new SitAd()
