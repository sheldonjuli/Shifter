-- All the coworkers of one person.
-- \i people_coworkers.sql

-- coalesce to turn null (num_taken) into 0.
SELECT job.workname, coworkers.firstname, coworkers.middlename, 
coworkers.lastname, coworkers.username as coworker_username, 
coworkers.uid as coworker_uid, average_info.avg_rating, 
coalesce(num_taken, 0) as num_shifts_taken

-- , uid=banned_id as is_banned
FROM users u1
JOIN employee USING(uid)
JOIN job USING(jobid)

JOIN (
    SELECT firstname, middlename, lastname, username, uid, workname
    FROM users u2
    JOIN employee e2 USING(uid)
    JOIN job j2 USING(jobid)
) as coworkers
USING(workname)

-- get average rating of each coworker. [note: '9.99' is the precision spec]
JOIN (
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
) as average_info
ON coworkers.uid = average_info.uid

-- number of shifts taken by each coworker.
LEFT JOIN (
    SELECT takerID, count(takerID) as num_taken
    FROM Took
    GROUP BY takerID
) as coworkers_num_taken
ON coworkers_num_taken.takerid = coworkers.uid


WHERE u1.username='way'       -- search query on this user as parameter.
AND u1.username != coworkers.username;  -- prevent samesies.



