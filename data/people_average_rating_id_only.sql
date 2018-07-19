-- Show only uid and average rating ("None" rating if none.)
-- \i people_average_rating_id_only.sql

-- People and all their ratings per eventid
DROP VIEW IF EXISTS rating_id CASCADE;
CREATE VIEW rating_id AS
SELECT uid, email, username, shift.eventID, rating
FROM users
LEFT JOIN Shift ON users.uid=shift.shifterid
LEFT JOIN Feedback USING (eventid)
UNION
SELECT uid, email, username, Took.eventID, rating
FROM users
LEFT JOIN Took ON users.uid=Took.takerID
LEFT JOIN Feedback USING (eventid)
;
-- select * from rating_id;

--  uid  |      email      | username | eventid | rating 
-- ------+-----------------+----------+---------+--------
--   111 | hi@aol.com      | hi       |         |       
--   888 | yo@aol.com      | yo       |         |       
--   999 | wat@aol.com     | wat      |         |       
--   555 | man@aol.com     | man      |       1 |      4
--   555 | man@aol.com     | man      |         |       
--   777 | walt@disney.com | walt     |         |       
--   666 | cool@aol.com    | cool     |         |       
--     0 | admin@admin.com | a1       |         |       
--   333 | no@aol.com      | no       |         |       
--   444 | way@aol.com     | way      |         |       
--   222 | hey@aol.com     | hey      |       2 |       
--   222 | hey@aol.com     | hey      |         |       
--   444 | way@aol.com     | way      |       1 |      4
--  1000 | see@aol.com     | see      |         |       
--   999 | wat@aol.com     | wat      |      16 |       


-- Average rating by user id, set to None (rather than 0 or 5) if doesnt exist.
SELECT uid, coalesce(to_char(AVG(rating), '9.99'), 'None') as avg_rating
FROM rating_id
GROUP BY uid
;

--  uid  | avg_rating 
-- ------+------------
--   444 |  4.00
--  1000 | None
--   888 | None
--   222 | None
--   333 | None
--   666 | None
--   111 | None
--   555 |  4.00
--     0 | None
--   777 | None
--   999 | None







