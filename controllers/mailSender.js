const asyncHandler = require("express-async-handler");
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    host: "smtp-relay.brevo.com",
    port: 587,
    secure: false,
    auth: {
        user: "owldacca@gmail.com",
        pass: "dUmOLMYSCtysb5AQ",
    },
});

const sendMail = asyncHandler(async (req, res) => {
    const { email, html } = req.body;

    // return console.log(html)

    const mailOptions = {
        from: "owldacca@gmail.com",
        to: ["owldacca@gmail.com", email],
        subject: "Your order is confirmed at Owldacca",
        html: html,
    };

    await transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            transporter.close()
            console.log(error);
            return res.send({
                status: 200,
                error: error,
                message: "email not sent",
                success: false,
            });
        } else {
            console.log("email send successfully");
            transporter.close();
            return res.send({
                status: 200,
                message: "email sent done",
                success: true,
            });

        }
    });

    return;
});

module.exports = sendMail;


