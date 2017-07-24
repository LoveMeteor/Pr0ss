import _ from 'underscore'
const RegExpUtils = {
    emailRegex: () => new RegExp(/([a-z.A-Z0-9!#$%&'*+\-/=?^_`{|}~;:]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,63})/g),

    compileTemplate: (tpl, data) => {
        tpl = _.unescape(tpl)
        var re = /<%([^%>]+)?%>/g, match;
        while(match = re.exec(tpl)) {
            tpl = tpl.replace(match[0], data[match[1]])
        }
        return tpl;
    }
}

module.exports = RegExpUtils