import _ from 'underscore'
import Reflux from 'reflux'

const LIMIT = 100
const CommonSchema = {
    id: {
        type: 'string',
        primary: true
    },
    object: {
        type: 'string'
    },
    account_id: {
        type: 'string'
    }
}
const Schema = {
    thread: _.extend(_.clone(CommonSchema), {
        subject: {
            type: 'string'
        },
        unread: {
            type: 'boolean'
        },
        starred: {
            type: 'boolean'
        },
        last_message_timestamp: {
            type: 'integer'
        },
        last_message_received_timestamp: {
            type: 'integer'
        },
        first_message_timestamp: {
            type: 'integer'
        },
        participants: {
            type: 'array'
        },
        snippet: {
            type: 'string'
        },
        message_ids: {
            type: 'array'
        },
        draft_ids: {
            type: 'array'
        },
        version: {
            type: 'integer'
        },
        folders: {
            type: 'array'
        },
        labels: {
            type: 'array'
        }
    }),
    message: _.extend(_.clone(CommonSchema), {
        thread_id: {
            type: 'string'
        },
        subject: {
            type: 'string'
        },
        from: {
            type: 'array'
        },
        to: {
            type: 'array'
        },
        cc: {
            type: 'array'
        },
        bcc: {
            type: 'array'
        },
        reply_to: {
            type: 'array'
        },
        date: {
            type: 'integer'
        },
        unread: {
            type: 'boolean'
        },
        starred: {
            type: 'boolean'
        },
        snippet: {
            type: 'string'
        },
        body: {
            type: 'string'
        },
        files: {
            type: 'array'
        },
        events: {
            type: 'array'
        },
        folder: {
            type: 'object'
        },
        labels: {
            type: 'array'
        }
    })
}

const QueryType = {
    create: 'CREATE',
    insert: 'INSERT',
    update: 'UPDATE',
    delete: 'DELETE',
    select: 'SELECT',

}
class DatabaseStore extends Reflux.Store {
    constructor(salesRecord = null) {
        super()

        this.db = openDatabase('nylasdb2', '1.0', 'Nylas Database', 2 * 1024 * 1024)
    }

    buildQuery(queryType, tableName, options = {}) {
        let query
        const dataType = (t) => {
            switch (t) {
                case 'string':
                    return 'TEXT'
                case 'integer':
                case 'boolean':
                    return 'INTEGER'
                case 'array':
                case 'object':
                    return 'BLOB'
                default:
                    return null
            }
        }
        const schema = Schema[tableName]

        if (queryType === QueryType.create) {
            const columns = Object.keys(schema).map((key) => {
                const field = schema[key]

                return `'${key}' ${dataType(field.type)}${field.primary ? ' PRIMARY KEY' : ''}`
            })
            query = `CREATE TABLE IF NOT EXISTS ${tableName} (${columns.join(', ')})`
        } else if (queryType === QueryType.insert) {
            const columnNames = Object.keys(schema).map((key) => `'${key}'`)
            query = `INSERT INTO ${tableName} (${columnNames.join(', ')}) VALUES (${columnNames.map(() => '?').join(', ')})`
        } else if (queryType === QueryType.update) {
            const columnNames = Object.keys(schema).map((key) => `'${key}'`)
            query = `UPDATE ${tableName} SET ${columnNames.map((name) => `${name}=?`).join(', ')}${this._whereString(options.where)}`
        } else if (queryType === QueryType.delete) {
            query = `DELETE FROM ${tableName}${this._whereString(options.where)}`
        } else if (queryType === QueryType.select) {
            const offset = options.offset || 0
            const limit = options.limit || LIMIT
            query = `SELECT * FROM ${tableName}${this._whereString(options.where)}`
        }
        //console.log(query)
        return query

    }

    _whereString(where) {
        const sqlVal = (v) => {
            if(typeof v === 'string') {
                return `'${v}'`
            } else {
                return v
            }
        }
        const filter = (k, v) => {
            if (typeof v === 'object') {
                if(v.hasOwnProperty('like')) {
                    return `${k} LIKE '%${v['like']}%'`
                } else if(v.hasOwnProperty('in')) {
                    return `${k} IN (${v['in'].map((iv) => sqlVal(iv)).join(',')})`
                }
                return ''
            } else {
                return `${k}=${sqlVal(v)}`
            }
        }

        if(where && !_.isEmpty(where)) {
            return ` WHERE ${Object.keys(where).map((key) => filter(key, where[key])).join(' AND ')}`
        } else {
            return ''
        }
    }

    prepareTable(tableName) {
        return new Promise((resolve, reject) => {
            this.db.transaction((tx) => {
                const query = this.buildQuery(QueryType.create, tableName)

                tx.executeSql(query,
                    [],
                    () => resolve(),
                    () => reject()
                )
            })
        })
    }

    persistObjects(objName, objData) {
        return new Promise((resolve, reject) => {
            this.prepareTable(objName).then(() => {
                let changed = false
                const promises = objData.map((obj) => new Promise((resolve, reject) => {
                    this.findObjectById(objName, obj.id).then((dbObj) => {
                        if (!dbObj) {
                            changed = true
                            this.db.transaction((tx) => {
                                const query = this.buildQuery(QueryType.insert, objName)

                                const schema = Schema[objName]
                                tx.executeSql(
                                    query,
                                    Object.keys(schema).map((key) => {
                                        let val = obj[key]
                                        if (typeof val === 'object') val = JSON.stringify(val)
                                        return val
                                    }),
                                    () => resolve(),
                                    () => reject()
                                )

                            })
                        } else if (!_.isEqual(dbObj, obj)) {
                            changed = true
                            this.db.transaction((tx) => {
                                const query = this.buildQuery(QueryType.update, objName, {where:{id:obj.id}})

                                const schema = Schema[objName]
                                tx.executeSql(
                                    query,
                                    Object.keys(schema).map((key) => {
                                        let val = obj[key]
                                        if (typeof val === 'object') val = JSON.stringify(val)
                                        return val
                                    }),
                                    () => resolve(),
                                    () => reject()
                                )

                            })
                        } else {
                            resolve()
                        }
                    })
                }))

                return Promise.all(promises).then((result) => {
                    resolve()
                    if(changed) this.trigger(objName)
                })
            })
        })
    }

    deleteObjects(objName, filter) {
        return new Promise((resolve, reject) => {
            this.db.transaction((tx) => {
                const query = this.buildQuery(QueryType.delete, objName)
                tx.executeSql(
                    query,
                    [],
                    () => resolve(),
                    () => reject()
                )
            })
        })
    }

    findObjects(objName, where = {}, offset = 0, limit = LIMIT) {
        const isJsonString = (str) => {
            try {
                JSON.parse(str)
            } catch (e) {
                return false
            }
            return true
        }
        return new Promise((resolve, reject) => {
            this.db.transaction((tx) => {
                const query = this.buildQuery(QueryType.select, objName, {where, offset, limit})

                tx.executeSql(
                    query,
                    [],
                    (tx, result) => {
                        const len = result.rows.length
                        const data = []
                        for (let i = 0; i < len; i++) {
                            const item = result.rows.item(i)
                            Object.keys(item).forEach((key) => {
                                if(isJsonString(item[key])) item[key] = JSON.parse(item[key])
                                if(Schema[objName][key]['type']!=='string' && item[key] == 'undefined') item[key] = undefined
                            })
                            data.push(item)
                        }
                        return resolve(data)
                    },
                    () => resolve([])
                )
            })
        })
    }

    findObject(objName, where = {}) {
        return this.findObjects(objName, where).then((result) => result && result.length ? result[0] : null)
    }

    findObjectById(objName, id) {
        return this.findObject(objName, {id})
    }
}
module.exports = new DatabaseStore()
