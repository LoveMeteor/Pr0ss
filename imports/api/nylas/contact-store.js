import Reflux from 'reflux'
import QueryString from 'query-string'
import Actions from './actions'
import NylasAPI from './nylas-api'
import AccountStore from './account-store'
import RegExpUtils from './RegExpUtils'
import Contacts from '../models/contacts/contacts'
const PAGESIZE = 100

class ContactStore extends Reflux.Store {
    constructor() {
        super()

        this.contacts = []
        this.loading = false

        this.currentPage = 1
        this.fullyLoaded = false

        this.listenTo(Actions.loadContacts, this.onLoadContacts)
        this.listenTo(Actions.resetContacts, () => this.contacts=[])
    }

    onLoadContacts() {
        const accounts = AccountStore.accounts()

        if (!accounts || accounts.length == 0) return


        const loadContacts = (accountId, page) => {
            const query = QueryString.stringify({
                offset: (page - 1) * PAGESIZE,
                limit: PAGESIZE
            })

            NylasAPI.makeRequest({
                path: `/contacts?${query}`,
                method: 'GET',
                accountId
            }).then((result) => {
                if (result && result.length) {

                    Meteor.call('insertOrUpdateContacts', result, (err, ids) => {
                        if(ids && ids.length)
                            this.trigger()
                    })

                    if (result.length == PAGESIZE) {
                        loadContacts(accountId, page + 1)
                    }

                }
            })
        }

        accounts.forEach((account) => {
            loadContacts(account.accountId, 1)
        })


    }

    getAllContacts() {
        return this.contacts
    }

    getContacts({page, account_id, search}={}) {

        page = page ? page : this.currentPage

        const filters = {}
        if(account_id) filters.account_id = account_id
        if(search) {
            const regex = {$regex: search, $options: 'i'}
            filters['$or'] = [{email: regex}, {name: regex}]
        }

        const result = Contacts.find(filters, {skip:(page-1)*PAGESIZE,limit:PAGESIZE,sort:{name:1}}).fetch()


        if(result.length == PAGESIZE) {
            this.fullyLoaded = false
        } else {
            this.fullyLoaded = true
        }
        const cids = _.pluck(this.contacts, '_id')
        result.forEach((c) => {
            if(!_.contains(cids, c._id))
                this.contacts.push(c)
        })

        this.currentPage = page

        this.contacts = _.uniq(this.contacts, (contact) => contact.email)
        return this.contacts
    }

    isLoading() {
        return this.loading
    }

    parseContactsInString = (contactString, options = {}) => {
        const {skipNameLookup} = options

        const detected = []
        const emailRegex = RegExpUtils.emailRegex()
        let lastMatchEnd = 0

        let match
        while (match = emailRegex.exec(contactString)) {
            let email = match[0]
            name = null

            const startsWithQuote = email[0] in ['\'', '"']
            const hasTrailingQuote = contactString[match.index + email.length] in ['\'', '"']
            if (startsWithQuote && hasTrailingQuote)
                email = email.slice(1)

            const hasLeadingParen = contactString[match.index - 1] in ['(', '<']
            const hasTrailingParen = contactString[match.index + email.length] in [')', '>']

            if (hasLeadingParen && hasTrailingParen) {
                let nameStart = lastMatchEnd
                for (const char of [',', '\n', '\r']) {
                    const i = contactString.lastIndexOf(char, match.index)
                    if (i + 1 > nameStart) nameStart = i + 1
                }
                name = contactString.substr(nameStart, match.index - 1 - nameStart).trim()
            }

            // The "nameStart" for the next match must begin after lastMatchEnd
            lastMatchEnd = match.index + email.length
            if (hasTrailingParen)
                lastMatchEnd += 1

            if (!name || name.length == 0)
                name = email

            // If the first and last character of the name are quotation marks, remove them
            const firstChar = name[0], lastChar = name[name.length - 1]
            if (firstChar in ['"', '\''] && lastChar in ['"', '\''])
                name = name.slice(1, -1)

            detected.push(new Contact({email, name}))
        }

        if (skipNameLookup)
            return Promise.resolve(detected)

        Promise.all(
            detected.map((contact) => {
                if (contact.name != contact.email) return contact
                this.searchContacts(contact.email, {limit: 1}).then(([match]) => {
                    if (match && match.email == contact.email) return match
                    return contact
                })
            })
        )
    }

    searchContacts = (search, options = {}) => {
        let {limit} = options
        limit = limit ? limit : 5
        limit = Math.max(limit, 0)

        search = search.toLowerCase()
        //accountCount = AccountStore.accounts().length

        if (!search || search.length === 0) {
            return Promise.resolve([])
        }

        const filter = {$regex: search, $options: 'i'}

        let result = Contacts.find({$or: [{email: filter}, {name: filter}]}).fetch()
        //console.log(JSON.stringify({$or: [{email: filter}, {name: filter}]}))

        result = this._distinctByEmail(result)

        if (result.length > limit) result.length = limit


        return Promise.resolve(result)
    }

    _distinctByEmail = (contacts) => {
        // remove query results that are duplicates, prefering ones that have names
        const uniq = {}
        for (const contact of contacts) {
            if (!contact.email) continue
            const key = contact.email.toLowerCase()
            const existing = uniq[key]
            if (!existing || (!existing.name || existing.name == existing.email))
                uniq[key] = contact
        }
        return _.values(uniq)
    }

    isValidContact = (contact) => {
        if (!contact instanceof Contact) return false
        if (!contact.email) return false

        // The email regexp must match the /entire/ email address
        const result = RegExpUtils.emailRegex().exec(contact.email)
        if (result && result instanceof Array)
            return result[0] == contact.email
        else return false
    }

}

module.exports = new ContactStore()
