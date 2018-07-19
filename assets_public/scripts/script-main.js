'use strict';

//============================
//= Rendering functions
//============================

/** 
 * Rendering the user info part of the app, 
 * usually the left part of profile. 
 * Happens everytime a profile is viewd and at the start of app
 */
function render_user_personal_info(userId, edit) {
    var server_data = $.ajax({
        url: "/api/user/" + userId,
        method: "GET",
        dataType: 'application/json'
        })
        .always(function (data) {
            var json_data = JSON.parse(data.responseText);
            if (json_data.status){
                // for showing profile
                $('#submit_edit_td').remove();
                $('.profile_editers').hide();
                $('.profile_shows').show();

                // Guard in case no change. fuck
                if (json_data.firstName) {
                    console.log('Main Name changed to:', json_data.firstName);
                    $('#main-first-name').text(json_data.firstName);
                }
                if (json_data.middleName) {
                    $('#main-middle-name').text(json_data.middleName);
                }
                if (json_data.lastName) {
                    $('#main-last-name').text(json_data.lastName);
                }
                if (json_data.rating) {
                    $('#main-average-rating').text(json_data.rating);
                }
  
                
                // for editting profile
                // $('#profile-edit-first-name').attr("placeholder", json_data.firstName);
                // $('#profile-edit-middle-name').attr("placeholder", json_data.middleName);
                // $('#profile-edit-last-name').attr("placeholder", json_data.lastName);
                // $('#profile-edit-email').attr("placeholder", json_data.email);
                
                // Guard in case empty on signup.
                if (json_data.firstName) {
                    console.log('Name changed to:', json_data.firstName);
                    $('#profile-edit-first-name').attr("value", json_data.firstName);
                }
                if (json_data.middleName) {
                    $('#profile-edit-middle-name').attr("value", json_data.middleName);
                }
                if (json_data.lastName) {
                    $('#profile-edit-last-name').attr("value", json_data.lastName);
                }
                if (json_data.email) {
                    $('#profile-edit-email').attr("value", json_data.email);
                }
                
                for (var j in json_data.workplaces){
                    $('#main-workplace-info').empty();
                    var workplace = json_data.workplaces[j].name;
                    $('#main-workplace-info').append("<td class='td-work-info-entry'>Works at:</td>");
                    $('#main-workplace-info').append("<td class='td-work-name'>" + (workplace || 'search for work') + "</td>");
                    var address = json_data.workplaces[j].address;
                    $('#main-workplace-info').append("<td class='td-work-info-entry'>Location:</td>");
                    $('#main-workplace-info').append("<td class='td-address-name'>" + (address || 'search for work') + "</td>");  // incase null when sign up.
                }
                if(edit){ // if user is trying to edit
                    $('.profile_shows').hide();
                    $('.profile_editers').show();
                    $('#main-workplace-info').before("<td class='td-work-info-entry profile_editers' id='submit_edit_td'><button id='submit_edit_button'>Submit Change</button><button id='cancel_edit_button'>Cancel Change</button></td>");
                }
                
            } else{
                alert(json_data.reason);
            }
        });
}

/**
 * Rendering the user's history part of the app, 
 * usually the middle part of profile. 
 * Happens everytime a profile is viewd and at the start of app
 */
function render_user_history(userId){
    history_num = history_num + 10;
    var server_data = $.ajax({
        url: "/api/user/history/"+ userId + "?past=" + history_num,
        method: "GET",
        dataType: 'application/json'
    })
    .always(function(data){
        var json_data = JSON.parse(data.responseText);

        // console.log('Data for /api/user/history/: \n', JSON.stringify(JSON.parse(data.responseText), null, 2));
        
        if (json_data.status){
            $("#list-history-status").empty();
            for (var j in json_data.events){ // for each history there is
                var $work = $('<li/>', {
                    class: "work-block"
                });

                var $info_list = $('<aside/>', {
                });

                var formatted_type = '';
                var temp_type = json_data.events[j].type;
                if (temp_type === 'employ') {
                    formatted_type = 'You Were Employed!';
                } 
                else if (temp_type === 'feedback') {
                    formatted_type = 'Feedback Received';
                }
                else if (temp_type === 'accept') {
                    formatted_type = 'Someone Accepted a Shift';
                }
                else if (temp_type === 'post') {
                    formatted_type = 'New Shift Posted!';
                }

                var $status = $('<h4/>', {
                    text: formatted_type
                });

                var workplace = json_data.events[j].content.workplace;
                var $workplace = '';
                if (workplace) {
                    $workplace = $('<h5/>', {
                        text: workplace
                    });
                }

                var start = json_data.events[j].content.start;
                var $start = '';
                if (start) {
                    $start = $('<h5/>', {
                        text: "Shift Start: " + formatDate(start)
                    });
                }

                var end = json_data.events[j].content.end;
                var $end = '';
                if (end) {
                    $end = $('<h5/>', {
                        text: "Shift End: " + formatDate(end)
                    });
                }

                var timestamp = json_data.events[j].timestamp;
                var $timestamp = '';
                if (timestamp) {
                    $timestamp = $('<h5/>', {
                        text: "At: " + formatDate(timestamp)
                    });
                }

                var $giver = $('<h5/>', {
                    text: "Giver:"
                });

                var $giver_button = $('<a/>', {
                    class: "profile_button",
                    href: "#",
                    text: ' ' + json_data.events[j].content.poster.name,
                    name: json_data.events[j].content.poster.userId
                });

                var $taker = '';
                if(json_data.events[j].type != "post" && json_data.events[j].type != "employ"){
                    $taker = $('<h5/>', {
                        text: "Taker: "
                    });
                    var $taker_button = $('<a/>', {
                        class: "profile_button",
                        href: "#",
                        text: json_data.events[j].content.taker.name,
                        name: json_data.events[j].content.taker.userId
                    });

                    $taker.append($taker_button);
                }

                var $manager = '';
                if(json_data.events[j].type != "post"){
                    $manager = $('<h5/>', {
                        text: "Manager: "
                    });
                    var $manager_button = $('<a/>', {
                        class: "profile_button",
                        href: "#",
                        text: json_data.events[j].content.manager.name,
                        name: json_data.events[j].content.manager.userId
                    });
                    $manager.append($manager_button);
                }

                var $rating = '';
                if (json_data.events[j].content.rating) {
                    $rating = $('<h5/>', {
                        text: "Rating: " + json_data.events[j].content.rating
                    });
                }


                var $position = '';
                if (json_data.events[j].content.position) {
                    $position = $('<h5/>', {
                        text: "Position: " + json_data.events[j].content.position
                    });

                    if(json_data.events[j].type != "employ"){
                        $position.text = "Position: " + json_data.events[j].content.position
                    }
                }

                var $duration = '';
                if (json_data.events[j].content.duration != undefined) {
                    $duration = $('<h5/>', {
                        text: "Duration: " + (json_data.events[j].content.duration/3600000).toFixed(1) + "hr"
                    });    
                }
                
                var $comment = '';
                if (json_data.events[j].content.comment) {  // not empty comment
                    $comment = $('<h5/>', {
                        text: "Comment: " + json_data.events[j].content.comment
                    });
                }

                var description = json_data.events[j].content.description;
                var $description = '';
                if (description) {
                    $description = $('<h5/>', {
                        text: "Description: " + description
                    });
                }

                var incentive = json_data.events[j].content.incentive;
                var $incentive = '';
                if (incentive) {  // if exists, and not zero.
                    $incentive = $('<h5/>', {
                        class: "profile_incentive",
                        text: "Offering extra $" + incentive + " !"
                    });
                }
                

                // Styling (give it color)
                if (json_data.events[j].type == 'post'){
                    $work.css("background-color", "#AFEEEE");
                } else if (json_data.events[j].type == 'approved'){
                    $work.css("background-color", "#98FB98");
                } else if (json_data.events[j].type == 'employ'){
                    $work.css("background-color", "#D8BFD8");
                } else if (json_data.events[j].type == 'expired'){
                    $work.css("background-color", "#C48484");
                } else if (json_data.events[j].type == 'feedback' || json_data.events[j].type == 'done'){
                    $work.css("background-color", "#FFC550");
                } else if (json_data.events[j].type == 'rejected'){
                    $work.css("background-color", "#FFA07A");
                }

                $giver.append($giver_button);
                $info_list.append($status);
                $info_list.append($timestamp);
                $info_list.append($workplace);
                $info_list.append($position);
                $info_list.append($start);
                $info_list.append($end);
                $info_list.append($duration);
                $info_list.append($giver);
                $info_list.append($taker);
                $info_list.append($manager);
                $info_list.append($comment);
                $info_list.append($rating);
                $info_list.append($description);

                $info_list.append($incentive);  // this one always goes last.
                
                // if you are the manager and the work is done you can comment on it
                if(json_data.events[j].type == 'done' && window.userId == json_data.events[j].content.manager.userId){
                    var $comment_box = $('<textarea/>', {
                        class: "commenting_box",
                        placeholder: "Enter comment here..."
                    });

                    var $add_rating = $('<select/>', {
                        class: "rating_select",
                    });

                    var $rate5 = $('<option/>', {
                        value: "5",
                        text: "*****"
                    });
                    var $rate4 = $('<option/>', {
                        value: "4",
                        text: "****"
                    });
                    var $rate3 = $('<option/>', {
                        value: "3",
                        text: "***"
                    });
                    var $rate2 = $('<option/>', {
                        value: "2",
                        text: "**"
                    });
                    var $rate1 = $('<option/>', {
                        value: "1",
                        text: "*"
                    });

                    var $add_comment_button = $('<a/>', {
                        class: "add_comment_button",
                        href: "#",
                        text: "Add comment",
                        name: json_data.events[j].noid
                    });
                    
                    $add_rating.append($rate5);
                    $add_rating.append($rate4);
                    $add_rating.append($rate3);
                    $add_rating.append($rate2);
                    $add_rating.append($rate1);
                    $info_list.append($comment_box);
                    $info_list.append($add_rating);
                    $info_list.append($add_comment_button);
                }
                $work.append($info_list);
                // $work.append($show_button);
                // accept and permit types should not be posted
                if (json_data.events[j].type != 'accept' && json_data.events[j].type != 'permit'){
                    $("#list-history-status").append($work);   
                }
            }
        } else{
            alert(json_data.reason);
        }
    });
}

/** 
 * Rendering multiple part of the app 
 * to make the whole thing look logged in 
 * Happens at the start of app
 */
function render_mypage(userId){
    var server_data = $.ajax({
        url: "/api/user/" + userId,
        method: "GET",
        dataType: 'application/json'
    })
    .always(function(data){
        var json_data = JSON.parse(data.responseText);
        if (json_data.status){
            if (json_data.firstName != '' && json_data.firstName != null) {
                $('#page-title').text(json_data.firstName + "'s Shifter!");
            } else {
                $('#page-title').text("Shifter!");
            }
            
            $("#list-friends").empty(); // remove default message

            // Render friends
            for (var i in json_data.coworkers){
                var $friend_li = $('<li/>', {
                    class: "friendListElement list-online"
                });

                var $clickable = $('<a/>', {
                        class: "profile_button",
                        href: "#",
                        name: json_data.coworkers[i].userId
                });


                $friend_li.data("rating", json_data.coworkers[i].avgRate)
                $friend_li.data("taken", json_data.coworkers[i].shiftsTaken)
                $friend_li.data("name", (json_data.coworkers[i].firstName + json_data.coworkers[i].lastName).toLocaleLowerCase() )

                var $friend_name = $('<h5/>', {
                    text: json_data.coworkers[i].firstName + ' ' + json_data.coworkers[i].middleName + ' ' + json_data.coworkers[i].lastName,
                    class: "friendListElement"
                });

                // var $attributes = $('<h6/>', {
                //     text: json_data.coworkers[i].shiftsTaken + " shift(s). " + 
                //     "Rating: " + json_data.coworkers[i].avgRate
                // });

                // <h6>0 shift(s). Rating: None</h6>
                var $attributes = '<h6><span id="shiftsSorter">' + 
                        json_data.coworkers[i].shiftsTaken + 
                        '</span> shift(s). Rating: <span id="ratingSorter">' + 
                        json_data.coworkers[i].avgRate + '</span></h6>';

                var $workname = $('<h6/>', {
                    class: "friendListWork",
                    text: json_data.coworkers[i].workname
                });

                $clickable.append($friend_name);
                $clickable.append($workname);
                $clickable.append($attributes);
                $friend_li.append($clickable);
                $("#list-friends").append($friend_li);
            }
        } else{
            alert(json_data.reason);
        }
    });
}

/** 
 * Rendering the notification block 
 * Happens when user clicks notification button
 */
function render_notification(userId){
    var server_data = $.ajax({
        url: "/api/notification/" + userId + "?past=10",
        method: "GET",
        dataType: 'application/json'
    })
    .always(function(data){
        $('#notifBlock').empty();
        var json_data = JSON.parse(data.responseText);
        
        if(json_data.status){
            var $notif_ul = $('<ul/>', {
                id: "list-notifications",
                class: "notifElement"
            });
            for (var i in json_data.events){

                var $notif_li = $('<li/>', {
                    class: "notifElement notifLi"
                });

                var $notif_dot = $('<h2/>', {
                    text: ">",
                    class: "notifElement notifDot"
                });
                
                var $notif_section = $('<section/>', {
                    class: "notifElement notifSection"
                });
                
                // like facebook, different notification has different wordings
                if (json_data.events[i].type == "post") {
                    $notif_section.addClass(" postNotification");
                    $notif_dot.css('color','#0099FF');
                    var $poster_button = $('<a/>', {
                        class: "profile_button notifElement",
                        href: "#",
                        text: json_data.events[i].content.poster.name,
                        name: json_data.events[i].content.poster.userId
                    });

                    var $post_span = '';
                    if (json_data.events[i].content.duration) {
                        $post_span = $('<span/>', {
                            class: "notifElement",
                            text: " posted a shift on " + json_data.events[i].content.start + " for " + (json_data.events[i].content.duration/3600000).toFixed(1) + "hr"
                        });
                    }
                    
                    var $post_take_button = $('<button/>', {
                        class: "take_button buttonStyle notifElement",
                        text: "Take shift",
                        name: userId
                    });

                    $post_take_button.data("noid", json_data.events[i].noId);
                    $post_take_button.data("workplace", json_data.events[i].content.workplace);
                    var $time_tag = $('<span/>', {
                        class: "notifElement timestamp",
                        text: "Posted at: " +  formatDate(json_data.events[i].timestamp.toLocaleString())
                    });

                    $notif_section.append($post_take_button);
                    $notif_section.append($poster_button);
                    $notif_section.append($post_span);
                    $notif_section.append($time_tag);
                    

                } else if (json_data.events[i].type == "accept") {
                    $notif_dot.css('color','#32DF00');
                    var $taker_button = $('<a/>', {
                        class: "profile_button notifElement",
                        href: "#",
                        text: json_data.events[i].content.taker.name,
                        name: json_data.events[i].content.taker.userId
                    });

                    var $accept_span = $('<span/>', {
                        class: "notifElement",
                        text: " is trying to accept a shift from "
                    });

                    var $poster_button = $('<a/>', {
                        class: "profile_button notifElement",
                        href: "#",
                        text: json_data.events[i].content.poster.name,
                        name: json_data.events[i].content.poster.userId
                    });

                    var $approve_button = $('<button/>', {
                        class: "approve_button buttonStyle notifElement",
                        text: "Approve",
                        name: userId
                    });
                    $approve_button.data('noid', json_data.events[i].noId);

                    var $decline_button = $('<button/>', {
                        class: "decline_button buttonStyle notifElement",
                        text: "Decline",
                        name: userId,
                        noid: json_data.events[i].noId
                    });

                    var $time_tag = $('<span/>', {
                        class: "notifElement timestamp",
                        text: "Posted at: " +  formatDate(json_data.events[i].timestamp.toLocaleString()),
                    });

                    $notif_section.append($approve_button);
                    $notif_section.append($decline_button);
                    $notif_section.append($taker_button);
                    $notif_section.append($accept_span);
                    $notif_section.append($poster_button);
                    $notif_section.append($time_tag);

                }

                else if (json_data.events[i].type == "approved" || json_data.events[i].type == "done"){
                    $notif_dot.css('color','#F7DE00');
                    var $manager_button = $('<a/>', {
                        class: "profile_button notifElement",
                        href: "#",
                        text: json_data.events[i].content.manager.name,
                        name: json_data.events[i].content.manager.userId
                    });

                    var $post_span_1 = $('<span/>', {
                        class: "notifElement",
                        text: " approved a shift from "
                    });

                    var $poster_button = $('<a/>', {
                        class: "profile_button notifElement",
                        href: "#",
                        text: json_data.events[i].content.poster.name,
                        name: json_data.events[i].content.poster.userId
                    });

                    var $post_span_2 = $('<span/>', {
                        class: "profile_button notifElement",
                        text: " to ",
                    });

                    var $taker_button = $('<a/>', {
                        class: "profile_button notifElement",
                        href: "#",
                        text: json_data.events[i].content.taker.name,
                        name: json_data.events[i].content.taker.userId
                    });   

                    var $time_tag = $('<span/>', {
                        class: "notifElement timestamp",
                        text: "Posted at: " +  formatDate(json_data.events[i].timestamp.toLocaleString()),
                    });

                    $notif_section.append($manager_button);
                    $notif_section.append($post_span_1);
                    $notif_section.append($poster_button);
                    $notif_section.append($post_span_2);
                    $notif_section.append($taker_button);
                    $notif_section.append($time_tag);
                }

                else if (json_data.events[i].type = "feedback"){
                    $notif_dot.css('color','#FF800D');
                    var $manager_button = $('<a/>', {
                        class: "profile_button notifElement",
                        href: "#",
                        text: json_data.events[i].content.manager.name,
                        name: json_data.events[i].content.manager.userId
                    });

                    var $post_span_1 = $('<span/>', {
                        class: "notifElement",
                        text: " gave a comment for the shift "
                    });

                    var $poster_button = $('<a/>', {
                        class: "profile_button notifElement",
                        href: "#",
                        text: json_data.events[i].content.poster.name,
                        name: json_data.events[i].content.poster.userId
                    });

                    var $post_span_2 = $('<span/>', {
                        class: " notifElement",
                        text: " worked for ",
                    });

                    var $taker_button = $('<a/>', {
                        class: "profile_button notifElement",
                        href: "#",
                        text: json_data.events[i].content.poster.name,
                        name: json_data.events[i].content.poster.userId
                        // Should have been using taker here
                        // using taker somehow can't render for some weird reason
                        // json_data.events[i].content.taker.name is in the json when
                        // I console.log it out. but when this turns into taker the whole 
                        // javascript crashes.
                        // but taker works in other places. REALLY WEIRD
                    });   

                    var $time_tag = $('<span/>', {
                        class: "notifElement timestamp",
                        text: "Posted at: " +  json_data.events[i].timestamp.toLocaleString(),
                    });

                    $notif_section.append($manager_button);
                    $notif_section.append($post_span_1);
                    $notif_section.append($taker_button);
                    $notif_section.append($post_span_2);
                    $notif_section.append($poster_button);
                    $notif_section.append($time_tag);
                } else if (json_data.events[i].type = "employ"){
                    $notif_dot.css('color','#872187');
                    var $manager_button = $('<a/>', {
                        class: "profile_button notifElement",
                        href: "#",
                        text: json_data.events[i].content.manager.name,
                        name: json_data.events[i].content.manager.userId
                    });

                    var $post_span_1 = $('<span/>', {
                        class: "notifElement",
                        text: " employed you to " + json_data.events[i].content.workplace
                    });

                    var $time_tag = $('<span/>', {
                        class: "notifElement timestamp",
                        text: "Posted at: " +  json_data.events[i].timestamp.toLocaleString(),
                    });

                    $notif_section.append($manager_button);
                    $notif_section.append($post_span_1);
                } else if (json_data.events[i].type = "permit"){
                    $notif_dot.css('color','#872187');
                    var $manager_button = $('<a/>', {
                        class: "profile_button notifElement",
                        href: "#",
                        text: json_data.events[i].content.poster.name,
                        name: json_data.events[i].content.poster.userId
                    });

                    var $post_span_1 = $('<span/>', {
                        class: "notifElement",
                        text: " is trying to access " + json_data.events[i].content.workplace
                    });

                    var $time_tag = $('<span/>', {
                        class: "notifElement timestamp",
                        text: "Posted at: " +  json_data.events[i].timestamp.toLocaleString(),
                    });

                    $notif_section.append($manager_button);
                    $notif_section.append($post_span_1);
                }

                $notif_li.append($notif_dot);
                $notif_li.append($notif_section);
                $notif_ul.append($notif_li); 
            }
            $("#notifBlock").append($notif_ul);
        } else {
            alert(json_data.reason);
        }
    });
}

/**
 * Rendering the search block 
 * Happens when user typein search bar
 */
function render_search(userId){
    var searchValue = $("#searchQuery").val();
    if (searchValue.trim() === '') {  // Guard against searching nothing.
        return;
    }

    if ($('#searchOpt').val() == 'person'){
        var server_data = $.ajax({
            url: "/api/search/user/" + encodeURI(searchValue),
            method: "GET",
            dataType: 'application/json'
        })
        .always(function(data){
            $('#searchResult').empty();
            var json_data = JSON.parse(data.responseText);
            if (json_data.status){
                for (var i in json_data.results){
                    var $people = $('<article/>', {
                        class: "searchElement search_person",
                    });

                    var $clickable = $('<a/>', {
                        class: "profile_button",
                        href: "#",
                        text: json_data.results[i].name,
                        name: json_data.results[i].userId
                    });

                    var worksAt = json_data.results[i].worksAt;
                    for (var j in worksAt) {
                        if (worksAt[j] != null) {
                            $clickable.append('<section>' + worksAt[j] + '</section>');
                        }
                    }

                    $people.append($clickable);

                    $('#searchResult').append($people);
                }
            }
        });
    } else {
        var server_data = $.ajax({
            url: "/api/search/work/" + encodeURI(searchValue),
            method: "GET",
            dataType: 'application/json'
        })
        .always(function(data){
            $('#searchResult').empty();
            var json_data = JSON.parse(data.responseText);
            if (json_data.status){
                for (var i in json_data.results){
                    var $workplace = $('<article/>', {
                        class: "searchElement search_store",
                    });

                    var $clickable = $('<a/>', {
                        class: "company_button",
                        href: "#",
                        text: json_data.results[i].name,
                        name: json_data.results[i].name
                    });

                    window.data_positions = json_data.results[i].positions;
                    
                    $clickable.append('<section class="workAddressResults">' + json_data.results[i].address + '</section>');

                    $workplace.append($clickable);

                    $('#searchResult').append($workplace);
                }
            }
        });    
    }
}



//============================
//= System functions (click reaction to buttons)
//============================

/**
 * Format date element into something more readable
 * Not using addons to format date since we only need 1 format
 */
function formatDate(date_string) {
    var date_obj = new Date(date_string);
    // console.log('before:', date_string, ', after:', date_obj);
    return date_obj.toLocaleDateString() + ', ' + date_obj.toLocaleTimeString(); 
}

/**
 * Call the right render functions to view someone's profile
 * Happens when user click on a profile button
 */
function profile_button_click(){
    var userId = this.getAttribute("name");
    window.history_num = 0;  // ?
    render_user_personal_info(userId, false);
    render_user_history(userId);
}

/**
 * Nope not included yet
 */
function message_button_click(){
    alert('TA: \nThis feature was _OMITTED_ from our team requirement by instructor.');
}

/**
 * Call the right render functions to view notifications
 * Happens when user click on a notification button
 */
function notification_click(e){
    e.preventDefault();
    $('#notifBlock').toggle();
    render_notification(window.userId);
}

/**
 * Send a post to server that user wants to take a job
 * Happens when user click on a notification button
 */
function take_button_click(){
    var jsonObj = new Object();
    jsonObj.userId = window.userId;
    jsonObj.workplace = $(this).data('workplace');
    jsonObj.noId = $(this).data('noid');
    
    
    $.ajax({
        url : "/api/shift/accept/",
        type: "POST",
        dataType: 'application/json',
        data: jsonObj,
        success: function(data, textStatus, jqXHR)
        {
            var json_data = JSON.parse(data.responseText);
            if(json_data.status){
                alert("Successfully take job");
            } else {
                alert("Request Fail: " + reason);
            }
            
        },
        error: function (data, textStatus, errorThrown)
        {
            var json_data = JSON.parse(data.responseText);
            if(json_data.status == 0 || json_data.status >= 400){
                alert("Request Fail: " + json_data.reason + " reference error num: " + json_data.status);
            } else {
                alert("Successfully take job");
            }
        }
    });
}

/**
 * Send a post to server that user(manager) wants to approve a job
 * Happens when user click on a notification button
 */
function approve_button_click(){
    var jsonObj = new Object();
    jsonObj.userId = window.userId;
    jsonObj.approve = "approve";
    jsonObj.noId = $(this).data('noid');
    
    
    $.ajax({
        url : "/api/shift/permit/",
        type: "POST",
        dataType: 'application/json',
        data: jsonObj,
        success: function(data, textStatus, jqXHR)
        {
            var json_data = JSON.parse(data.responseText);
            if(json_data.status){
                alert("Successfully approve job");
            } else {
                alert("Request Fail: " + reason);
            }
            
        },
        error: function (data, textStatus, errorThrown)
        {
            var json_data = JSON.parse(data.responseText);
            if(json_data.status == 0 || json_data.status >= 400){
                alert("Request Fail: " + json_data.reason + " reference error num: " + json_data.status);
            } else {
                alert("Successfully approve job");
            }
        }
    });
    
}

/**
 * Send a post to server that user(manager) wants to disapprove a job
 * Happens when user click on a notification button
 */
function decline_button_click(){
    var jsonObj = new Object();
    jsonObj.userId = window.userId;
    jsonObj.approve = "decline";
    jsonObj.noId = $(this).data('noid');
    
    $.ajax({
        url : "/api/shift/permit/",
        type: "POST",
        dataType: 'application/json',
        data: jsonObj,
        success: function(data, textStatus, jqXHR)
        {
            var json_data = JSON.parse(data.responseText);
            if(json_data.status){
                alert("Successfully decline job");
            } else {
                alert("Request Fail:1 " + reason);
            }
            
        },
        error: function (data, textStatus, errorThrown)
        {
            var json_data = JSON.parse(data.responseText);
            if(json_data.status == 0 || json_data.status >= 400){
                alert("Request Fail: " + json_data.reason + " reference error num: " + json_data.status);
            } else {
                alert("Successfully decline job");
            }
        }
    });  
}

/**
 * Send a post to server that user(manager) wants to disapprove a job
 * Happens when user click on a notification button
 */
function permit_button_click(){
    var jsonObj = new Object();
    jsonObj.userId = window.userId;
    jsonObj.approve = "decline";
    jsonObj.noId = $(this).data('noid');
    
    $.ajax({
        url : "/api/shift/permit/",
        type: "POST",
        dataType: 'application/json',
        data: jsonObj,
        success: function(data, textStatus, jqXHR)
        {
            var json_data = JSON.parse(data.responseText);
            if(json_data.status){
                alert("Successfully decline job");
            } else {
                alert("Request Fail:1 " + reason);
            }
            
        },
        error: function (data, textStatus, errorThrown)
        {
            var json_data = JSON.parse(data.responseText);
            if(json_data.status == 0 || json_data.status >= 400){
                alert("Request Fail: " + json_data.reason + " reference error num: " + json_data.status);
            } else {
                alert("Successfully decline job");
            }
        }
    });  
}

/**
 * Call the right functions to view search box
 * Happens when user click on a search bar
 */
function search_click(){
    $('#searchResult').css("display","block");
}

/**
 * Call the right functions to render search box
 * Happens when user type in search bar
 */
function search_change(){
    render_search(window.userId);
}

/**
 * Sort the friends list
 * Happens when user change sort type
 REDUNDANT FUNCTION. look elsewhere.
 */
// function friends_sort_change(){
//     if ($('#sortFriendsOpt').val() == 'name'){
//         $('#searchResult').children().sort(compare_by_name);
//     } else if ($('#sortFriendsOpt').val() == 'jobs'){
//         $('#searchResult').children().sort(compare_by_take);
//     } else if ($('#sortFriendsOpt').val() == 'rate'){
//         $('#searchResult').children().sort(compare_by_rating);
//     }
// }
   
/**
 * Make new form for new posting
 * Happens when user wants to make new post
 */
function appendShifter(e) {
    e.preventDefault();
    $('#shifterModal').addClass('showShifter');
}

/**
 * Posting form related
 */
function closeModal() {
    $('#shifterModal').removeClass('showShifter');
}
  
/**
 * Posting form related
 */
function shiftCancel() {
    document.getElementById("shiftForm").reset();
    closeModal();
}

/**
 * Posting form related
 */
function shiftCreate(e) {
    e.preventDefault();
    var jsonObj = new Object();
    
    var start = $('#shiftStartDate').val() + ' ' + $('#shiftStartTime').val();
    
    var end = $('#shiftStartDate').val() + ' ' + $('#shiftStartTime').val();

    $('#shifterErrorMessage').text('');
    if (!start.trim() || !end.trim() || !$('#shiftPlace').val() || !$('#shiftPosition').val()) {
        // set user error message.
        $('#shifterErrorMessage').text('Missing values.');
        return; // guard.
    }
    
    jsonObj.userId = window.userId;
    jsonObj.workplace = $('#shiftPlace').val();
    jsonObj.position = $('#shiftPosition').val();
    jsonObj.startTime = new Date(start);
    jsonObj.endTime = new Date(end);
    jsonObj.description = $('#shiftDescription').val();
    jsonObj.incentive = $('#shiftIncentive').val();


    $.ajax({
        url : "/api/shift/new/",
        type: "POST",
        dataType: 'application/json',
        data: jsonObj,
        success: function(data, textStatus, jqXHR) {
            var json_data = JSON.parse(data.responseText);
            if(json_data.status){
                alert("Successfully created shift.");
                document.getElementById("shiftForm").reset();
                closeModal();
            } else {
                alert("Request Failed: " + reason);
            }
        },
        error: function (data, textStatus, errorThrown) {
            // console.log(data, textStatus, errorThrown);
            var json_data = JSON.parse(data.responseText);
            if (json_data.status == 0 || json_data.status >= 400){
                alert("Request Fail: " + json_data.reason + " reference error num: " + json_data.status);
            } else {
                alert("Successfully created shift!");
                document.getElementById("shiftForm").reset();
                closeModal();
            }
        } 
    });
    
    
}

/**
 * Turn profile info section into a semi form for user to edit
 */
function start_edit_profile(){
    render_user_history(window.userId);
    render_user_personal_info(window.userId, true); 
}

/**
 * Send form to server
 */
function send_edit_personal_info(){
    
    var jsonObj = new Object();
    jsonObj.originator = window.userId;
    jsonObj.username = window.userId;
    jsonObj.firstName = $('#profile-edit-first-name').val();
    jsonObj.middleName = $('#profile-edit-middle-name').val();
    jsonObj.lastName = $('#profile-edit-last-name').val();
    jsonObj.email = $('#profile-edit-email').val();

    // Put in in the page too.
    $('#profile-edit-first-name').parent().prev('.profile_shows').text(jsonObj.firstName);
    $('#profile-edit-middle-name').parent().prev('.profile_shows').text(jsonObj.middleName);
    $('#profile-edit-last-name').parent().prev('.profile_shows').text(jsonObj.lastName);
    $('#profile-edit-email').parent().prev('.profile_shows').text(jsonObj.email);


    $.ajax({
        url : "/api/user/" + window.userId,
        type: "POST",
        dataType: 'application/json',
        data: jsonObj,

        success: function(data, textStatus, jqXHR) {
            var json_data = JSON.parse(data.responseText);
            // console.log(json_data);
            if (json_data.status){
                alert("Successfully edit info");
            } else {  // bad practice
                alert("Request Fail:1 " + reason);
            }
            
        },
        error: function (data, textStatus, errorThrown) {
            var json_data = JSON.parse(data.responseText);
            // console.log('error,', json_data);
            if(json_data.status == 0 || json_data.status >= 400){
                alert("Request Fail: " + json_data.reason + " reference error num: " + json_data.status);
            } else {  // bad practice
                alert("Successfully edit info");
            }
        }
    });
    
    render_user_personal_info(window.userId, false);
}


function comment_button_click(){
    
    var jsonObj = new Object();
    jsonObj.comment = $(this).parent.children('.commenting_box').val();
    jsonObj.rating = $(this).parent.children('.rating_select').val();
    jsonObj.lastName = $(this).attr('name');
    $.ajax({
        url : "/api/shift/comment/",
        type: "POST",
        dataType: 'application/json',
        data: jsonObj,
        success: function(data, textStatus, jqXHR)
        {
            var json_data = JSON.parse(data.responseText);
            if(json_data.status){
                alert("Successfully edit info");
            } else {
                alert("Request Fail:1 " + reason);
            }
            
        },
        error: function (data, textStatus, errorThrown)
        {
            var json_data = JSON.parse(data.responseText);
            if(json_data.status == 0 || json_data.status >= 400){
                alert("Request Fail: " + json_data.reason + " reference error num: " + json_data.status);
            } else {
                alert("Successfully edit info");
            }
        }
    });
    
    render_user_personal_info(window.userId, false);
}

/**
 * Cancel the form
 */
function cancel_edit_profile(){
    render_user_personal_info(window.userId, false);
}

/**
 * Send a request to server that user is trying to access a store
 */
function company_button_click(){
    $('#position_choice').empty();
    for (var i in window.data_positions){
        var $opt = $('<option/>', {
            text: window.data_positions[i],
            val: window.data_positions[i]
        });
        $('#position_choice').append($opt);
    }
    $('#apply_choice_button').attr('name',$(this).attr('name'));
    $('#applyToStoreName').text($(this).attr('name'));
    $('#sec_app_position').css("display","block");
}

/**
 * Send a request to server that user is trying to access a store
 */
function apply_choice_button_click(){
        var jsonObj = new Object();
        jsonObj.workname = $(this).attr('name');
        jsonObj.position = $('#position_choice').val();
        jsonObj.userId = window.userId;

        // var successMssg = "Successfully applied to be a " + jsonObj.position + 
        //                 " at " + jsonObj.workname + ".";

        var successMssg = "Successfully applied to: " + jsonObj.workname + "."

        $.ajax({
            url : "/api/work/add/",
            type: "POST",
            dataType: 'application/json',
            data: jsonObj,
            success: function(data, textStatus, jqXHR) {
                var json_data = JSON.parse(data.responseText);
                if(json_data.status){
                    alert(successMssg);
                } else {
                    alert("Request Fail:1 " + reason);
                }

            },
            error: function (data, textStatus, errorThrown) {
                var json_data = JSON.parse(data.responseText);
                if(json_data.status == 0 || json_data.status >= 400){
                    alert("Request Fail: " + json_data.reason + " reference error num: " + json_data.status);
                } else {
                    alert(successMssg);
                }
            }
        });
    $('#sec_app_position').css("display","none");
}

function apply_cancel_button_click(){
    $('#sec_app_position').css("display","none");
}


// ===============================
// = Sort (compare) functions
// ===============================
/* 3 compare function to sort friends differently*/

function compare_by_name(a, b) {
    var aVal = $(a).find('h5').text();
    var bVal = $(b).find('h5').text();
    if (aVal < bVal) return -1;
    if (aVal > bVal) return 1;
    return 0;
};

function compare_by_rating(a, b) {
    var aVal = $(a).find('#ratingSorter').text();
    aVal = (aVal === 'None') ? 0 : aVal;  // "None" counts as zero.
    var bVal = $(b).find('#ratingSorter').text();
    bVal = (bVal === 'None') ? 0 : bVal;
    return parseFloat(bVal) - parseFloat(aVal);
};

function compare_by_take(a, b) {
    var aVal = $(a).find('#shiftsSorter').text();
    var bVal = $(b).find('#shiftsSorter').text();
    return parseFloat(bVal) - parseFloat(aVal);
};



/**
 * 
 */
function sort_friends(){
    if ($('#sortFriendsOpt').val() == 'name'){
        var newSortedList = $('#list-friends').children().sort(compare_by_name);
        $('#list-friends').empty().append(newSortedList);
    } else if ($('#sortFriendsOpt').val() == 'rate'){
        var newSortedList = $('#list-friends').children().sort(compare_by_rating);
        $('#list-friends').empty().append(newSortedList);
    } else if ($('#sortFriendsOpt').val() == 'jobs'){
        var newSortedList = $('#list-friends').children().sort(compare_by_take);
        $('#list-friends').empty().append(newSortedList);
    }
}




/**
 * Show more info on that specific post
 */
// function show_more_button_click(){
//     if($(this).parent().hasClass('show_second')){
//         $(this).parent().removeClass('show_second');
//     } else {
//         $(this).parent().addClass('show_second');   
//     }
// }

/**
 * logout
 */
function logout(){
    var server_data = $.ajax({
    url: "/api/logout/",
    method: "GET",
    dataType: 'text/plain'
    })
    .always(function (data) {
        if (data.responseText.includes("<!DOCTYPE html>")){
            window.location = "/login";
        } else {
            alert('Logout fail:' + JSON.parse(data.responseText).reason);
        }
    });
}


function getCookie(name) {
    var value = "; " + document.cookie;
    var parts = value.split("; " + name + "=");
    if (parts.length == 2) return parts.pop().split(";").shift();
}
//============================
//= Main functions
//============================

$(window).ready(setup);
                                     
function setup() {
    window.history_num = 0;
    window.userId = getCookie("userId"); // userID is passed by cookie
    render_mypage(userId);
    render_user_personal_info(userId, false);
    render_user_history(userId);
}

function getCookie(name) {
  var value = "; " + document.cookie;
  var parts = value.split("; " + name + "=");
  if (parts.length == 2) return parts.pop().split(";").shift();
}

// ==============================
// = Button clicks
// ==============================
    
// profile buttons
$('body').on('click', '.profile_button', profile_button_click);
$('body').on('click', '#start_edit_button', start_edit_profile);
$('body').on('click', '#submit_edit_button', send_edit_personal_info);
$('body').on('click', '#cancel_edit_button', cancel_edit_profile);

// notifications
$('body').on('click', '#notification', notification_click);
$('body').on('click', '.take_button', take_button_click);
$('body').on('click', '.approve_button', approve_button_click);
$('body').on('click', '.decline_button', decline_button_click);
$('body').on('click', '.permit_button', permit_button_click);
$('body').on('click', '#mainApp:not(.notifElement)', function(){
    $('#notifBlock').css("display","none");
});
$('body').on('change', '#sortFriendsOpt', sort_friends);

// search
$('body').on('click', '#searchQuery', search_click);
$('body').on('change', '#searchOpt', search_change);
$('body').on('change keyup paste', '#searchQuery', search_change);
$('body').on('click', '.company_button', company_button_click);
$('body').on('click', '#apply_choice_button', apply_choice_button_click);
$('body').on('click', '#apply_cancel_button', apply_cancel_button_click);
// history
// $('body').on('click', '.show_button', show_more_button_click);
$('body').on('click', '.add_comment_button', comment_button_click);

$('body').on('click', '#mainApp:not(.searchElement)', function(){
    $('#searchResult').css("display","none");
});

$('body').on('click', '#logout_button', logout);

$('body').on('click', '#message', message_button_click);

// Shifter Modal
$('body').on('click', '#shifter', appendShifter);
$('body').on('click', '#shiftCancel', shiftCancel);
$('body').on('click', '#shiftCreate', shiftCreate);

    
// ==============================
// = Key Presses
// ==============================

$(document).keyup(function(e) {
     if (e.keyCode == 27) { // escape key maps to keycode `27`
        // Hide any of these that were open:
        $('#notifBlock').hide();
        $('#searchResult').hide();
        $('#shifterModal').removeClass('showShifter');
    }
});
