const fs = require("fs");
const NodeHelper = require("node_helper");
const Main = require("./dist/main/index.js");

let main;

process.env.CWD = `${process.env.PWD}/modules/MMM-awesome-alexa`;

module.exports = NodeHelper.create({
    socketNotificationReceived: function (notification, payload) {
        // Renderer sends "main" a notification to connect
    },

    start: function () {
        this.expressApp.get("/parse-m3u", function (req, res) {
            const m3uUrl = req.query.url;

            if (!m3uUrl) {
                return res.json([]);
            }

            const urls = [];

            request(m3uUrl, function (error, response, bodyResponse) {
                if (bodyResponse) {
                    urls.push(bodyResponse);
                }

                res.json(urls);
            });
        });

        this.expressApp.get("/output.mpeg", function (req, res) {
            res.setHeader("Expires", new Date().toUTCString());

            var rstream = fs.createReadStream(`${process.env.CWD}/temp/output.mpeg`);
            rstream.pipe(res);
        });
    },

    // Because this.config is not accessible from node_helper for some reason. Need to pass from the js file.
    socketNotificationReceived: function (notification, payload) {
        if (notification === "CONFIG") {
            main = new Main(payload, (event, payload) => {
                this.sendSocketNotification(event, payload);
            }, this.socketNotificationReceived);
            return;
        }

        main.receivedNotification(notification, payload);
    },
});
