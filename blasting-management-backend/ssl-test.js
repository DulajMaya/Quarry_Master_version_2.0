const tls = require('tls');

const options = {
    host: 'smtp.gmail.com',
    port: 465,
    servername: 'smtp.gmail.com'
};

const socket = tls.connect(options, () => {
    console.log('Connection established.');
    console.log('Certificate valid:', socket.authorized);
    console.log('Certificate error:', socket.authorizationError);
    console.log('Certificate details:', socket.getPeerCertificate());
    socket.end();
});

socket.on('error', (error) => {
    console.error('Connection error:', error);
});