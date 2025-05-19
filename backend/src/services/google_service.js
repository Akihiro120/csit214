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
            console.log("🔑 Loaded saved OAuth tokens");
        }

        console.log("Began Google Service");
    }

    getAuthUrl() {
        return this.oAuth2Client.generateAuthUrl({
            access_type: "offline", // so you get a refresh_token
            scope: ["https://www.googleapis.com/auth/gmail.send"],
            prompt: "consent",
        });
    }

    // After the user consents and you get `?code=…` in your callback:
    async fetchToken(code) {
        const { tokens } = await this.oAuth2Client.getToken(code);
        this.oAuth2Client.setCredentials(tokens);
        fs.writeFileSync(this.tokenPath, JSON.stringify(tokens, null, 2));
        console.log("✅ OAuth tokens saved to", this.tokenPath);
    }
}

const googleService = new GoogleService();

module.exports = { googleService };
