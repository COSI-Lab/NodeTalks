// Angular JS
var app = angular.module('talksApp', []);

function getTalks($scope, $http) {
    // send the GET request
    $http.get("/api/talks").success(data => {
        $scope.talks = data; // Set the scope's talks to be the output of the api call
    });
}

function postTalk($scope, $http, socket) {
    // Set the data to be sent through the request to be the newTalk object
    var data = $scope.newTalk;

    // Send the POST request
    $http.post("/api/postTalk", data).then(response => {
        $scope.talks = response.data; // Set the scope's talks to be the output of the api call
        socket.emit("update", response.data); // Send it to the websocket to broadcast the change to everyone else
    }, error => {
        alert("Talk submissions are only allowed in the 128.153.0.0/16 subnet");
    });
}

function hideTalk($scope, $http, socket) {
    var data = {
        talkId: $scope.id,
        hiddenStatus: true
    };

    $http.post("/api/hideTalk", data).then(response => {
        $scope.talks = response.data;
        socket.emit("update", response.data);
    }, error => {
        alert("Talk modifications are only allowed in the 128.153.0.0/16 subnet");
    });
}

function unhideTalk($scope, $http, socket) {
    var data = {
        talkId: $scope.id,
        hiddenStatus: false
    };

    $http.post("/api/unhideTalk", data).then(response => {
        $scope.talks = response.data;
        socket.emit("update", response.data);
    }, error => {
        alert("Talk modifications are only allowed in the 128.153.0.0/16 subnet");
    });
}

// The main controller for the page
app.controller('talksController', ($scope, $http) => {
    getTalks($scope, $http); // Always load in talks at startup

    let socket = io.connect();

    socket.on('change', data => {
        $scope.talks = data;
        $scope.$apply();
    });

    // Send a http POST request to create a new talk
    $scope.createTalk = () => {
        postTalk($scope, $http, socket);
        $scope.newTalk = {}; // Clear out the input boxes
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
        result += `## ${topic.desc}\n\n`;
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
    dialogPolyfill.registerDialog(dialog);
    dialog.showModal();
}