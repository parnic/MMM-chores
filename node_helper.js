const NodeHelper = require("node_helper");
const path = require("path");
const fs = require("fs");
const filename = "/saved.json";
var configFilename = path.resolve(__dirname + filename);

module.exports = NodeHelper.create({
    start() {
        console.log("##### Starting node helper for: " + this.name);

        fs.readFile(configFilename, (err, data) => {
            if (err) {
                if (err.code === 'ENOENT') {
                    return;
                }

                throw err;
            }

            this.saved_data = JSON.parse(data);
        });
    },

    writeToFile(data) {
        var json = JSON.stringify(data);
        fs.writeFileSync(configFilename, json, "utf8");
    },

    socketNotificationReceived(notification, payload) {
        if (notification === "CHORES_ADD_DATA") {
            if (!this.saved_data) {
                this.saved_data = {}
            }

            this.saved_data[payload.key] = payload.val
            this.writeToFile(this.saved_data)
        } else if (notification === "CHORES_READY") {
            if (this.saved_data) {
                this.sendSocketNotification("CHORES_DATA_READ", this.saved_data)
            }
        }
    }
});