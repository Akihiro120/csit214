const router = require("express").Router();
const { googleService } = require("../../services/google_service");
const fs = require("fs");

router.get("/api/oauth2callback", async (req, res) => {
    const { code } = req.query;
    if (!code) {
        return res.status(400).send("Missing Auth Code");
    }

    try {
        const { tokens } = await googleService.oAuth2Client.getToken(code);
        googleService.oAuth2Client.setCredentials(tokens);

        fs.writeFileSync(googleService.tokenPath, JSON.stringify(tokens));
        res.send("Authentication Successful, you can now send emails", tokens);
    } catch (err) {
        console.error("Error Retrieving Access Code: ", err);
        res.status(500).send("Authentication Fail");
    }
});

router.get("/api/auth", async (req, res) => {
    const authURL = googleService.oAuth2Client.generateAuthUrl({
        access_type: "offline",
        scope: ["https://www.googleapis.com/auth/gmail.send"],
        prompt: "consent",
    });
    res.redirect(authURL);
});

module.exports = router;
