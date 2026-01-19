CREATE DATABASE IF NOT EXISTS railway DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE railway;

ALTER DATABASE railway CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
SET NAMES utf8mb4;

/* CREATE DATABASE IF NOT EXISTS oohjinDanceAcademy_DB; */
/*USE oohjinDanceAcademy_DB;*/

CREATE TABLE IF NOT EXISTS admin (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO admin (username, password) 
VALUES ('woody', '$2b$10$mEyk35NjtpgJAwXng0JYi.W22b6k18YZDsO94wa4osd8Uoi2NooWy')
ON DUPLICATE KEY UPDATE password = VALUES(password);

/* instructor table */
CREATE TABLE IF NOT EXISTS instructors (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(50) NOT NULL,
    phone VARCHAR(20),
    salary INT DEFAULT 0
);

/* member table */
CREATE TABLE IF NOT EXISTS members (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(50) NOT NULL,
    gender VARCHAR(10) NOT NULL,
    age INT NOT NULL,
    birthdate DATE,
    address TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    phone VARCHAR(20) NOT NULL
);

/* program info table */
CREATE TABLE IF NOT EXISTS programs (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    instructor_id INT,
    monthly_price INT NOT NULL DEFAULT 0,
    per_class_price INT NOT NULL DEFAULT 0,
    classes_per_week INT NOT NULL DEFAULT 1,
    FOREIGN KEY (instructor_id) REFERENCES instructors(id)
);

CREATE TABLE IF NOT EXISTS class_schedules (
    id INT PRIMARY KEY AUTO_INCREMENT,
    program_id INT NOT NULL,
    day VARCHAR(20) NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    details TEXT,
    color VARCHAR(20),
    FOREIGN KEY (program_id) REFERENCES programs(id) ON DELETE CASCADE
);

/* register info table */
CREATE TABLE IF NOT EXISTS enrollments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    member_id INT NOT NULL,
    program_id INT NOT NULL,
    start_date DATE NOT NULL,
    duration_months INT DEFAULT NULL,
    total_classes INT DEFAULT NULL,
    remaining_days INT NOT NULL,
    payment_status ENUM('paid', 'unpaid') NOT NULL,
    total_amount INT NOT NULL DEFAULT 0,
    FOREIGN KEY (member_id) REFERENCES members(id),
    FOREIGN KEY (program_id) REFERENCES programs(id)
);

/* attendance table */
CREATE TABLE IF NOT EXISTS attendance (
    id INT PRIMARY KEY AUTO_INCREMENT,
    enrollment_id INT NOT NULL,
    attendance_date DATE NOT NULL,
    FOREIGN KEY (enrollment_id) REFERENCES enrollments(id) ON DELETE CASCADE
);

/*
ALTER TABLE enrollments 
ADD COLUMN original_amount INT NOT NULL DEFAULT 0 AFTER total_amount;
*/

/*
ALTER TABLE members
ADD COLUMN hidden BOOLEAN DEFAULT FALSE;
*/

CREATE TABLE IF NOT EXISTS payment_logs (
    id INT PRIMARY KEY AUTO_INCREMENT,
    enrollment_id INT NOT NULL,
    payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    program_name VARCHAR(100) NOT NULL,
    duration_months INT,
    total_classes INT,
    amount INT NOT NULL,
    is_extension BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (enrollment_id) REFERENCES enrollments(id) ON DELETE CASCADE
);