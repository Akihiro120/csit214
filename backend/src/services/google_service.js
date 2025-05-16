const { google } = require("googleapis");
const fs = require("fs");

class GoogleService {
    constructor() {
        this.oAuth2Client = new google.auth.OAuth2(
            process.env.GOOGLE_CLIENT_ID,
            process.env.GOOGLE_CLIENT_SECRET,
            "http://localhost/api/auth/oauth2callback",
        );

        // Get the authentication token saved, if any
        this.TOKEN_PATH = "token.json";
        if (fs.existsSync(this.TOKEN_PATH)) {
            this.oAuth2Client.setCredentials(
                JSON.parse(fs.readFileSync(this.TOKEN_PATH)),
            );
        }
    }
}

const googleService = new GoogleService();

module.exports = { googleService };
