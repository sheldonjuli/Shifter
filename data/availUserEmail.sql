-- SELECT u1.email, u2.username
-- FROM users u1, users u2
-- WHERE u1.email='hi@aol.com'
-- OR u2.username='cool'
-- ;


-- SELECT * 
-- FROM (SELECT email
-- FROM users
-- WHERE email='hi@aol.com') as emails



-- SELECT * 
-- FROM (SELECT username
-- FROM users
-- WHERE username='cool') as usernames

-- ;


-- SELECT *
-- FROM users u1 
-- JOIN users u2
-- WHERE u1.email='hi@aol.com'
-- AND u2.username='cool'
-- ;


-- SELECT email
-- FROM users
-- WHERE email='hi@aol.com'
-- ;
-- SELECT username
-- FROM users
-- WHERE username='cool'
-- ;


SELECT email
FROM users
WHERE email='hi@aol.com'
UNION
SELECT username
FROM users
WHERE username='cool';






