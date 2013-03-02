var FBBirthdayWisher = {};
FBBirthdayWisher.message = "Happy birthday";

FBBirthdayWisher.getFields = function () {
	var fields = {
					"fb_dtsg" : 1,
					"xhpc_targetid" : 1,
					"xhpc_composerid" : 1,
					"xhpc_context" : 1,
					"xhpc_ismeta" : 1,
					"xhpc_fbx" : 1,
					"walltarget" : 2,
				 };
	var data = {};
	var iF = document.getElementsByTagName("input");
    var idx = 0;
	for (var i=0; i < iF.length; i++) {
		if ((iF[i].type == "hidden") && (fields[iF[i].name] == 1)) {
			data[iF[i].name] = iF[i].value;
		}
		if ((iF[i].type == "hidden") && (fields[iF[i].name] == 2)) {
			if (!data[iF[i].name]) {
				data[iF[i].name] = [];
			}
			data[iF[i].name][idx] = iF[i].value;
			idx++;
		}
	}
	data.xhpc_timeline = 1;
	data.birthday = 1;
	console.log("fields:", data);
	return data;
};

FBBirthdayWisher.buildPostData = function (data) {
	var postData = "";
	for (var field in data) {
		postData += "&" + field + "=" + encodeURIComponent(data[field]);
	}
	console.log("postData: " + postData);
	return postData;
};

FBBirthdayWisher.getBirthdays = function() {
	var data = FBBirthdayWisher.getFields();
	var fbRemindersContent = document.getElementsByClassName("fbRemindersContent");
    var bdFriends = [];
    if (fbRemindersContent.length == 1) {
        bdFriends = fbRemindersContent[0].getElementsByTagName("a");
    } else {
        bdFriends = fbRemindersContent[1].getElementsByTagName("a");
    }
	var firstNames = [];
	var idx = 0;
	for (var i = 2; i < bdFriends.length; i+=2) {
		firstNames[idx] = bdFriends[i].innerHTML.split(" ")[0];
		idx++;
	}

	return {
		"firstNames" : firstNames,
		"profileIDs": data.walltarget || [],
		"fields": {
			"fb_dtsg" : data.fb_dtsg,
			"xhpc_composerid" : data.xhpc_composerid,
			"xhpc_context" : data.xhpc_context,
			"xhpc_ismeta" : data.xhpc_ismeta,
			"xhpc_fbx" : data.xhpc_fbx,
			"xhpc_timeline" : data.xhpc_timeline	
		}
	};
};

FBBirthdayWisher.writeBirthdayMessages = function() {

	var processStateChange = function() {
		if (req.readyState == 1) {
			console.log("Posting to Timeline...");
	   	}

	    if (req.readyState == 4) {
			if (req.status == 200) {
				console.log("Boom! Birthday message posted on Timeline!");
	        } else {
				alert("There was a problem!");
				console.log("Response: ", req.statusText);
	        }
	    }	
	}
	
	var birthdays = FBBirthdayWisher.getBirthdays();
	console.log("birthdays:", birthdays);
	
    if (birthdays.firstNames.length !== birthdays.profileIDs.length) {
		window.alert("Click on the birthdays section first!");
		return;
	}


	if ((birthdays.profileIDs.length == 0) && (birthdays.firstNames.length == 0)) {
        window.alert("No birthdays found!");
        return;
    }

    for (var i=0; i < birthdays.profileIDs.length; i++) {
		window.alert("Wishing " + birthdays.firstNames[i] + "...");
		var fields = birthdays.fields;
		fields.xhpc_targetid = birthdays.profileIDs[i];
		fields.xhpc_message = FBBirthdayWisher.message + ", " + birthdays.firstNames[i] + "!";
		var postData = FBBirthdayWisher.buildPostData(fields);
		console.log(postData);
	 	var req = new XMLHttpRequest();
		req.onreadystatechange = processStateChange;
		req.open("POST", "/ajax/updatestatus.php", true);
		req.setRequestHeader("Content-type","application/x-www-form-urlencoded");
		req.send(postData);
	}
};
FBBirthdayWisher.writeBirthdayMessages();
