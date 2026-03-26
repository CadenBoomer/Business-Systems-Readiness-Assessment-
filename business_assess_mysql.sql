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

CREATE TABLE questions (
id INT AUTO_INCREMENT PRIMARY KEY,
question_text TEXT NOT NULL,   -- The question itself
display_order INT NOT NULL,   -- Displays what order the questions appear in. Will go up to 12. Admin might want to reorder questions later without deleting and recreating them. They can just change the display_order number.
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE answer_options (
id INT AUTO_INCREMENT PRIMARY KEY,
question_id INT NOT NULL,  -- Links answer back to question. If question 1 has id of 1, all the answer options for that question will have question_id of 1. This is the foreign key relationship.
answer_text VARCHAR(255) NOT NULL,  -- Actual answer text. Will be displayed as a button on frontend
display_order INT NOT NULL,  -- Same idea as in the questions table
FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE     -- One question has many answer options. 
);

DELETE FROM answer_options WHERE id IN (1, 2);

CREATE TABLE admin(
id INT AUTO_INCREMENT PRIMARY KEY,
username VARCHAR(100) NOT NULL UNIQUE,
password VARCHAR(100) NOT NULL UNIQUE,
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE submissions
ADD COLUMN summary TEXT,
ADD COLUMN priority_actions JSON,
ADD COLUMN anti_priority_warnings JSON,
ADD COLUMN graduation_outlook TEXT,
ADD COLUMN class_probabilities JSON;