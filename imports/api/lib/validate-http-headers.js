var rules = require('./rules');

function cleanName(name){

    if(rules.validHeaderName(name)){
        return name;
    } else {
        return rules.cleanHeaderName(name);
    }
}

function cleanValue(value){
    if(rules.validHeaderValue(value)){
        return value;
    } else {
        return rules.cleanHeaderValue(value);
    }
}

function cleanHeaders(headers) {
    var cleanHeaders = {};
    if(!headers) {
        return cleanHeaders;
    }
    Object.keys(headers).forEach(function(name){
        var value = headers[name];
        name = cleanName(name);
        value = cleanValue(value);
        cleanHeaders[name] = value;
    });
    return cleanHeaders;
}


module.exports = exports = cleanHeaders;