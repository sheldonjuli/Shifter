-- All the `jobid` that people users/people applied to.
-- \i people_apply.sql

SELECT *
FROM users
JOIN apply USING(uid);