import './headConfig'
import './router'
import './nylas-sync'

// NOTE: event name is all lower case as per DOM convention
window.addEventListener("unhandledrejection", function(e) {
    // NOTE: e.preventDefault() must be manually called to prevent the default
    // action which is currently to log the stack trace to console.warn
    e.preventDefault();
    // NOTE: parameters are properties of the event detail property
    var reason = e.detail.reason;
    var promise = e.detail.promise;
    // See Promise.onPossiblyUnhandledRejection for parameter documentation
});

// NOTE: event name is all lower case as per DOM convention
window.addEventListener("rejectionhandled", function(e) {
    // NOTE: e.preventDefault() must be manually called prevent the default
    // action which is currently unset (but might be set to something in the future)
    e.preventDefault();
    // NOTE: parameters are properties of the event detail property
    var promise = e.detail.promise;
    // See Promise.onUnhandledRejectionHandled for parameter documentation
});


