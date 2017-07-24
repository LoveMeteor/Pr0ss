import _ from 'underscore'
import fs from 'fs-plus'
import path from 'path'

module.exports = Utils = {

    waitFor: (latch, options = {}) => {
        timeout = options.timeout || 400
        expire = Date.now() + timeout
        return new Promise((resolve, reject) => {
            attempt = () => {
                if (Date.now() > expire)
                    return reject(new Error("Utils.waitFor hit timeout (#{timeout}ms) without firing."))
                if (latch())
                    return resolve()
                window.requestAnimationFrame(attempt)
            }
            attempt()
        })
    },

    isEqualReact: (a, b, options = {}) => {
        options.functionsAreEqual = true
        options.ignoreKeys = (options.ignoreKeys || []).push("clientId")
        return Utils.isEqual(a, b, options)
    },

    isEqual: (a, b, options = {}) => {
        value = Utils._isEqual(a, b, [], [], options)
        if (options.logWhenFalse) {
            if (!value) console.log("isEqual is false", a, b, options)
            return value
        }
        else
            return value
    },

    _isEqual: (a, b, aStack, bStack, options = {}) => {

        if (a === b) return a != 0 || 1 / a == 1 / b

        if (a == null || b == null) return a == b

        if (a && a._wrapped) a = a._wrapped
        if (b && b._wrapped) b = b._wrapped

        if (options.functionsAreEqual)
            if (_.isFunction(a) && _.isFunction(b)) return true


        className = toString.call(a)
        if (className != toString.call(b)) return false
        switch (className) {
            case '[object RegExp]', '[object String]':
                return '' + a == '' + b
            case '[object Number]':
                if (+a != +a)  return +b != +b
                return (+a == 0) ? 1 / +a == 1 / b : +a == +b
            case '[object Date]', '[object Boolean]':
                return +a == +b
        }


        areArrays = className == '[object Array]'
        if (!areArrays) {
            if (typeof a != 'object' || typeof b != 'object') return false

            aCtor = a.constructor
            bCtor = b.constructor
            if (aCtor != bCtor && !(_.isFunction(aCtor) && aCtor instanceof aCtor && _.isFunction(bCtor) && bCtor instanceof bCtor) && (('constructor' in a) && ('constructor' in b)))
                return false
        }

        aStack = aStack || []
        bStack = bStack || []
        length = aStack.length
        while (length--) {
            if (aStack[length] == a) return bStack[length] == b
        }

        aStack.push(a)
        bStack.push(b)

        if (areArrays) {

            length = a.length
            if (length != b.length) return false

            while (length--) {
                if (!Utils._isEqual(a[length], b[length], aStack, bStack, options)) return false
            }
        } else {

            key = undefined
            keys = Object.keys(a)
            length = keys.length
            if (Object.keys(b).length != length) return false
            keysToIgnore = {}
            if (options.ignoreKeys && _.isArray(options.ignoreKeys))
                for (key of options.ignoreKeys) keysToIgnore[key] = true
            while (length--) {
                key = keys[length]
                if (key in keysToIgnore) continue
                if (!(_.has(b, key) && Utils._isEqual(a[key], b[key], aStack, bStack, options)))
                    return false
            }
        }
        aStack.pop()
        bStack.pop()
        return true
    },

    iconForCategory: (folder) => {
        const icons = [
            'inbox',
            'archive',
            'drafts',
            'sent',
            'junk',
            'spam',
            'trash',
            'snooze',
            'starred',
            'tag',
            'today',
            'plugins',
            'important',
            'folder',
            'all'
        ]


        return `/icons/inbox/ic-category-${folder.name && icons.indexOf(folder.name.trim().toLowerCase())>-1 ? folder.name : "folder"}.png`
    }
}