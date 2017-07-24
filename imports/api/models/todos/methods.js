import _ from 'underscore';
import {Todos} from './todos'

Meteor.methods({
    insertTodo(data)
    {
        check(data, {
            id: String,
            account_id: String,
            email: String,
            title: Match.Maybe(String),
            content: Match.Maybe(String)
        });

        return Todos.insert(data)
    },

    updateTodo(id, data)
    {
        check(data, {
            account_id: Match.Maybe(String),
            email: Match.Maybe(String),
            title: Match.Maybe(String),
            content: Match.Maybe(String)
        });

        return Todos.update({id}, data)
    },

    insertOrUpdateTodos(data) {
        if (!data || data.length == 0) return null

        data = data.filter((item) => item.id && item.email && item.account_id)

        let existingTodos = Todos.find({id: {$in: _.pluck(data, 'id')}}).fetch()

        let ids = []
        data.forEach((item) => {
            const {id, title} = item

            let todo = _.find(existingTodos, {id})

            if (todo) {
                if ((item.email && todo.email != item.email) ||
                    (item.title && todo.title != item.title) ||
                    (item.content && todo.content != item.content)) {
                    Todos.update({id}, {$set: item})
                    ids.push(id)
                }
            } else {

                ids.push(Todos.insert(item))
            }
        })

        return ids
    },

    removeTodo(id)
    {
        Todos.remove({_id: id})
    },
});