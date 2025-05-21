const express = require("express");
const router = express.Router();
const { GlobalDatabaseService } = require("../../services/database_service");
const { googleService } = require("../../services/google_service");

async function MakeEmailBody({ to, from, subject, message }) {
    const str = [
        `From: ${from}`,
        `To: ${to}`,
        `Subject: ${subject}`,
        'Content-Type: text/html; charset="UTF-8"',
        "",
        message,
    ].join("\n");

    // Base64URL encode
    return Buffer.from(str)
        .toString("base64")
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=+$/, "");
}

async function HtmlMessage(session) {
    const paymentDetails = session.paymentDetails;
    const bookingDetails = session;

    const dateOfPurchase = new Date();

    return `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
            <link rel="preconnect" href="https://fonts.googleapis.com"/>
            <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin/>
            <link href="https://fonts.googleapis.com/css2?family=Roboto&display=swap" rel="stylesheet"/>
            <style>
                body { 
                    font-family: 'Roboto', sans-serif;
                    background: #f5f5f5;
                    margin: 0;
                    padding: 0;
                }
                .container { 
                    max-width: 600px;
                    margin: 20px auto;
                    background: #fff;
                    border-radius: 8px;
                    overflow: hidden;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.1); 
                }
                .header { 
                    background: #673ab7;
                    color: #fff;
                    padding: 20px;
                    text-align: center;
                }
                .header h1 { 
                    margin: 0;
                    font-size: 1.8em;
                }
                .header p { 
                    margin: 5px 0 0;
                    font-size: 1em;
                }
                .section { 
                    padding: 20px;
                }
                .section + .section { 
                    border-top: 1px solid #eee;
                }
                h2 { 
                    margin: 0 0 10px;
                    font-size: 1.2em; 
                    color: #333; 
                }
                table { 
                    width: 100%;
                    border-collapse: collapse;
                }
                th, td { 
                    text-align: left;
                    padding: 8px 0;
                }
                .label { 
                    width: 40%;
                    color: #555; 
                }
                .value { 
                    width: 60%;
                    color: #000; 
                }
                .value2 { 
                    color: #000;
                    padding: 0
                }
            </style>
        </head>
        <body>
        <div class="container">
            <div class="header">
                <h1>Fly Dream Air</h1>
                <p>Flight Receipt</p>
            </div>

        <div class="section">
            <h2>Booking Details</h2>
            <table>
                <tr>
                    <td class="label">Booking Reference:</td>
                    <td class="value">${bookingDetails.flight_id}</td>
                </tr>
                <tr>
                    <td class="label">Booking Date:</td>
                    <td class="value">${dateOfPurchase.toLocaleDateString("en-AU")}</td>
                </tr>
                <tr>
                    <td class="label">Passengers:</td>
                    <td class="value">${bookingDetails.num_passengers}</td>
                </tr>
            </table>
        </div>

        <div class="section">
            <h2>Flight Information</h2>
            <table>
                <tr>
                    <td class="label">From:</td>
                    <td class="value">${bookingDetails.dept_city} (${bookingDetails.from})</td>
                </tr>
                <tr>
                    <td class="label">To:</td>
                    <td class="value">${bookingDetails.arr_city} (${bookingDetails.to})</td>
                </tr>
                <tr>
                    <td class="label">Departure:</td>
                    <td class="value">${bookingDetails.dept_date} at ${bookingDetails.dept_time}</td>
                </tr>
                <tr>
                    <td class="label">Arrival:</td>
                    <td class="value">${bookingDetails.dept_date} at ${bookingDetails.arr_time}</td>
                </tr>
            </table>
        </div>

        <div class="section">
            <h2>Passenger Information</h2>
            ${bookingDetails.passengers
                .map(
                    (p) => `
                    <table>
                        <tr><td class="label">Name:</td><td class="value">${p.name}</td></tr>
                        <tr><td class="label">Email:</td><td class="value">${p.email}</td></tr>
                        <tr><td class="label">Phone:</td><td class="value">${p.phone}</td></tr>
                        <tr><td class="label">Seat & Class:</td><td class="value">${p.seat} - ${p.class}</td></tr>
                        <tr>
                            <td class="label">Extras:</td>
                            <td class="value2">
                                <ul class="value2">
                                    <li>Meal: ${p.extras.meal}</li>
                                    <li>Entertainment: ${p.extras.entertainment}</li>
                                    <li>Baggage: ${p.extras.baggage}</li>
                                </ul>
                            </td>
                        </tr>
                    </table>
        `,
                )
                .join("")}
        </div>

        <div class="section">
            <h2>Payment Summary</h2>
            <table>
                <tr>
                    <td class="label">Payment Method:</td>
                    <td class="value">${paymentDetails.selected_card.toUpperCase()}</td>
                </tr>
                <tr>
                    <td class="label">Cardholder Name:</td>
                    <td class="value">${paymentDetails.name_card}</td>
                </tr>
                <tr>
                    <td class="label">Card Number:</td>
                    <td class="value">**** **** **** ${paymentDetails.number_card.slice(-4)}</td>
                </tr>
                <tr>
                    <td class="label">Expiry Date:</td>
                    <td class="value">${paymentDetails.expiry_card}</td>
                </tr>
            </table>
        </div>

            <div class="section" style="text-align:center;">
                <p>Thank you for choosing Fly Dream Air. We wish you a pleasant journey!</p>
            </div>
        </div>
    </body>
    </html>
  `;
}

router.post("/api/booking/payment", async (req, res) => {
    try {
        const session = req.session;
        const data = req.body;

        if (!data || Object.keys(data).length === 0) {
            console.log("Attempted to save empty session data");
            return res
                .status(400)
                .json({ message: "No session data provided" });
        }

        if (!session) {
            console.log("no Session Token Attached on flight booking");
            return res.status(500).json({ message: "Session not initialized" });
        }

        if (!data.paymentD)
            req.session.currentBooking = {
                ...req.session.currentBooking, // Preserves other booking details if any
                paymentDetails: data.paymentDetails,
            };

        req.session.save((err) => {
            if (err) {
                console.error("Session save error:", err);
                return res.status(500).json({
                    error: "Failed to save session",
                    details: err.message,
                });
            }

            // Session saved successfully, now send 200 so front end can redirect
            console.log(
                "Session updated with booking details:",
                req.session.currentBooking,
            );
            res.status(200).json({
                message: "Flight details added to session",
                bookingInfo: req.session.currentBooking,
            });
        });

        // disable session expiry
        delete req.session.cookie.expires;
        delete req.session.cookie.maxAge;

        const htmlMessage = await HtmlMessage(req.session.currentBooking);

        // send the email via a fake email address.
        const body = await MakeEmailBody({
            to: req.session.currentBooking.passengers[0].email,
            from: "flydreamair@no-reply.com",
            subject: "Fly Dream Air Flight Receipt",
            message: htmlMessage,
        });

        try {
            const res = await googleService.gmail.users.messages.send({
                userId: "me",
                requestBody: {
                    raw: body,
                },
            });
            console.log("Message sent: ", res.data.id);
        } catch (err) {
            console.log("Error Sending Message: ", err);
        }

        // reenable session expiry
        req.session.cookie.maxAge = parseInt(process.env.SESSION_MAX_AGE, 10);
    } catch (err) {
        console.error("An unexpected error occurred on seats post:", err);
        return res.status(500).json({
            message: "An unexpected error occurred",
            details: err.message,
        });
    }
});

module.exports = router;
