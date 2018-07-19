-- All the details for /api/user/...
-- \i people_work_rating_isbanned.sql

-- add userStatus/banned
SELECT *, CASE WHEN users.uid=ban.uid THEN true
        ELSE false
    END as is_banned

-- users and their work information.
-- need to do 'LEFT JOIN' incase user just signed up and has sparse data!!
FROM users
LEFT JOIN employee USING(uid)
LEFT JOIN Job USING(jobid)
LEFT JOIN (
    SELECT workname, 
    address || '\n' || 
    city || ',' || 
    region || ',' || 
    postzip || '\n' || 
    country as workplace
    FROM WorkLocation
) as work_address_concat
USING(workname)

LEFT JOIN ban  -- gets null value if not in table Ban
USING(uid)
LEFT JOIN (
    -- Average rating by user id, set to None (rather than 0 or 5) if doesnt exist.
    SELECT uid, coalesce(to_char(AVG(rating), '9.99'), 'None') as avg_rating
    FROM (
        -- Rating from shift posters (shift), and from shift takers (took).
        SELECT uid, email, username, shift.eventID, rating
        FROM users
        LEFT JOIN Shift ON users.uid=shift.shifterid
        LEFT JOIN Feedback USING (eventid)
        UNION
        SELECT uid, email, username, Took.eventID, rating
        FROM users
        LEFT JOIN Took ON users.uid=Took.takerID
        LEFT JOIN Feedback USING (eventid)
    ) as ratings_per_eventid
    GROUP BY uid
) as sdfhiusdfhsdfdsf
USING (uid)
-- WHERE username='way'
;




-- -- add userStatus/banned
-- select *, 
-- -- people_work.uid=ban.uid as is_banned
-- CASE WHEN people_work.uid=ban.uid THEN true
--     ELSE false
-- END as is_banned
-- from people_work
-- LEFT JOIN ban  -- gets null value if not in table Ban
-- USING(uid)
-- JOIN
-- ;













