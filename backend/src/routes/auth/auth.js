const router = require("express").Router();
const { googleService } = require("../../services/google_service");

router.get("api/auth", (req, res) => {
    const authURL = googleService.oAuth2Client.generateAuthUrl({
        access_type: "offline",
        scope: ["https://www.googleapis.com/auth/gmail.send"],
        prompt: "consent",
    });
    res.redirect(authURL);
});

module.exports = router;
