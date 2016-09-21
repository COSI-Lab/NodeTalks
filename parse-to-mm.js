// Parse to Meeting Minutes program

let fetch = require('node-fetch');

const DATE = 'September 21'; // Update this before running (Will be fixed later)

function getVisibleTalks() {
    return fetch('http://talks.cosi.clarkson.edu/api/talks/visible')
        .then(res => {
            return res.json();
        });
}

function generateMeetingMinutes(talks) {
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

getVisibleTalks().then(talks => {
    return generateMeetingMinutes(talks);
}).then(markdown => {
    console.log(markdown);
});