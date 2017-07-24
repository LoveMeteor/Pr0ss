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
        clientId: '327167868055-21qqpao9ovc857lv2ttcuv0a9vj9gssc.apps.googleusercontent.com',
        clientSecret: 'bGZLIBQv4-2t_yqNY_8c3r0p',
        redirectUri: 'https://crm-test.mavrik.build/auth/google/callback',
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
        apiKey: 'xoxp-136423598965-136423599189-208253208400-8116cad548d6084a7f02841f53b06f05',
        inviteKey: 'xoxp-136423598965-136423599189-142146118262-9e22fb56f47ce5af80c9f3d5ae363666',
        botToken: 'xoxb-208218577667-PFnQBmx9AFaHsEpOElyZzbSC',
        botId: 'U646EGZKM',
        botName: 'mavrikbot'
    },
    prossDocDrive: {
        clientId: '172791167032-f754bmde8rc7mk3hvcvmf7he5a4dm84o.apps.googleusercontent.com',
        clientSecret: 'SsDxLArSch9CbKHI0A12nf8s',
        redirectUri: `${Meteor.absoluteUrl()}auth/google/callback`,
        refreshToken: '1/zVrPpdJ3eY4X5vQbdPNNsSF23SQ_pMO8kLjVWGMDFsyiuXI1NUkwZSegrvAkGhhf',
    },
}
