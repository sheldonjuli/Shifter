-- Search
-- \i search_shifter.sql



SELECT username, 
    firstname || ' ' || middlename  || ' ' || lastname as name,
    array_agg(workname) as workplaces_array
FROM users
LEFT JOIN employee USING(uid)
LEFT JOIN job USING(jobid)
WHERE LOWER(firstname) ILIKE '%j%'
OR LOWER(middlename) ILIKE '%j%'
OR LOWER(lastname) ILIKE '%j%'
GROUP BY uid
;




-- SELECT WorkLocation.workname, 
-- address || '\n' || 
-- city || ', ' || 
-- region || ', ' || 
-- postzip || '\n' || 
-- country as workplace, 
-- array_agg(position) as positions_array
-- FROM WorkLocation
-- JOIN Job USING(workname)
-- WHERE LOWER(workName) ILIKE '%s%'
-- OR LOWER(address) ILIKE '%s%'
-- OR LOWER(city) ILIKE '%s%'
-- OR LOWER(region) ILIKE '%s%'
-- OR LOWER(postzip) ILIKE '%s%'
-- OR LOWER(country) ILIKE '%s%'
-- GROUP BY workname
-- ;


















