import Reflux from 'reflux'

const Actions = Reflux.createActions([
    'changedAccounts',
    'changedThreads',
    'loadContacts',         // accountId
    'loadThreads',          // folder, {page, search}
    'loadMessages',         // thread

    'resetContacts',

    'toggleMessageExpanded',
    'toggleAllMessagesExpanded',
    'toggleHiddenMessages',

    'selectAttachment',
    'addAttachment',
    'removeAttachment',

    'fetchImage',
    'downloadFile',
    'downloadFiles',
    'abortDownloadFile',
    'removeFile',
    'downloadStateChanged',

    'composeNew',
    'composeReply',
    'composeForward',

    'sendDraft',
    'sendDraftSuccess',
    'sendDraftFailed',

    'queueTask',
    'queueTasks',

    'changedConversations',
    'fetchSalesRecordThreads'
]);

module.exports = Actions;