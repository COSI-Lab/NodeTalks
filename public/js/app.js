// Angular JS
var app = angular.module('talksApp', []);

function promptPassword() {
    return prompt("Please enter tonight's meeting password\nOR continue if you're on the Clarkson Network");
}

function getTalks($scope, $http) {
    // send the GET request
    $http.get("/api/talks").success(data => {
        $scope.talks = data; // Set the scope's talks to be the output of the api call
    });
}

function postTalk($scope, $http, socket) {
    // Set the data to be sent through the request to be the newTalk object
    var data = $scope.newTalk;
    data.password = promptPassword();

    console.log(data);

    // Send the POST request
    $http.post("/api/postTalk", data).then(response => {
        $scope.talks = response.data; // Set the scope's talks to be the output of the api call
        socket.emit("update", response.data); // Send it to the websocket to broadcast the change to everyone else
        new Snackbar('success', 'check-circle', "Success: Your talk has been submitted");
    }, error => {
        new Snackbar('error', 'alert-circle', "Error: Talk submissions are only allowed in the 128.153.0.0/16 subnet");
    });
}

function hideTalk($scope, $http, socket) {
    var data = {
        talkId: $scope.id,
        hiddenStatus: true
    };
    data.password = promptPassword();
    
    $http.post("/api/hideTalk", data).then(response => { $scope.talks = response.data;
        socket.emit("update", response.data);
        new Snackbar('success', 'check-circle', "Success: Talk hidden");
    }, error => {
        new Snackbar('error', 'alert-circle', "Error: Talk modifications are only allowed in the 128.153.0.0/16 subnet");
    });
}

function unhideTalk($scope, $http, socket) {
    var data = {
        talkId: $scope.id,
        hiddenStatus: false
    };
    data.password = promptPassword();
    
    $http.post("/api/unhideTalk", data).then(response => {
        $scope.talks = response.data;
        socket.emit("update", response.data);
        new Snackbar('success', 'check-circle', "Success: Talk unhidden");
    }, error => {
        new Snackbar('error', 'alert-circle', "Error: Talk modifications are only allowed in the 128.153.0.0/16 subnet");
    });
}

// The main controller for the page
app.controller('talksController', ($scope, $http) => {
    getTalks($scope, $http); // Always load in talks at startup
    nextWednesday();

    let socket = io.connect();

    socket.on('change', data => {
        $scope.talks = data;
        $scope.$apply();
    });

    // Send a http POST request to create a new talk
    $scope.createTalk = () => {
        if($scope.newTalk !== undefined) {
            let {name, type, desc} = $scope.newTalk;
            
            if(name.trim() == '' || type.trim() == '' || desc.trim() == '') {
                alert('Empty fields. please try again');
                $scope.newTalk = {};
                return;
            }

            postTalk($scope, $http, socket);
            $scope.newTalk = {}; // Clear out the input boxes
        }
    };

    // Hide a certain talk
    $scope.hide = (id) => {
        $scope.id = id;
        hideTalk($scope, $http, socket);
    };

    // unhide a certain talk
    $scope.unhide = (id) => {
        $scope.id = id;
        unhideTalk($scope, $http, socket);
    };
});

// Meeting Minutes Parsing JS
function parseToMM() {
    fetchTalks().then(talks => {
        return generateMeetingMinutes(talks);
    }).then(markdown => {
        renderMeetingMinutesDialog(markdown);
    });
}

function fetchTalks() {
    return fetch('http://talks.cosi.clarkson.edu/api/talks/visible')
        .then(res => {
            return res.json();
        });
}

function nextWednesday() {
    // Meeting dates for the rest of the week. Update this array once a semester
    // to get the valid list of meeting dates
    var Dates2019 = [
	    'January 27',
            'February 3',
            'February 10',
            'February 17',
            'February 24',
            'March 3',
            'March 10',
            'March 17',
            'March 24',
            'March 31',
            'April 7',
            'April 14',
            'April 21',
            'April 28'
    ];

    let i = 0;
    let nextMeeting = "";

    while(true) {
        let day = moment().day(3 + (i*7)).format("MMMM Do");
        if(Dates2019.includes(day)) {
            nextMeeting = day;
            break;
        }

        // Never more than 15 meetings, so exit out when the time comes.
        if(i > 15) {
            nextMeeting = "TBD";
            break;
        }
        i++;
    }

    document.getElementById("meetingDate").innerText = nextMeeting;
}

function generateMeetingMinutes(talks) {
    const DATE = moment().format('MMMM Do');

    let forumTopics = talks.filter(talk => talk.type == 'forum topic');
    let lightningTalks = talks.filter(talk => talk.type == 'lightning talk');
    let projectUpdates = talks.filter(talk => talk.type == 'project	update');
    let announcements = talks.filter(talk => talk.type == 'announcement');
    let afterMeetingSlot = talks.filter(talk => talk.type == 'after meeting slot');

    let outputMarkdown = "";

    outputMarkdown += `---\nlayout: post\ntitle: "Meeting Minutes: ${DATE}"\ncategories: minutes\n---\n\n`;

    outputMarkdown += genCategory(forumTopics, 'Forum Topics');
    outputMarkdown += genCategory(lightningTalks, 'Lightning Talk');
    outputMarkdown += genCategory(projectUpdates, 'Project Updates');
    outputMarkdown += genCategory(announcements, 'Announcements');
    outputMarkdown += genCategory(afterMeetingSlot, 'After Meeting Slot');

    return outputMarkdown;
}

function genCategory(talksList, title) {
    let result = "";

    result += `# ${title}\n\n`;

    for (let topic of talksList) {
        result += `## ${topic.desc}\n\n${topic.name} - \n\n`;
    }

    return result;
}

function renderMeetingMinutesDialog(markdown) {
    let dialogElement = document.createElement('dialog');
    dialogElement.innerHTML = `
		<h3>Meeting Minutes Template</h3>
		<textarea rows="10" cols="80">${markdown}</textarea>
		<form method="dialog" style="display: flex; margin-top: 5px; justify-content: center;">
			<input type="submit" value="Close" />
		</form>
	`;
    document.body.appendChild(dialogElement);
    let dialog = document.querySelector('dialog');
    //Create a new observer to check if the dialog's mutation changes to open, and if it's open then remove it
    let observer = new MutationObserver(mutations => {
	    if(mutations[0].attributeName === "open") {
		    dialog.remove();
		    observer.disconnect();
	    }
    });
    dialogPolyfill.registerDialog(dialog);
    dialog.showModal();
    //Create an observer if the dialog's attribute is open
    observer.observe(dialog, {attributes: true});
}
