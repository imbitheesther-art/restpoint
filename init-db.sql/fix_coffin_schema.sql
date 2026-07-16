-- Fix sub-branch databases: Change coffin_id from INT to VARCHAR(255)
-- Run this on mumo-feuneral-machakos, mumo-feuneral-kisumu (and any other sub-branch DBs)

ALTER TABLE coffins MODIFY coffin_id VARCHAR(255) NOT NULL;
ALTER TABLE coffins MODIFY custom_id VARCHAR(255) DEFAULT NULL;

-- Also fix coffin_images if it references coffin_id
ALTER TABLE coffin_images MODIFY coffin_id VARCHAR(255) NOT NULL;

-- Fix deceased_coffin if it references coffin_id
ALTER TABLE deceased_coffin MODIFY coffin_id VARCHAR(255) NOT NULL;