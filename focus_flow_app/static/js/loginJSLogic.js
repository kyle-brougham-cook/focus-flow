/**
 * loginJSLogic.js
 *
 *
 * This file at the current time is used to clear flash messages from
 * login_page after 5000 miliseconds(5 seconds)...
 */


const flashMessage = document.getElementById('notification');



setTimeout(() => {
    flashMessage.remove()
}, 5000);
