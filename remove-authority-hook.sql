-- ================================================
-- Remove Authority Hook Component from Database
-- ================================================
-- This removes the authority-hook component that's causing errors
-- Run this in phpMyAdmin or your MySQL client

-- STEP 1: Backup first (IMPORTANT!)
-- Copy the output of this query and save it somewhere safe
SELECT post_id, meta_value 
FROM wp_postmeta 
WHERE meta_key = 'gmkb_media_kit_state' 
AND meta_value LIKE '%authority-hook%';

-- STEP 2: Remove authority-hook from post #32372
-- This is the post causing your current error
UPDATE wp_postmeta 
SET meta_value = REPLACE(
    REPLACE(
        REPLACE(meta_value, '"type":"authority-hook"', '"type":"REMOVED_INVALID"'),
        '"authority-hook"', '"REMOVED_INVALID"'
    ),
    'authority-hook', 'REMOVED_INVALID'
)
WHERE meta_key = 'gmkb_media_kit_state' 
AND post_id = 32372
AND meta_value LIKE '%authority-hook%';

-- STEP 3: (Optional) Remove from ALL posts
-- Uncomment the lines below if you want to clean ALL media kits
-- UPDATE wp_postmeta 
-- SET meta_value = REPLACE(
--     REPLACE(
--         REPLACE(meta_value, '"type":"authority-hook"', '"type":"REMOVED_INVALID"'),
--         '"authority-hook"', '"REMOVED_INVALID"'
--     ),
--     'authority-hook', 'REMOVED_INVALID'
-- )
-- WHERE meta_key = 'gmkb_media_kit_state' 
-- AND meta_value LIKE '%authority-hook%';

-- STEP 4: Verify cleanup
SELECT post_id, meta_value 
FROM wp_postmeta 
WHERE meta_key = 'gmkb_media_kit_state' 
AND meta_value LIKE '%authority-hook%';
-- Should return 0 rows

-- ================================================
-- After running this SQL:
-- 1. Rebuild: npm run build
-- 2. Refresh: Ctrl + Shift + R
-- 3. Error should be GONE!
-- ================================================
