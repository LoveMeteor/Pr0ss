import Contacts from './contacts'

Meteor.methods({
    insertContact(data)
    {
        check(data, {
            id: Match.Maybe(String),
            account_id: Match.Maybe(String),
            email: String,
            name: Match.Maybe(String),
            phone_numbers: Match.Maybe(Array)
        });

        return Contacts.insert(data)
    },

    updateContact(_id, data)
    {
        check(data, {
            account_id: Match.Maybe(String),
            email: Match.Maybe(String),
            name: Match.Maybe(String),
            phone_numbers: Match.Maybe(Array),
            person_id: Match.Maybe(String)
        });

        data.edited = true
        return Contacts.update({_id}, {$set:data})
    },

    insertOrUpdateContact(data)
    {
        check(data, {
            _id: Match.Maybe(String),
            id: Match.Maybe(String),
            account_id: Match.Maybe(String),
            email: String,
            name: Match.Maybe(String),
            company_id: Match.Maybe(String),
            phone_numbers: Match.Maybe(Array),
            description: Match.Maybe(String)
        });

        data.edited = true
        data.userId = Meteor.userId()
        const {_id} = data
        if(_id) {
            const contact = Contacts.findOne({_id})
            if(!contact) throw new Meteor.Error(`Could not find the contact with _id:${_id}`)

            Contacts.update({_id:_id}, {$set:data})
            return _id
        } else {
            return Contacts.insert(data)
        }

    },

    insertOrUpdateContacts(data) {
        if (!data || data.length == 0) return null

        data = data.filter((item) => item.id && item.email && item.account_id)


        let ids = []
        data.forEach((item) => {
            const {name} = item

            let contact = Contacts.findOne({account_id:item.account_id, email:item.email})

            if (contact) {
                if (!contact.edited && (
                    (item.name && item.name != item.email && contact.name != item.name) ||
                    (item.phone_numbers && item.phone_numbers.length && contact.phone_numbers != item.phone_numbers)
                    )
                ) {
                    Contacts.update({_id:contact._id}, {$set: item})
                    ids.push(contact._id)
                }
            } else {
                if(!name) item.name = item.email

                ids.push(Contacts.insert(item))
            }
        })

        return ids
    },

    removeContact(id)
    {
        const contact = Contacts.findOne({_id:id})

        if(contact.account() && contact.account().isTeamAccount && !Meteor.user().isAdmin())
            throw new Meteor.Error('You have no permission to delete a contact of team inbox')

        Contacts.update({_id: id}, {$set:{removed:true}})
    },
});