-- \i update_username.sql

-- select * from users;
select * from Login;

-- UPDATE users
-- SET username = 'Luna'
-- WHERE username = 'hey';

-- select * from login
UPDATE Login
SET passHash = 'wowowowowowowowowowowowowwwwwww'
WHERE EXISTS (
    SELECT *
    FROM users
    WHERE login.uid=users.uid
    AND username = 'hey'
);

-- select * from users;
select * from Login;

