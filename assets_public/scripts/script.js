'use strict';

// defining some constants

var EMAIL_FORMAT = new RegExp("^[a-zA-Z0-9._-]+[@][a-zA-Z0-9]+[.][a-zA-Z0-9]+$");

$(window).ready(setup);

function setup() {
    
}

// Attach event handlers.
// ...


// =============================================================================
// General
// =============================================================================




// =============================================================================
// Login
// =============================================================================

// show the sign up page
$('.li-login-signup a').on('click', function(e) {
	e.preventDefault();

	$(this).parent().addClass('active');
	$(this).parent().siblings().removeClass('active');

	var target = $(this).attr('href');
	
	$(target).css('display' , 'block');
	$('#section-wrapper > section').not(target).hide();
	$('.error_message').remove();
});



// actions when the log in button is clicked
$("#button-login").on('click', function(e) {
	// Prevents form from submitting right away:
	e.preventDefault(); 

	// proceed if passed client side validation
	if (validate_login()) {
		//var hashed_username = hash_fun($('input#username').val());
		//var hashed_password = hash_fun($('input#password').val());
		var entered_username = $('input#username').val();
		var entered_password = $('input#password').val();
		proceed_login(entered_username, entered_password);
	}
});

// actions when the sign up button is clicked
$("#button-signup").on('click', function(e) {
	// Prevents form from submitting right away:
	e.preventDefault(); 

	// Allows or keeps halting form submission process; returns true or false.
	if(validate_signup()) {
		var entered_username = $('input#new_username').val();
		var entered_password = $('input#new_password').val();
		var entered_email = $('input#new_email').val();
		proceed_signup(entered_username, entered_password, entered_email);
	}
	return;
});

  
function validate_login() {
	var isValid = true;

	// Remove previous error messages, if they exist.
	if ($('label.loginField span.error_message').length)
		$('label.loginField span.error_message').remove();

	// Deal with each field separately.
	var username = $('input#username').val();
	if ( username == "") {
		$('input#username').after("<span class='error_message'>Please provide a username.</span>");
		isValid = false;
	}

	var password = $('input#password').val();
	if (password == "")	{
		$('input#password').after("<span class='error_message'>Please provide a password.</span>");
		isValid = false;
	}

	return isValid;
}

function validate_signup() {
	var isValid = true;
	
	// Remove previous error messages, if they exist.
	if ($('label.signupField span.error_message').length)
		$('label.signupField span.error_message').remove();
	
	// Deal with each field separately.
	var new_username = $('input#new_username').val();
	if ( new_username == "") {
		$('input#new_username').after("<span class='error_message'>Please provide a username.</span>");
		isValid = false;
	}
	
	var new_password = $('input#new_password').val();
	if ( new_password == "") {
		$('input#new_password').after("<span class='error_message'>Please provide a password.</span>");
		isValid = false;
	}
	
	var reenter_password = $('input#reenter_password').val();
	if ( reenter_password == "") {
		$('input#reenter_password').after("<span class='error_message'>Please repeat the previous password.</span>");
		isValid = false;
	} else if (new_password != $('input#reenter_password').val()) {
		$('input#reenter_password').after("<span class='error_message'>Password does not match.</span>");
		isValid = false;
	}  else if (!strong_password(new_password)) {
		isValid = false;
	}

	var new_email = $('input#new_email').val();

	if ( new_email == "") {
		$('input#new_email').after("<span class='error_message'>Please provide an email.</span>");
		isValid = false;
	} else {
		if (!new_email.match(EMAIL_FORMAT)) {
			$('input#new_email').after("<span class='error_message'>Please reenter a valid email address.</span>");
		}
	}
	return isValid;
}

function strong_password(new_password) {
	var isStrong = true;
	// lenght must >= 8
	if (new_password.length < 8) {
		$('input#new_password').after("<span class='error_message'>Password should be at least 8 characters.</span>");
		isStrong = false;
	}
	return isStrong;
}

// hash username or password
function hash_fun(hash_item) {
	var hash = CryptoJS.SHA3(hash_item);
	return hash;
}

// login POST request
function proceed_login(entered_username, entered_password) {
	
    var userData = {
		'username': entered_username,
		'password': entered_password
	};
    
    var request = $.ajax({
        url: "/api/login/",
        dataType: 'JSON',
        data: userData,
        method: 'POST'
    })
    .done(function (data) {
		// redirect to the main page
		$('input#password').after("<span class='error_message'>" + data.reason + "</span>");
        if (data.redirect != '') {
            window.location = data.redirect;
        }
        console.log(data);
    })
	.fail(function( jqXHR, textStatus ) {
        $('input#password').after("<span class='error_message'>Sorry username or password incorrect.<br>Please reenter or signup.</span>");
    });
}

function proceed_signup(entered_username, entered_password, entered_email) {
	
    // Remove previous error messages, if they exist.
    if ($('#form-signup span.error_message').length)
        $('#form-signup span.error_message').remove();

    var userData = {
		username: entered_username,
		password: entered_password,
		email: entered_email
	};

    $.ajax({
        url: "/api/signup/",
        dataType: 'JSON',
		data: userData,
        method: 'POST'
    })
    .done(function (data) {
		// redirect to the main page if succeed
		// user maybe already exist, not a failed request
		$('#form-signup #reenterPasswordField').after("<span class='error_message'>" + data.reason + "</span>");
        if (data.redirect != '') {
            window.location = data.redirect;
        }
    })
	.fail(function( jqXHR, textStatus ) {
        $('input#reenter_password').after("<span class='error_message'>Sorry signup failed.</span>");
    });
}

//project id with google+ api
//geometric-shine-138823
var apiKey = 'geometric-shine-138823';

var clientId = '127781223288-90urgk6hpahh7nsi145osh5mo5pvna08.apps.googleusercontent.com';

// client secret isO1HXYYlw-MHx-0xgr59060


var scopes = 'profile';
var auth2; // The Sign-In object.
var authorizeButton = document.getElementById('#google-login');
function handleClientLoad() {

// Load the API client and auth library
gapi.load('client:auth2', initAuth);
}

function initAuth() {
	gapi.client.setApiKey(apiKey);
	gapi.auth2.init({
		client_id: clientId,
		scope: scopes
	}).then(function () {
	  auth2 = gapi.auth2.getAuthInstance();
	  // Listen for sign-in state changes.
	  auth2.isSignedIn.listen(updateSigninStatus);
	  // Handle the initial sign-in state.
	  updateSigninStatus(auth2.isSignedIn.get());
	  authorizeButton.onclick = handleAuthClick;
	  signoutButton.onclick = handleSignoutClick;
	});
}

function updateSigninStatus(isSignedIn) {
    var authorizeButton = document.getElementById('#google-login');  // silence error
	if (isSignedIn) {
	  	authorizeButton.style.display = 'none';
	  	makeApiCall();
	} else {
	  	authorizeButton.style.display = 'block';
	}
}

function handleAuthClick(event) {
	auth2.signIn();
}

function handleSignoutClick(event) {
	auth2.signOut();
}

// Load the API and make an API call
// create a new user with this username
function makeApiCall() {
	gapi.client.load('people', 'v1', function() {
		var request = gapi.client.people.people.get({
			resourceName: 'people/me'
		});
		request.execute(function(resp) {
			var p = document.createElement('p');
			var name = resp.names[0].givenName;
			// let the user sign up automatically
			proceed_signup(name, '11111111', '123@gmail.com');
		});
	});
}

