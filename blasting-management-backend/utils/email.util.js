/*const nodemailer = require('nodemailer');
require('win-ca').inject();

// Create a transporter object with SMTP configuration
const transporter = nodemailer.createTransport({
    service: 'gmail',// Replace with your SMTP server
     // Set true for port 465, false for other ports
    auth: {
        user: 'quarrymaster.system@gmail.com', // Replace with your email
        pass: 'ztbutvxwykrbsxcj'    // Replace with your email password
    },
    tls: {            // This is key difference #2
        rejectUnauthorized: true,
        minVersion: 'TLSv1.2'
    }
});

// Verify connection configuration
transporter.verify((error, success) => {
    if (error) {
        console.error('Email configuration error :', error);
    } else {
        console.log('Email transporter is ready');
    }
});

async function testEmailSending() {
    try {
        // First verify the connection
        await transporter.verify();
        console.log('SMTP connection successful');

        // Send a test email
        const info = await transporter.sendMail({
            from: 'quarrymaster.system@gmail.com',
            to: 'm.ranga.md@gmail.com',  // Replace with your email to receive the test
            subject: 'Test Email',
            text: 'If you receive this email, the setup is working correctly!'
        });

        console.log('Test email sent successfully!');
        console.log('Message ID:', info.messageId);
    } catch (error) {
        console.error('Error:', error);
    }
}

// Run the test
testEmailSending();

/**
 * Send an email
 * @param {Object} mailOptions - Contains 'to', 'subject', and 'html' fields
 
const sendEmail = async (mailOptions) => {
    try {
        const info = await transporter.sendMail({
            from: '"QuarryMaster System" <your-email@example.com>', // Sender address
            to: mailOptions.to, // List of recipients
            subject: mailOptions.subject, // Subject line
            html: mailOptions.html // HTML body
        });

        console.log(`Email sent: ${info.messageId}`);
        return info;
    } catch (error) {
        console.error('Email sending error:', error);
        throw error;
    }
};

module.exports = { sendEmail }; */
