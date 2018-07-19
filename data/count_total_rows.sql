SELECT
(SELECT COUNT (*) FROM Users) + (SELECT COUNT (*) FROM Admin) + 
(SELECT COUNT (*) FROM Login) + (SELECT COUNT (*) FROM Ban) + 
(SELECT COUNT (*) FROM Unauth) + (SELECT COUNT (*) FROM Friends) + 
(SELECT COUNT (*) FROM WorkLocation) + (SELECT COUNT (*) FROM Job) + 
(SELECT COUNT (*) FROM Employee) + (SELECT COUNT (*) FROM Events) + 
(SELECT COUNT (*) FROM EventType) + (SELECT COUNT (*) FROM History) + 
(SELECT COUNT (*) FROM Notify) + (SELECT COUNT (*) FROM Apply) + 
(SELECT COUNT (*) FROM Shift) + (SELECT COUNT (*) FROM Want) + 
(SELECT COUNT (*) FROM Took) + (SELECT COUNT (*) FROM Feedback) + 
(SELECT COUNT (*) FROM Endpoints) + (SELECT COUNT (*) FROM Errors) as numRows;