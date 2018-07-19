-- users/people's average rating. Single 2 decimal number, like 4.99
-- \i people_average_rating.sql


DROP VIEW IF EXISTS people_work CASCADE;
CREATE VIEW people_work AS
SELECT *
FROM users
JOIN employee USING(uid)
JOIN Job USING(jobid)
JOIN (
    SELECT workname, 
    address || '\n' || 
    city || ',' || 
    region || ',' || 
    postzip || '\n' || 
    country as location
    FROM WorkLocation
) as workplace
USING(workname);

DROP VIEW IF EXISTS people_shifts CASCADE;
CREATE VIEW people_shifts AS
SELECT *
FROM people_work
JOIN (
    SELECT eventID, shifterID, start, finish, description, incentive, jobid as shiftjobid
    FROM Shift
) as some_shift_attr
ON some_shift_attr.shifterid=people_work.uid
AND some_shift_attr.shiftjobid=people_work.jobid;
-- select * from people_shifts;

-- CREATE OR REPLACE VIEW people_work_feedback AS
SELECT *
FROM people_shifts
JOIN Feedback
USING(eventid);

-- SELECT round(AVG(rating), 2) as average_rating
-- FROM people_work_feedback
-- GROUP BY (uid);


