-- All the personal and work details of people
-- \i people_work.sql

-- DROP VIEW IF EXISTS people_work CASCADE;
-- CREATE VIEW people_work AS
SELECT *
-- , uid=banned_id as is_banned
FROM users
JOIN employee USING(uid)
JOIN Job USING(jobid)
JOIN (
    SELECT workname, 
    address || '\n' || 
    city || ',' || 
    region || ',' || 
    postzip || '\n' || 
    country as workplace
    FROM WorkLocation
) as work_address_concat
USING(workname)
-- WHERE uid=666 OR uid=111
-- WHERE uid=1000  -- works 2 places
-- CROSS JOIN (
--     SELECT uid as banned_id
--     from ban
-- ) as banned_users
;
