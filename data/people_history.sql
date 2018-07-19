-- Show people's details along with their history, and event details.
-- \i people_history.sql

CREATE OR REPLACE VIEW people_work AS
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
USING(workname)
;

-- CREATE OR REPLACE VIEW people_history AS
SELECT *
FROM people_work
JOIN History
ON History.deliverID=people_work.uid
JOIN eventtype
USING(eventtypeid)
JOIN shift
USING(eventid);


