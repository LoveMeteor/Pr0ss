import { getUserName, getUserSignature } from './filters';

export const generateEmailHtml = function(user, text, url){
    const signature = getUserSignature(user) ? decodeURI(getUserSignature(user)) : "";
    return `
    <h3>Hello</h3>
    <p>You have a new message from ${getUserName(user, true)}</p>
    <p style="padding: 0 20px; border-left: 5px solid #232323">
        <a href="${url}">${text}</a>
    </p>
    
    ${signature}
    `
};

export const simpleEmail = function (user,text) {
    const signature = getUserSignature(user) ? decodeURI(getUserSignature(user)) : "";
    return `
    <p>text</p>
    
    ${signature}
    `
};