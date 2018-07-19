-- The number of shifts taken by each person.
-- Recall: shifts posted are in table Shift. shifts taken are in table Took.
-- \i people_num_shifts_taken.sql

-- DROP VIEW IF EXISTS people_work CASCADE;
-- CREATE VIEW people_work AS
SELECT takerID, count(takerID) as num_taken
FROM Took
GROUP BY takerID
;


