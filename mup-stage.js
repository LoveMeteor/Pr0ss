module.exports = {
    servers: {
        one: {
            host: '159.203.107.170',
            username: 'root',
            pem: '~/.ssh/id_rsa'
        }
    },

    meteor: {
        name: 'prossimo-stage',
        path: '.',

        servers: {
            one: {},
        },

        ssl: {
            autogenerate: {
                email: 'quotes@prossimo.us',
                domains: 'crm-test.mavrik.build'
            }
        },

        env: {
            ROOT_URL: 'https://crm-test.mavrik.build',
            MONGO_URL: 'mongodb://localhost:27017/prossimo-stage'
        },

        buildOptions: {
            serverOnly: true,
            debug: true,
            cleanAfterBuild: true
        },

        docker: {
            image: 'abernix/meteord:base'
        },

        deployCheckWaitTime: 60,

        enableUploadProgressBar: true
    },

    mongo: {
        port: 27017,
        version: '3.4.1',
        servers: {
            one: {}
        }
    }
}
