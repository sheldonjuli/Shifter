-- Apply to work somewhere. check the workplace/position even exists.
-- \i apply_work.sql

-- REQ:
-- the workplace/position must exist.
-- the username cannot already have that workplace/position job.

-- the workplace/position must exist.
SELECT workname, position
FROM job
WHERE workname='Disneyland 1313'
AND position='manager'

EXCEPT

-- the username cannot already have that workplace/position job.
SELECT workname, position
FROM users
JOIN employee USING(uid)
JOIN job USING(jobid)
WHERE username = 'see'
;






-- if there exists something, then we can insert then to apply for it!
-- ....

-- TODO: convert this into a trigger, where all the inserts are done if the above
-- passes.. on insert into Shift initially.

-- post new Shift

-- Notify all coworkers

-- History for the user id only

-- EventType

-- Events



-- INSERT INTO ...


