import Actions from '/imports/api/nylas/actions'
import '/imports/api/nylas/contact-store'
import '/imports/api/nylas/thread-store'

const fetchContacts = () => {console.log('fetchContacts', Meteor.userId())
    if (Meteor.userId()) {
        Actions.loadContacts()

        clearInterval(fetchContactsInterval)
    }
}
const fetchContactsInterval = setInterval(fetchContacts, 1 * 1000 * 120)    // every 2 minutes

const fetchThreads = () => {
    if (Meteor.userId()) {
        Actions.loadThreads()
    }
}
setInterval(fetchThreads, 1 * 1000 * 120)   // every 2 minutes

/*const fetchUnreadsCount = () => {
    if (Meteor.userId()) {
        Meteor.user().nylasAccounts().forEach((account, index) => {
            setTimeout(() => {
                Meteor.call('fetchUnreads', account._id, (err, res) => {
                    if(err) console.error(err)
                })
            }, 1000 * 30 * index)
        })

        //clearInterval(fetchUnreadsCountInterval)
    }
}
const fetchUnreadsCountInterval = setInterval(fetchUnreadsCount, 60 * 1000)*/
