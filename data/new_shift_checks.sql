-- Post a new shift only if user found, and workplace/position is assigned to that user.
-- \i new_shift_checks.sql

-- REQ:
-- user must exist
-- user must be authorized
-- user cannot be banned
-- workplace/position must exist

SELECT *
-- user must exist
FROM users
JOIN employee USING(uid)
JOIN job USING(jobid)

-- the shift workplace/position must exist
-- and they must work there.
WHERE workname='McDonalds 18882'
AND position='cook'
AND username='see'

-- user cannot be banned
AND uid NOT IN (
    SELECT uid
    FROM ban
)
-- user must be authorized
AND uid NOT IN (
    SELECT uid
    FROM Unauth
);



