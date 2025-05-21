const { google } = require("googleapis");
const fs = require("fs");
const path = require("path");

class GoogleService {
    constructor() {
        this.oAuth2Client = new google.auth.OAuth2(
            process.env.GOOGLE_CLIENT_ID,
            process.env.GOOGLE_CLIENT_SECRET,
            "http://localhost/api/oauth2callback",
        );

        // Get the authentication token saved, if any
        // this.oAuth2Client;
        this.tokenPath = path.join(__dirname, "token.json");
        if (fs.existsSync(this.tokenPath)) {
            const tokens = JSON.parse(fs.readFileSync(this.tokenPath, "utf8"));
            this.oAuth2Client.setCredentials(tokens);
            console.log("🔑 Loaded saved OAuth tokens: ", tokens);
            this.gmail = google.gmail({
                version: "v1",
                auth: this.oAuth2Client,
            });
        } else {
            console.log(
                "No valid OAuth Token Available, go authorize yourself at http://localhost/api/auth",
            );
        }

        console.log("Began Google Service");
    }
}

const googleService = new GoogleService();

module.exports = { googleService };
