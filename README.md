<div align="center">
  <img src="https://raw.githubusercontent.com/COSI-Lab/NodeTalks/master/talks-preview.png" alt="Talks Screenshot" />
</div>

# NodeTalks

NodeTalks (Or more commonly known as just Talks) is a node webapp to manage talks at [COSI](http://cosi.clarkson.edu/) meetings.

It allows people to submit talks that they are planning on giving at upcoming meetngs. As well, it includes an export functionality to aggregate active talks to be put into a markdown format which is used for our meeting minutes.

# Install

To setup an instance of talks, download this repo and download the dependencies with npm:

```
git clone https://github.com/COSI-Lab/NodeTalks.git
npm install
```

Then, start up the app with the following command:

```
node index.js
```

You can enable it to run continuously easily with programs like [Forever](https://github.com/foreverjs/forever) or [Nodemon](https://github.com/remy/nodemon).

## Tools Used

- Express
- SQLite3 & Sequelize
- Angular 1.x
