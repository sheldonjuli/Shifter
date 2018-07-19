'use strict';

// defining some constants
var IP_FORMAT = new RegExp("^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$");

var EMAIL_FORMAT = new RegExp("^[a-zA-Z0-9._-]+[@][a-zA-Z0-9]+[.][a-zA-Z0-9]+$");

$(window).ready(setup);

function setup() {
    
}

// declaring global variables
var user_data_fetched = false;
var edit_enable = true;
var num_workplace = 0;

// =============================================================================
// Admin
// =============================================================================

// a hash function might be used
// function hash_fun(hash_item) {
// 	var hash = CryptoJS.SHA3(hash_item);
// 	return hash;
// }

// enforce strong password
// dummy version, just check password length
function strong_password(new_password) {
	var isStrong = true;
	// lenght must >= 8
	if (new_password.length < 8) {
		$('input#new_password').after("<span class='error_message'>Password should be at least 8 characters.</span>");
		isStrong = false;
	}
	return isStrong;
}

// remove all the dash board error messages
function remove_dashitem_error() {
	if ($('span.error_message').length)
	$('span.error_message').remove();
}

// check if the username is empty
// print error message if true
// proceed request if false
function check_user_empty(entered_username) {
	remove_dashitem_error();
	if (entered_username == "") {
		// username can not be empty
		$('input#adminSelectUser').after("<span class='error_message'>Username can not be empty.</span>");
		return true;
	} else {
		return false;
	}
}

// get user information given username
function select_user() {
	$(".dynamically-insert-table").remove();
	var entered_username = $("#adminSelectUser").val();
	if (check_user_empty(entered_username) == true) {
		return;
	} else {
		//var hashed_username = hash_fun(entered_username);
		$.ajax({
			url: "/api/user/" + entered_username,
			dataType: 'JSON',
			method: 'GET'
		})
		.done(function (data) {
			console.log(data);
			// user does not exist
			if (data.firstName == null) {
				$("td.table-value").text("N/A");
			} else {
				$("td#td-admin-pwd").text("Hidden for security reasons");
				$("td#td-admin-first-name").text(data.firstName);
				$("td#td-admin-middle-name").text(data.middleName);
				$("td#td-admin-last-name").text(data.lastName);
				
				// dynamically insert work place
				for (num_workplace = 0; num_workplace < (data.workplaces).length; num_workplace++) {
					// $("tr#tr-last-name").after("</tr>");
					// var id_work_addr = "work-addr" + num_workplace;
					// $("tr#tr-last-name").after("<td class='dynamically-insert-table table-value' id='" + id_work_addr + "'>" 
					// 						   + (data.workplaces)[num_workplace].address + "</td>");
					// $("tr#tr-last-name").after("<td class='dynamically-insert-table' id='holder-wa" + num_workplace + "'>Work Address:</td>");
					// $("tr#tr-last-name").after("<tr class='dynamically-insert-table'>");
					// var id_work_name = "work-name" + num_workplace;
					// $("tr#tr-last-name").after("</tr>");
					// $("tr#tr-last-name").after("<td class='dynamically-insert-table table-value' id='" + id_work_name + "'>" 
											   // + (data.workplaces)[num_workplace].name + "</td>");
					// $("tr#tr-last-name").after("<td class='dynamically-insert-table' id='holder-wn" + num_workplace + "'>Work Place:</td>");
					// $("tr#tr-last-name").after("<tr class='dynamically-insert-table'>");
				}
				
				if (num_workplace == 0) { // insert an empty one
					// $("tr#tr-last-name").after("</tr>");
					// var id_work_addr = "work-addr" + num_workplace;
					// $("tr#tr-last-name").after("<td class='dynamically-insert-table table-value' id='" + id_work_addr + "'>" 
					// 						   + "N/A" + "</td>");
					// $("tr#tr-last-name").after("<td class='dynamically-insert-table' id='holder-wa" + num_workplace + "'>Work Address:</td>");
					// $("tr#tr-last-name").after("<tr class='dynamically-insert-table'>");
					// var id_work_name = "work-name" + num_workplace;
					// $("tr#tr-last-name").after("</tr>");
					// $("tr#tr-last-name").after("<td class='dynamically-insert-table table-value' id='" + id_work_name + "'>" 
											   // + "N/A" + "</td>");
					// $("tr#tr-last-name").after("<td class='dynamically-insert-table' id='holder-wn" + num_workplace + "'>Work Place:</td>");
					// $("tr#tr-last-name").after("<tr class='dynamically-insert-table'>");
				}
				
				$("td#td-admin-email").text(data.email);
				// $("td#td-admin-average-rating").text(data.rating);
				var ban_status = "";
				if (data.userStatus == 1) {
					ban_status = "Banned";
				} else if (data.userStatus == 0) {
					ban_status = "Unbanned";
				} else {

				}
				$("td#td-admin-user-status").text(ban_status);
				user_data_fetched = true;
				// console.log("User data fetched");
			}
		})
		.fail(function( jqXHR, textStatus ) {
			$("td.table-value").text("N/A");
		});
	}
}

// double click to enable editing
// double click again to disable editing
// to save data, press update
$("table#table-userinfo").on('dblclick', function() {
	if (edit_enable) {
		$('.edit-profile-input').remove();
		if (user_data_fetched) {
			// password can only be added directly
			$('#td-admin-pwd').hide();
			$('#holder-pwd').after("<input type='text' name='txtNewInput' id='input-pwd' class='edit-profile-input' placeholder='Enter new password'/>");
			
			var first_name = $('#td-admin-first-name').text();
			$('#td-admin-first-name').hide();
			$('#holder-fn').after("<input type='text' name='txtNewInput' id='input-fn' class='edit-profile-input' value = '" + first_name + "'/>");

			var middle_name = $('#td-admin-middle-name').text();
			$('#td-admin-middle-name').hide();
			$('#holder-mn').after("<input type='text' name='txtNewInput' id='input-mn' class='edit-profile-input' value = '" + middle_name + "'/>");

			var last_name = $('#td-admin-last-name').text();
			$('#td-admin-last-name').hide();
			$('#holder-ln').after("<input type='text' name='txtNewInput' id='input-ln' class='edit-profile-input' value = '" + last_name + "'/>");

			var email = $('#td-admin-email').text();
			$('#td-admin-email').hide();
			$('#holder-em').after("<input type='text' name='txtNewInput' id='input-em' class='edit-profile-input' value = '" + email + "'/>");
			
			
			var i;
			for (i = 0; i < num_workplace; i++) {
				var work_name = $('#work-name' + i + '').text();
				var work_addr = $('#work-addr' + i + '').text();
				$('#work-name' + i + '').hide();
				$('#work-addr' + i + '').hide();
				$('#holder-wn' + i + '').after("<input type='text' name='txtNewInput' id='input-wn" 
											   + i + "' class='edit-profile-input' value='" + work_name + "'/>");
				$('#holder-wa' + i + '').after("<input type='text' name='txtNewInput' id='input-wa" 
											   + i + "' class='edit-profile-input' value='" + work_addr + "'/>");
			}
		
			var user_status = 0;
			if ($('#td-admin-user-status').text() == "Banned") {
				user_status = 0;
			} else if ($('#td-admin-user-status').text() == "Unbanned") {
				user_status = 1;
			}
			$('#td-admin-user-status').hide();
			$('#holder-us').after("<input type='text' name='txtNewInput' id='input-us' class='edit-profile-input' value = '" + user_status + "'/>");
			edit_enable = false;

		}
	} else {
		$('.edit-profile-input').remove();
		$('.table-value').show();
		edit_enable = true;
	}
	
});

// update this user
// refetch the user data after delete
function update_user() {
	remove_dashitem_error();
    var userData = {
					originator: "a1",
					username: $("#adminSelectUser").val(),
					password: $("#input-pwd").val(),
					first_name: $("#input-fn").val(),
                    middle_name: $("#input-mn").val(),
                    last_name: $("#input-ln").val(),
                    email: $("#input-em").val(),
					userStatus: 0
                   };
	// count and add work places
	// var i;
	// for (i = 0; i < num_workplace; i++) {
	// 	var store = {};
	// 	store.address = $("#input-wa" + i).val();
	// 	store.name = $("#input-wn" + i).val();
	// 	userData.workplaces.push(store);
	// }
	
	if ($("#input-us").val() == 1) {
		userData.userStatus = 1;
	} else if ($("#input-us").val() == 0){
		userData.userStatus = 0;
	} else {
		$('#input-us').after("<span class='error_message'>Banned = 1, Unbanned = 0.</span>");
		return;
	}

    // what is going on here???
	if ( $("#td-admin-user-status").text())
	$('.edit-profile-input').remove();
	$('.table-value').show();
	edit_enable = true;
	console.log(userData);

    $.ajax({
        url: "/api/user/" + $("#adminSelectUser").val(),
        data: userData,
        method: 'POST',
    })
    .done(function (data) {   
        // TODO: show the data.reason message to the user view..
		console.log("User data updated?", data);
		// repopulate the table with new info
		select_user();
    })
	.fail(function( jqXHR, textStatus ) {
        console.log("textStatus", data);
        alert( "Request failed: " + textStatus );
    });
}



// delete a user given username
// refetch the user data after delete
function delete_user() {
	remove_dashitem_error();
	if ( $("#td-admin-user-status").text())
	$('.edit-profile-input').remove();
	$('.table-value').show();
	edit_enable = true;
	var entered_username = $("#adminSelectUser").val();
	if (check_user_empty(entered_username) == true) {
		return;
	} else {
		// var hashed_username = hash_fun(entered_username);
		$.ajax({
			url: "/api/user/" + entered_username,
			dataType: 'JSON',
			method: 'DELETE'
		})
		.done(function (data) {
			select_user();
			console.log("User data deleted");
		})
		.fail(function( jqXHR, textStatus ) {
			$('input#adminSelectUser').after("<span class='error_message'>Delete user failed.</span>");
		});
	}
}

// select the given user when the button is clicked
$('#adminSelect').on('click', function() {
	select_user();
});

// update the given user when the button is clicked
$("#adminUpdate").on('click', function() {
	if (!edit_enable) {
		update_user();
	}
});

// delete the given user when the button is clicked
$("#adminDelete").on('click', function() {
    if (confirm("⛔️ Warning: Are you sure you want to delete this user?")) {
        delete_user();
    } else {
        // cancel
    }
});

// user type can only be admin || worker || manager
function validate_user_type_admin() {
	var new_user_type = $('input#adminNewUserType').val();
	if ( new_user_type == "") {
		$('input#adminNewUserType').after("<span class='error_message'>Please provide a user type.</span>");
		return false;
	} else if (new_user_type != "admin" && new_user_type != "worker" && new_user_type != "manager") {
		$('input#adminNewUserType').after("<span class='error_message'>Please provide a valid user type.</span>");
		return false;
	}
	return true;
}

// check if the entered info is valid to create a new user
function validate_signup_admin() {
	var isValid = true;
	
	// Remove previous error messages, if they exist.
	remove_dashitem_error();
	
	// Deal with each field separately.
	var new_username = $('input#adminNewUser').val();
	if ( new_username == "") {
		$('input#adminNewUser').after("<span class='error_message'>Please provide a username.</span>");
		isValid = false;
	}
	var new_password = $('input#adminPassword').val();
	if ( new_password == "") {
		$('input#adminPassword').after("<span class='error_message'>Please provide a password.</span>");
		isValid = false;
	}
	
	var reenter_password = $('input#adminPasswordRepeat').val();
	if ( reenter_password == "") {
		$('input#adminPasswordRepeat').after("<span class='error_message'>Please repeat the previous password.</span>");
		isValid = false;
	} else if (new_password != $('input#adminPasswordRepeat').val()) {
		$('input#adminPasswordRepeat').after("<span class='error_message'>Password does not match.</span>");
		isValid = false;
	}  else if (!strong_password(new_password)) {
		isValid = false;
	}

	var new_email = $('input#adminEmail').val();

	if ( new_email == "") {
		$('input#adminEmail').after("<span class='error_message'>Please provide an email.</span>");
		isValid = false;
	} else {
		if (!new_email.match(EMAIL_FORMAT)) {
			$('input#adminEmail').after("<span class='error_message'>Please reenter a valid email address.</span>");
            isValid = false;
		}
	}
	if (!validate_user_type_admin()) {
		isValid = false;
	}
	return isValid;
}

// add a new user to the database
// details will be populated later
function add_user() {
	// TODO, will be replaced with input data
	var add_user_data =  {
		"type": $('input#adminNewUserType').val(),
		"originator": "a1",
		"username": $('input#adminNewUser').val(),
		"password": $('input#adminPassword').val(),
		// all left empty
		"firstName": "",
		"middleName": "",
		"lastName": "",
		"workplaces": [
			{
				"name": "", 
				"address": ""
			}
		],
		"email": $('input#adminEmail').val()
	}
	$.ajax({
        url: "/api/user/add/",
		dataType: 'JSON',
		data: add_user_data,
        method: 'POST'
    })
    .done(function (data) {
        // TODO
		$('input#adminEmail').after("<span class='error_message'>Adding user succeed.</span>");
    })
	.fail(function( jqXHR, textStatus ) {
		$('input#adminEmail').after("<span class='error_message'>Adding user failed.</span>");
    });
}

// admin add a new user
$("#adminAdd").on('click', function() {
	if (validate_signup_admin()) {
		add_user();
	}
});

// fetch and repopulate error messages
function fetch_message() {
    remove_dashitem_error();
	$(".error_full > td").remove();
	$(".error_full").remove();
    $.ajax({
        url: "/api/admin/errors/",
        dataType: 'JSON',
        method: 'GET'
    })
    .done(function (data) {
        var i;
		for (i = 0; i < (data.errors).length; i++) {
			var cur = (data.errors)[i];
			var error_message =  cur.timestamp + cur.errorstatus + cur.endpoint + cur.IP;
			$("#table-head-error").after("<tr class='error_full'>" + 
										 "<td>" + cur.timestamp + "</td>" +
										 "<td>" + cur.errorstatus + "</td>" +
										 "<td>" + cur.endpoint + "</td>" +
										 "<td>" + cur.IP + "</td>" +
										 "</tr>");
		}
        console.log("Error messages fetched");
    })
    .fail(function( jqXHR, textStatus ) {
        $("#table-error-log").after("<span class='error_message'>Error messages fetch failed.</span>");
    });

}

// fetch error messages when the button is clicked
$("#adminFetchMessage").on('click', function() {
	fetch_message();
});

// clear error monitoring message board
function clear_monitoring_message() {
	$("table#table-error-log > tbody > tr").not("#table-head-error").remove();
}

// remove error messages when the button is clicked
$("#adminClearMessage").on('click', function() {
	clear_monitoring_message();
});

// fetch database info when the button is clicked
function database_fetch() {
	remove_dashitem_error();
    $.ajax({
        url: "/api/data/analytics/?pasthours=24",
		dataType: 'JSON',
        method: 'GET',
    })
    .done(function (data) {
		$("#td-num-row").text(data.numRows);
		$("#td-num-user").text(data.numUser);
		// $("#td-num-query").text(data.numQuery);  // not doing this
    })
	.fail(function( jqXHR, textStatus ) {
		$('#adminInitialize').before("<span class='error_message'>Database info fetching failed.</span>");
    });
}

//initialize database when clicked
$("#adminDatabaseInfo").on('click', function() {
	database_fetch();
});

// initialize database
function database_initialize() {
    remove_dashitem_error();
    $.ajax({
        url: "/api/data/initialize/",
		dataType: 'JSON',
        method: 'DELETE',
    })
    .done(function (data) {
        if (data.status) {
			database_fetch();
		} else {
			$('#adminInitialize').before("<span class='error_message'>Database initialization failed.</span>");
		}
    })
	.fail(function( jqXHR, textStatus ) {
		$('#adminInitialize').before("<span class='error_message'>Database initialization failed.</span>");
    });
}


//initialize database when clicked
$("#adminInitialize").on('click', function() {
    if (confirm("⛔️ Warning: Are you sure you want to reset all data?")) {
        database_initialize();
    } else {
        // cancel
    }
});


// checked if the ip is valid
function validate_ip(entered_ip) {
	remove_dashitem_error();
	if (entered_ip == "") {
		// username can not be empty
		$('input#adminSelectIp').after("<span class='error_message'>IP address can not be empty.</span>");
		return false;
	} else if(entered_ip.match(IP_FORMAT)) {
		return true;
	}
	$('input#adminSelectIp').after("<span class='error_message'>IP address is not valid.</span>");
	return false;
}

// ban a given ip
function ban_ip() {
	var entered_ip = $("#adminSelectIp").val();
	if (validate_ip(entered_ip) == true) {

		// var hashed_ip = hash_fun(entered_ip);
		$.ajax({
			url: "/api/admin/userstatus?user=" + hashed_ip,
			dataType: 'JSON',
			method: 'DELETE',
		})
		.done(function (data) {
			// TODO
			console.log("User with such ip banned");
		})
		.fail(function( jqXHR, textStatus ) {
			$('input#adminSelectIp').after("<span class='error_message'>Ban user IP failed.</span>");
		});
		
	} else {
		return;
	}

}

// unban a given ip
function unban_ip() {
	var entered_ip = $("#adminSelectIp").val();
	if (validate_ip(entered_ip) == true) {

		// var hashed_ip = hash_fun(entered_ip);
		$.ajax({
			url: "/api/admin/userstatus?user=" + entered_ip,
			dataType: 'JSON',
			method: 'POST',
		})
		.done(function (data) {
			// TODO
			console.log("User with such ip unbanned");
		})
		.fail(function( jqXHR, textStatus ) {
			$('input#adminSelectIp').after("<span class='error_message'>Unban user IP failed.</span>");
		});
		
	} else {
		return;
	}
}

// ban the given ip when the button is clicked
$("#adminBanIP").on('click', function() {
    if (!$('#adminSelectIp').val()) {
        // empty input ==> do nothing.
        $('input#adminSelectIp').after("<span class='error_message'>IP address can not be empty.</span>");
    }
    else if (confirm("⛔️ Warning: Are you sure you want to ban this address?")) {
        ban_ip();
    } else {
        // cancel
    }
});

// unban the given ip when the button is clicked
$("#adminUnbanIP").on('click', function() {
	unban_ip();
});

$("button#admin-logout").on('click', function() {
	$.ajax({
		url: "/api/logout/",
		dataType: 'JSON',
		method: 'GET'
	})
	.always(function (data) {
		if(data.responseText.includes("<!DOCTYPE html>")){
			window.location = "/login";
		} else {
			alert('Logout fail:' + data.reason);
		}
	});
});