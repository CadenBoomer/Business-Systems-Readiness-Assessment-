USE riipen_business_assessment;

CREATE TABLE submissions (
id INT AUTO_INCREMENT PRIMARY KEY,
first_name VARCHAR(100) NOT NULL,
last_name VARCHAR(100) NOT NULL, 
email VARCHAR(100) NOT NULL, 
answers JSON NOT NULL, -- This stores the user's 12 answers as a JSON array 
pathway VARCHAR(100), -- The ML model reads the 12 answers and puts the user into one of 3 buckets: Foundation Systems, Growth, Optimization
reasoning TEXT,  -- explains why the user got that pathway. For ex, "Your business has limited IT systems and low revenue, indicating a need for foundational systems.
confidence_score DECIMAL(4,2), --  A number between 0 and 1 that says how confident the ML model is. So 0.95 means 95% confident the user belongs in that pathway. 0.60 would mean it was less sure. / 4 = total number of digits 2 = how many of those digits are after the decimal point.
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

