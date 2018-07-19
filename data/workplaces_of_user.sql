-- all users, their details, work, and their managers


SELECT workname, position
-- SELECT *
FROM users
JOIN employee USING(uID)
JOIN job USING(jobID)
WHERE username='see'
;




--           name           | uid  |    email     | jobid |        position        |    workname     |     managername     | managerid 
-- -------------------------+------+--------------+-------+------------------------+-----------------+---------------------+-----------
--  Tooky Tee McTook        |  111 | hi@aol.com   |     1 | cook                   | The Patio 23    | Manny Gee Manage    |       333
--  Guy John McMan          |  222 | hey@aol.com  |     2 | waiter                 | The Patio 23    | Manny Gee Manage    |       333
--  Sarah Jane Birwani      |  444 | way@aol.com  |     8 | cook                   | McDonalds 18882 | Workey Doo McWork   |       888
--  Sydney Swindal Ambrosio |  555 | man@aol.com  |     9 | cashier                | McDonalds 18882 | Workey Doo McWork   |       888
--  Xiaoma Ji Zhang         |  666 | cool@aol.com |     7 | general park assistant | Disneyland 1313 | Walter Elias Disney |       777
--  Suzanne S Mole          |  999 | wat@aol.com  |     7 | general park assistant | Disneyland 1313 | Walter Elias Disney |       777
--  Joey Doey Foley         | 1000 | see@aol.com  |     7 | general park assistant | Disneyland 1313 | Walter Elias Disney |       777
-- (7 rows)



