-- Show people's details along with their notifications, and event details.
-- \i people_notifications.sql

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

-- CREATE OR REPLACE VIEW people_notifications AS
SELECT *
FROM people_work
JOIN Notify
ON Notify.deliverID=people_work.uid
JOIN eventtype
USING(eventtypeid)
JOIN shift
USING(eventid)
;