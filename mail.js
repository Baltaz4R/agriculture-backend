var nodemailer = require('nodemailer');


function sendMail(email) {
    var transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
        user: 'etf.pia@gmail.com',
        pass: 'Sifra.123'
        }
    });
    
    var mailOptions = {
        from: 'etf.pia@gmail.com',
        to: email,
        subject: 'UPOZARENjE!',
        text: 'Vaš rasadnik je u opasnosti. Molimo vas preduzmite potrebne mere.'
    };
    
    transporter.sendMail(mailOptions, function(error, info) {
        if (error) {
        console.log(error);
        } else {
        console.log('Email sent: ' + info.response);
        }
    });
}


module.exports = sendMail;