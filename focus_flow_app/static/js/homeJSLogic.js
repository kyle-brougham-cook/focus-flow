/** This file simply build the UI logic for the home page */

const loginBtn = document.getElementById('login');
const signupBtn = document.getElementById('signup');


const buttons = document.getElementsByClassName('button')
const buttonsArray = [...buttons];

buttonsArray.forEach(element => {
    element.addEventListener('click', (e) => {
        e.preventDefault();
        if (element.id === 'login') {
            window.location.href = '/auth/login_page';
        }
        else {
            window.location.href ='/auth/signup';
        };
    })

});
