DROP SCHEMA IF EXISTS shifter CASCADE;
CREATE SCHEMA shifter;
SET SEARCH_PATH TO shifter;


DROP TABLE IF EXISTS Users CASCADE;
CREATE TABLE Users (
    uID bigserial PRIMARY KEY   -- our own incremented thing, used internally.
    ,email varchar(64) NOT NULL  -- reality is most are length < 40.
    ,username varchar(64) NOT NULL  -- not used much on server. just login.
    ,firstname varchar(32)  -- on signup, they dont need these names.
    ,middlename varchar(32)
    ,lastname varchar(32)
);

DROP TABLE IF EXISTS Admin CASCADE;
CREATE TABLE Admin (
    uID bigint PRIMARY KEY REFERENCES Users(uID) ON DELETE CASCADE ON UPDATE CASCADE
);

DROP TABLE IF EXISTS Login CASCADE;
CREATE TABLE Login (
    uID bigint PRIMARY KEY REFERENCES Users(uID) ON DELETE CASCADE ON UPDATE CASCADE  -- todo: make UUID or something robust.
    ,passHash varchar(64) NOT NULL  -- Store SHA Hashed for Security!!
);

DROP TABLE IF EXISTS Ban CASCADE;
CREATE TABLE Ban (
    uID bigint NOT NULL PRIMARY KEY REFERENCES Users(uID) ON DELETE CASCADE ON UPDATE CASCADE
);

-- used to track their 2-factor auth, and protect against brute-forcing authCode
-- delete user from this table once authenticated.
DROP TABLE IF EXISTS Unauth CASCADE;
CREATE TABLE Unauth (
    uID bigint PRIMARY KEY REFERENCES Users(uID) ON DELETE CASCADE ON UPDATE CASCADE
    ,authCode varchar(8) NOT NULL
    ,numGuesses int NOT NULL
);

DROP TABLE IF EXISTS Friends CASCADE;
CREATE TABLE Friends (
    uID bigint NOT NULL REFERENCES Users(uID) ON DELETE CASCADE ON UPDATE CASCADE
    ,friendID bigint NOT NULL REFERENCES Users(uID) ON DELETE CASCADE ON UPDATE CASCADE
    ,PRIMARY KEY(uID, friendId)
);

DROP TABLE IF EXISTS WorkLocation CASCADE;
CREATE TABLE WorkLocation (
    workName varchar(64) PRIMARY KEY  -- unique
    ,address varchar(64) NOT NULL
    ,city varchar(32) NOT NULL
    ,region varchar(32) NOT NULL
    ,postzip varchar(12) NOT NULL
    ,country varchar(32) NOT NULL
);

DROP TABLE IF EXISTS Job CASCADE;
CREATE TABLE Job (
    jobID bigint UNIQUE NOT NULL
    ,workName varchar(64) NOT NULL REFERENCES WorkLocation(workName) ON DELETE CASCADE ON UPDATE CASCADE
    ,position varchar(32) NOT NULL
    ,PRIMARY KEY(workName, position)
);

-- DROP TABLE IF EXISTS Manages CASCADE;
-- CREATE TABLE Manages (  -- i.e. not a worker.
--     managerID bigint NOT NULL REFERENCES Users(uID)
--     ,workName varchar(64) NOT NULL REFERENCES WorkLocation(workName)
--     ,PRIMARY KEY(managerID, workName)
-- );

DROP TABLE IF EXISTS Employee CASCADE;
CREATE TABLE Employee (  -- i.e. worker/manager.
    uID bigint NOT NULL REFERENCES Users(uID) ON DELETE CASCADE ON UPDATE CASCADE
    ,jobID bigint NOT NULL REFERENCES Job(jobID) ON DELETE CASCADE ON UPDATE CASCADE
    ,PRIMARY KEY(uID, jobID)
);

-- =============================================================================
-- Events ======================================================================

-- store all 'types' of history in the following tables, to build the different history json blobs to send to client. 
-- many things added when shifts are created.
-- many events/activities from apply/shift trigger entries to be added here.
-- dont add here if user banned.
-- TODO: Datatype for eventID: sequence generators, which are only unique within a single database. maybe use UUID type: http://stackoverflow.com/a/31248013/2352401
DROP TABLE IF EXISTS Events CASCADE;
CREATE TABLE Events (
    eventID bigint PRIMARY KEY
);

-- Note: some 'type' codes are irrelevant to certain Notify/History items.
CREATE TYPE eventTypeValues AS ENUM('post', 'approve', 'accept', 'employ', 'feedback', 'permit', 'expired', 'done', 'rejected');

DROP TABLE IF EXISTS EventType CASCADE;
CREATE TABLE EventType (
    eventTypeID bigint PRIMARY KEY
    ,eventID bigint NOT NULL REFERENCES Events(eventID) ON DELETE CASCADE ON UPDATE CASCADE
    ,type eventTypeValues NOT NULL
    ,tstamp timestamp NOT NULL
);

-- eventTypeID := we need to add the 'type' information for History/Notify events.
-- note that admin gets delivered if no manager for 'permit'/apply to work at a workplace.
DROP TABLE IF EXISTS History CASCADE;
CREATE TABLE History (
    eventTypeID bigint NOT NULL REFERENCES EventType(eventTypeID) ON DELETE CASCADE ON UPDATE CASCADE
    ,deliverID bigint NOT NULL REFERENCES Users(uID) ON DELETE CASCADE ON UPDATE CASCADE -- who gets history.
    ,PRIMARY KEY(eventTypeID, deliverID)
);

-- delete items from this table once seen.
DROP TABLE IF EXISTS Notify CASCADE;
CREATE TABLE Notify (
    eventTypeID bigint NOT NULL REFERENCES EventType(eventTypeID) ON DELETE CASCADE ON UPDATE CASCADE
    ,deliverID bigint NOT NULL REFERENCES Users(uID) ON DELETE CASCADE ON UPDATE CASCADE -- who gets notified.
    ,PRIMARY KEY(eventTypeID, deliverID)
);

-- (employ) add workplace approved/rejected.
-- (accept) notification to users about shift transfer accepted by manager. dont remove from Apply because this stays in history.
-- in Apply && event seen by manager <==> "rejected" <==> not 'employ' in EventType
DROP TABLE IF EXISTS Apply CASCADE;
CREATE TABLE Apply (
    eventID bigint PRIMARY KEY REFERENCES Events(eventID) ON DELETE CASCADE ON UPDATE CASCADE
    ,uID bigint NOT NULL REFERENCES Users(uID) ON DELETE CASCADE ON UPDATE CASCADE
    ,jobID bigint NOT NULL REFERENCES Job(jobID) ON DELETE CASCADE ON UPDATE CASCADE
);

DROP TABLE IF EXISTS Shift CASCADE;
CREATE TABLE Shift (
    eventID bigint PRIMARY KEY REFERENCES Events(eventID) ON DELETE CASCADE ON UPDATE CASCADE
    ,shifterID bigint NOT NULL REFERENCES Users(uID) ON DELETE CASCADE ON UPDATE CASCADE
    ,jobID bigint NOT NULL REFERENCES Job(jobID) ON DELETE CASCADE ON UPDATE CASCADE
    ,start timestamp NOT NULL
    ,finish timestamp NOT NULL
    ,description varchar(256) NOT NULL
    ,incentive decimal(9,2) NOT NULL
);

-- cron job: delete entries from this once shift expired/done
-- in Want ==> wants the shift, but {not seen} or {rejected} by manager.
-- in Want && event seen by manager <==> "rejected" <==> not 'accept' in EventType
-- delete shift entry from Want if placed in Took.
DROP TABLE IF EXISTS Want CASCADE;
CREATE TABLE Want (
    eventID bigint PRIMARY KEY REFERENCES Events(eventID) ON DELETE CASCADE ON UPDATE CASCADE
    ,wanterID bigint NOT NULL REFERENCES Users(uID) ON DELETE CASCADE ON UPDATE CASCADE
);

-- get time manager "accept" shift transfer, by the timestamp of took.
-- (accept) notification to users about shift transfer accepted by manager.
DROP TABLE IF EXISTS Took CASCADE;
CREATE TABLE Took (
    eventID bigint PRIMARY KEY REFERENCES Events(eventID) ON DELETE CASCADE ON UPDATE CASCADE
    ,takerID bigint NOT NULL REFERENCES Users(uID) ON DELETE CASCADE ON UPDATE CASCADE
    ,managerId bigint NOT NULL REFERENCES Users(uID) ON DELETE CASCADE ON UPDATE CASCADE
);

-- can find other ID from history table.
DROP TABLE IF EXISTS Feedback CASCADE;
CREATE TABLE Feedback (
    eventID bigint PRIMARY KEY REFERENCES Events(eventID) ON DELETE CASCADE ON UPDATE CASCADE
    ,managerID bigint NOT NULL REFERENCES Users(uID) ON DELETE CASCADE ON UPDATE CASCADE
    ,comment varchar(256) NOT NULL
    ,rating int NOT NULL
    ,CHECK (rating <= 5 AND rating >= 1)
);

-- Events ======================================================================
-- =============================================================================

DROP TABLE IF EXISTS Messages CASCADE;
CREATE TABLE Messages (
    messageID bigint PRIMARY KEY
    ,senderID bigint NOT NULL REFERENCES Users(uID) ON DELETE CASCADE ON UPDATE CASCADE
    ,receiverID bigint NOT NULL REFERENCES Users(uID) ON DELETE CASCADE ON UPDATE CASCADE
    ,body text NOT NULL  -- text type is max 25MB
    ,tstamp timestamp NOT NULL
);

DROP TABLE IF EXISTS Endpoints CASCADE;
CREATE TABLE Endpoints (
    uID bigint NOT NULL REFERENCES Users(uID) ON DELETE CASCADE ON UPDATE CASCADE
    ,endpoint varchar(512) NOT NULL  -- how to know size?
    ,IP varchar(46) NOT NULL
    ,tstamp timestamp NOT NULL
);

DROP TABLE IF EXISTS Errors CASCADE;
CREATE TABLE Errors (
    uID bigint NOT NULL REFERENCES Users(uID) ON DELETE CASCADE ON UPDATE CASCADE
    ,endpoint varchar(512) NOT NULL  -- how to know size?
    ,IP varchar(46) NOT NULL
    ,errormessage varchar(1024) NOT NULL
    ,tstamp timestamp NOT NULL
);





INSERT INTO Users(uID, email, username, firstname, middlename, lastname) VALUES 
(000, 'admin@admin.com', 'a1', 'Ad', 'Min', 'Last')
,(111, 'hi@aol.com', 'hi', 'Tooky', 'Tee', 'McTook')
,(222, 'hey@aol.com', 'hey', 'Guy', 'John', 'McMan')
,(333, 'no@aol.com', 'no', 'Manny', 'Gee', 'Manage')
,(444, 'way@aol.com', 'way', 'Sarah', 'Jane', 'Birwani')
,(555, 'man@aol.com', 'man', 'Sydney', 'Swindal', 'Ambrosio')
,(666, 'cool@aol.com', 'cool', 'Xiaoma', 'Ji', 'Zhang')
,(777, 'walt@disney.com', 'walt', 'Walter', 'Elias', 'Disney')
,(888, 'yo@aol.com', 'yo', 'Workey', 'Doo', 'McWork')
,(999, 'wat@aol.com', 'wat', 'Suzanne', 'S', 'Mole')
,(1000, 'see@aol.com', 'see', 'Joey', 'Doey', 'Foley')
;

INSERT INTO Admin(uID) VALUES 
(000)
;

-- 🚧🚧🚧DONT LOSE THESE PASSWORDS (unless make new ones)🚧🚧🚧
-- (000, '1')
-- ,(111, 'suchlongphrases')
-- ,(222, 'dogsitsoncouch')
-- ,(333, 'sombodyhasmustard')
-- ,(444, 'somanyredapples')
-- ,(555, 'toomuchwork')
-- ,(666, 'allthebrownbears')
-- ,(777, 'carsgoreallyfast')
-- ,(888, 'myhairsmells')
-- ,(999, 'todayissunny')
-- ,(1000, 'somuchmorefun')
INSERT INTO Login(uID, passHash) VALUES 
(000, '$2a$10$IwnSVEohbnH.ZbXsKw0wmuXW.Gf3ym4gdrQh.LZbRkRbcm2d9FyDO')
,(111, '$2a$10$WE2DhkOajpP6qU.vQhQqIOXSTDOZusFtH9Yud822sulc/IfBXgcYi')
,(222, '$2a$10$6n0WX.NZ/k641M0PobLwPemAN8deqIyr5l9BftutXjC9NvlFAG8hK')
,(333, '$2a$10$X9gwvHqum60X5828e6RYOOWQn/StqBrwNYKfe/A4jlUigYtBUxKDi')
,(444, '$2a$10$51wdgjS59T4XVVmvZIFFoOmUtqX/0jnCQr1REbbqUO4iSUsUe1rJu')
,(555, '$2a$10$DA0a8hfA3ylLgtr.mMcBfuh/DESp0eWQLsZsGgDnxBzeb4sD7ze7i')
,(666, '$2a$10$B384UlcoSzDnB/DzUuy5xOmw9/g01UCxYjVkCxTDqSuv/1w2mNpnC')
,(777, '$2a$10$1y5FK0BEjDzS5qjrr9uzKOzTocsfWFZHfC/rP49BYDy0vxSFNWl/O')
,(888, '$2a$10$arGncTaUhEYFsa9OsNejU.jZZDkLWQEgE8IhP2grAGcPcfWGERz1W')
,(999, '$2a$10$xIEP/6KdhP4vmp09UIlRD.w4EVvH/hFKmfzzRVSQTGAHF/56pQq5a')
,(1000, '$2a$10$x5dzvPn2rfwQiFqQFGlE8OECsofod27EdEOMbuTuMxwwig/cPo1ri')
;

INSERT INTO Ban(uID) VALUES 
(666);  -- banned user

INSERT INTO Unauth(uID, authCode, numGuesses) VALUES 
(555, '91kdhHk2', 2);  -- not authenticated yet.

INSERT INTO Friends(uID, friendID) VALUES 
(111, 333)
,(111, 222)
,(444, 555)
,(999, 666)
;

INSERT INTO WorkLocation(workName, address, city, region, postzip, country) VALUES
('The Patio 23', '43 Glenbarry St.', 'Toronto', 'ON', 'M8H2JT', 'Canada')
,('Disneyland 1313', '1313 Disneyland Dr', 'Anaheim', 'CA', '92803', 'United States')
,('McDonalds 18882', '541 Ave of the Americas', 'New York', 'NY', '10011', 'United States')
;

INSERT INTO Job(jobID, workName, position) VALUES 
(1, 'The Patio 23', 'cook')
,(2, 'The Patio 23', 'waiter')
,(3, 'The Patio 23', 'manager')
,(4, 'Disneyland 1313', 'manager')
,(5, 'McDonalds 18882', 'manager')
,(7, 'Disneyland 1313', 'general park assistant')
,(8, 'McDonalds 18882', 'cook')
,(9, 'McDonalds 18882', 'cashier')
;

INSERT INTO Employee(uID, jobID) VALUES 
(111, 1)
,(222, 2)
,(333, 3)
,(444, 8)
,(555, 9)
,(666, 7)
,(777, 4)
,(888, 5)
,(999, 7)
,(1000, 7)
,(1000, 8)  -- test data: works 2 places
;


-- =============================================================================
-- Events ======================================================================

INSERT INTO Events(eventID) VALUES 
(1)
,(2)
,(3)
,(4)
,(5)
,(6)
,(7)
,(8)
,(9)
,(10)
,(12)
,(13)
,(14)
,(15)
,(16)
-- ,(17)
-- ,(18)
-- ,(19)
-- ,(21)
-- ,(22)
-- ,(23)
-- ,(24)
-- ,(25)
-- ,(26)
-- ,(27)
-- ,(28)
-- ,(29)
-- ,(30)
;

-- ('post', 'approve', 'accept', 'employ', 'feedback', 'permit', 'expired', 'done', 'rejected')
INSERT INTO EventType(eventTypeID, eventID, type, tstamp) VALUES 
(31, 1, 'post', '2016-07-20 10:21:11.830332-04')
,(32, 2, 'post', '2016-07-09 11:33:11.830332-04')
,(33, 1, 'accept', '2016-07-20 18:22:02.830332-04')
,(34, 1, 'feedback', '2016-07-21 23:54:01.830332-04')
,(35, 3, 'permit', '2016-05-05 12:00:00.000000-04')
,(36, 4, 'permit', '2016-05-05 12:00:00.000000-04')
,(37, 5, 'permit', '2016-05-05 12:00:00.000000-04')
,(38, 6, 'permit', '2016-05-05 12:00:00.000000-04')
,(39, 7, 'permit', '2016-05-05 12:00:00.000000-04')
,(310, 8, 'permit', '2016-05-05 12:00:00.000000-04')
,(312, 9, 'permit', '2016-05-05 12:00:00.000000-04')
,(313, 10, 'permit', '2016-05-05 12:00:00.000000-04')
,(315, 12, 'permit', '2016-05-05 12:00:00.000000-04')
,(316, 13, 'permit', '2016-05-05 12:00:00.000000-04')
,(317, 14, 'permit', '2016-05-05 12:00:00.000000-04')
,(318, 15, 'permit', '2016-05-05 12:00:00.000000-04')
,(319, 3, 'employ', '2016-05-05 12:00:00.000000-04')
,(320, 4, 'employ', '2016-05-05 12:00:00.000000-04')
,(321, 5, 'employ', '2016-05-05 12:00:00.000000-04')
,(322, 6, 'employ', '2016-05-05 12:00:00.000000-04')
,(323, 7, 'employ', '2016-05-05 12:00:00.000000-04')
,(324, 8, 'employ', '2016-05-05 12:00:00.000000-04')
,(325, 9, 'employ', '2016-05-05 12:00:00.000000-04')
,(326, 10, 'employ', '2016-05-05 12:00:00.000000-04')
,(328, 12, 'employ', '2016-05-05 12:00:00.000000-04')
,(329, 16, 'post', '2016-07-27 09:00:00.830332-04')
-- ,(330, , , )
-- ,(331, , , )
-- ,(332, , , )
-- ,(333, , , )
-- ,(334, , , )
-- ,(335, , , )
-- ,(336, , , )
-- ,(337, , , )
-- ,(338, , , )
-- ,(339, , , )
-- ,(340, , , )
;

INSERT INTO History(eventTypeID, deliverID) VALUES 
(31, 444)
,(32, 222)
,(33, 555)
,(34, 444)  -- feedback to both users: shifter/taker
,(34, 555)  -- feedback to both users: shifter/taker
,(35, 333)
,(36, 777)
,(37, 888)
,(38, 111)
,(39, 222)
,(310, 444)
,(312, 555)
,(313, 666)
,(315, 999)
,(316, 999)
,(317, 999)
,(318, 999)
,(319, 333)
,(320, 777)
,(321, 888)
,(322, 111)
,(323, 222)
,(324, 444)
,(325, 555)
,(326, 666)
,(328, 999)
,(329, 1000)  -- deliver this note to all coworkers...
,(329, 777)
-- ,(330, )
-- ,(331, )
-- ,(332, )
-- ,(333, )
-- ,(334, )
-- ,(335, )
-- ,(336, )
-- ,(337, )
-- ,(338, )
-- ,(339, )
-- ,(340, )
;

-- delete items from this table once seen.
INSERT INTO Notify(eventTypeID, deliverID) VALUES 
(31, 555)
,(32, 111)
,(33, 555)
,(34, 444)  -- feedback to both users: shifter/taker
,(34, 555)  -- feedback to both users: shifter/taker
-- ,(35, )   -- todo (notify any existing managers of applications, if any.)
-- ,(36, )
-- ,(37, )
-- ,(38, )
-- ,(39, )
-- ,(310, )
-- ,(312, )
-- ,(313, )
-- ,(314, )
-- ,(315, )
-- ,(316, )
-- ,(317, )
-- ,(318, )
-- ,(319, )  -- todo, notify of employment
-- ,(320, )
-- ,(321, )
-- ,(322, )
-- ,(323, )
-- ,(324, )
-- ,(325, )
-- ,(326, )
-- ,(328, )
,(329, 1000)  -- deliver this note to all coworkers...
,(329, 777)
-- ,(330, )
-- ,(331, )
-- ,(332, )
-- ,(333, )
-- ,(334, )
-- ,(335, )
-- ,(336, )
-- ,(337, )
-- ,(338, )
-- ,(339, )
-- ,(340, )
;

-- note: 'Apply' is for working at a workplace.
INSERT INTO Apply(eventID, uID, jobID) VALUES 
(3, 333, 3)
,(4, 777, 4)
,(5, 888, 5)
,(6, 111, 1)
,(7, 222, 2)
,(8, 444, 8)
,(9, 555, 9)
,(10, 666, 7)
,(12, 999, 7)
,(13, 999, 4)
,(14, 999, 5) -- ..lots of rejections..
,(15, 999, 1)
-- ,(17, , )
-- ,(18, , )
;

-- When make new shift, need to follow the algorithm/steps:
-- add to user's history in History.
-- notify all other coworkers in Notify.
-- add 'type' to EventType.
-- add 'timestamp' to Events.
INSERT INTO Shift(eventID, shifterID, jobID, start, finish, description, incentive) VALUES 
(1, 444, 8, '2016-07-21 12:00:00.830332-04', '2016-07-21 20:30:00.830332-04', 'open to anyone!', 0)
,(2, 222, 2, '2016-07-11 14:00:00.830332-04', '2016-07-11 20:30:00.830332-04', 'thanks in advance', 2)
,(16, 999, 7, '2016-07-29 09:00:00.830332-04', '2016-07-29 18:00:00.830332-04', 'please', 5)
-- ,(17, , , , , , )
-- ,(18, , , , , , )
;

-- note: 'Want' is for shifts.
-- Want time goes in Events(tstamp).
INSERT INTO Want(eventID, wanterID) VALUES 
(16, 1000)
-- ,(17, )
-- ,(18, )
;

INSERT INTO Took(eventID, takerID, managerId) VALUES 
(1, 555, 888)
-- ,(17, , )
-- ,(18, , )
;

INSERT INTO Feedback(eventID, managerID, comment, rating) VALUES 
(1, 333, 'nice, thanks!', 4)
-- ,(17, , , )
-- ,(18, , , )
;

-- Events ======================================================================
-- =============================================================================

-- TODO: messages.

-- CREATE TABLE Messages (
--     messageID bigint PRIMARY KEY
--     ,senderID bigint NOT NULL REFERENCES Users(uID) ON DELETE CASCADE ON UPDATE CASCADE
--     ,receiverID bigint NOT NULL REFERENCES Users(uID) ON DELETE CASCADE ON UPDATE CASCADE
--     ,body text NOT NULL  -- text type is max 25MB
--     ,tstamp timestamp NOT NULL
-- );

INSERT INTO Messages(messageID, senderID, receiverID, body, tstamp) VALUES 
(1, 1000, 999, 'i like disney', '2016-07-30 19:00:00.555332-04')
,(2, 999, 1000, 'me too', '2016-07-30 19:01:00.555332-04')
;

INSERT INTO Endpoints(uID, endpoint, IP, tstamp) VALUES 
(000, '/', '72.66.29.221', '2016-07-28 18:00:00.830332-04')
,(000, '/profile', '72.66.29.221', '2016-07-28 18:01:00.830332-04')
,(000, '/', '72.66.29.221', '2016-07-28 19:00:00.830332-04')
,(000, '/', '72.66.29.221', '2016-07-28 20:00:00.830332-04')
,(000, '/admin', '72.66.29.221', '2016-07-28 20:01:00.830332-04')
;

INSERT INTO Errors(uID, endpoint, IP, errormessage, tstamp) VALUES 
(000, '/', '72.66.29.221', 'error running query { error: syntax error at or near ","...', '2016-07-28 18:00:00.830332-04')
,(000, '/profilessss', '72.66.29.221', 'error: 404 not found', '2016-07-28 18:20:00.830332-04')
,(000, '/api/admin/nothingHere/', '72.66.29.221', 'error: 404 not found', '2016-07-28 18:21:00.830332-04')
,(000, '/api/login/', '72.66.29.221', 'error: 500', '2016-07-28 18:31:00.830332-04')
;





