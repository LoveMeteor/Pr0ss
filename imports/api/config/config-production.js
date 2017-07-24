const twilioAppSid = {
    'http://localhost:3000/': 'APcbc5a71582dd8c085ef5580496229d18',
    'http://crm.prossimo.us/': 'AP5516d514602651aab27c3d87370fe12f',
    'https://crm.prossimo.us/': 'APcce106e0cf8236a9d9009b69f0cc5b00'
}


module.exports = {
    nylas: {
        appId: '4xnb7gd7t7la2kxls35j3k7t3',
        appSecret: '9tbqdscu0b5q16r422t76onnx',
        apiRoot: 'https://api.nylas.com',
    },
    google: {
        clientId: '327167868055-8lepf2bd6nitfeefg1ukf3fq5769rh6h.apps.googleusercontent.com',
        clientSecret: 'am9W0AB4JGaB3OcX66L7oSGg',
        redirectUri: 'https://crm.mavrik.build/auth/google/callback',
        clientDriveId: '977294428736-it2160rgkpdtrp4hjm3mhjr97n4q5rmp.apps.googleusercontent.com',
        clientDriveSecret: 'aJmwh_egnDWiuebEc2GkEwOA',
        serviceAccountEmail: '977294428736-compute@developer.gserviceaccount.com',
        serviceAccountPemCertPath: `${Meteor.absolutePath}/prossimo-us.pem`,
    },
    twilio: {
        accountSid: 'AC3c2ae50d8872dbe6b907b157deb5483c',
        authToken: 'afdae10c9f35c595678a5af23301d022',
        appSid: twilioAppSid[Meteor.absoluteUrl()],
        phoneNumber: '+19142905527',
    },
    slack: {
        apiRoot: 'https://slack.com/api',
        apiKey: 'xoxp-6955176705-6955117235-209748140311-af40eeba969db458c3d31ce59fe24bd4',
        inviteKey: 'xoxp-6955176705-6955117235-208497785602-cda88bc4c2e4dcca4acf99c1e265441b',
        botToken: 'xoxb-209156147511-9LRUytVG2oFBeUDcSbEDjcqh',
        botId: 'U654L4BF1',
        botName: 'mavrikbot'
    },
    prossDocDrive: {
        clientId: '172791167032-f754bmde8rc7mk3hvcvmf7he5a4dm84o.apps.googleusercontent.com',
        clientSecret: 'SsDxLArSch9CbKHI0A12nf8s',
        redirectUri: `${Meteor.absoluteUrl()}auth/google/callback`,
        refreshToken: '1/zVrPpdJ3eY4X5vQbdPNNsSF23SQ_pMO8kLjVWGMDFsyiuXI1NUkwZSegrvAkGhhf',
    },
}
