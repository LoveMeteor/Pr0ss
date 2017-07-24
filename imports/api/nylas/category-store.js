import _ from 'underscore'
import Reflux from 'reflux'
import Actions from './actions'
import NylasAPI from './nylas-api'
import NylasUtils from './nylas-utils'
import AccountStore from './account-store'

class CategoryStore extends Reflux.Store {
    constructor() {
        super()

        this.currentCategory = null
    }

    getCategories(accountId) {
        const account = AccountStore.accountForAccountId(accountId)

        return account? account.categories : []
    }

    selectCategory(category) {
        this.currentCategory = category
        this.trigger()
        Actions.loadThreads(category)
    }

    getInboxCategory(accountId) {
        return _.findWhere(this.getCategories(accountId), {name:'inbox'})
    }

    getArchiveCategory(accountId) {
        return _.findWhere(this.getCategories(accountId), {name:NylasUtils.usesFolders(accountId) ? 'archive' : 'all'})
    }

    getTrashCategory(accountId) {
        return _.findWhere(this.getCategories(accountId), {name:'trash'})
    }

    getSpamCategory(accountId) {
        return _.findWhere(this.getCategories(accountId), {name:'spam'})
    }


    getAllMailCategory(accountId) {
        if(!accountId) return null
        const account = AccountStore.accountForAccountId(accountId)

        if(!account) return null
        if(!NylasUtils.usesLabels(account)) return null

        const category = _.findWhere(account.categories, {name: 'all'})
        return category
    }
}

module.exports = new CategoryStore()
