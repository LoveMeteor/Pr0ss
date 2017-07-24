import _ from 'underscore'
import Reflux from 'reflux'
import Actions from './actions'
import CategoryStore from './category-store'
import {NylasAccounts} from '../models'

class AccountStore extends Reflux.Store {
    constructor() {
        super()

        this._accounts = []

        this.listenTo(Actions.changedAccounts, this.onChangedAccounts)
    }

    onChangedAccounts = () => {
        this.trigger()

        const accounts = this.accounts()

        if(!accounts || accounts.length==0) return

        const currentCategory = CategoryStore.currentCategory
        let allCategories = []

        accounts.forEach((account) => {
            allCategories = allCategories.concat(account.categories)
        })

        if(!currentCategory || !_.contains(allCategories, currentCategory)) {
            CategoryStore.selectCategory(allCategories[0])
        }

        Actions.loadContacts()
    }
    accounts() {
        if(!Meteor.user()) return null
        this._accounts = Meteor.user().nylasAccounts()

        return this._accounts
    }
    defaultAccount() {
        const accounts = this.accounts()
        return accounts&&accounts.length ? accounts[0] : null
    }

    accountForEmail(email) {
        return _.findWhere(this.accounts(), {emailAddress:email})
    }

    accountForAccountId(accountId) {
        if(accountId)
            return _.findWhere(this.accounts(), {accountId})

        return this.defaultAccount()
    }

    tokenForAccountId(accountId) {
        const account = NylasAccounts.findOne({accountId})//this.accountForAccountId(accountId)

        return account ? account.accessToken : null
    }

    getSelectedAccount() {
        const currentCategory = CategoryStore.currentCategory

        if(currentCategory) {
            return this.accountForAccountId(currentCategory.account_id)
        }

        return this.defaultAccount()
    }

    signatureForAccountId(accountId) {
        const account = this.accountForAccountId(accountId)

        return account ? account.signature : null
    }
}

module.exports = new AccountStore()
