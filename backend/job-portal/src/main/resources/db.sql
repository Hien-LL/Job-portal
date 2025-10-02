-- ===== lookup =====
CREATE TABLE roles (
    id bigint NOT NULL AUTO_INCREMENT,
    created_at datetime(6) DEFAULT NULL,
    name varchar(50) NOT NULL,
    publish tinyint NOT NULL,
    updated_at datetime(6) DEFAULT NULL,
    PRIMARY KEY (id)
) ENGINE = InnoDB AUTO_INCREMENT = 17 DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci

CREATE TABLE user_roles (
    user_id bigint NOT NULL,
    role_id bigint NOT NULL,
    PRIMARY KEY (user_id, role_id),
    KEY FKh8ciramu9cc9q3qcqiv4ue8a6 (role_id),
    CONSTRAINT FKh8ciramu9cc9q3qcqiv4ue8a6 FOREIGN KEY (role_id) REFERENCES roles (id),
    CONSTRAINT FKhfh9dx7w3ubf1co1vdev94g3f FOREIGN KEY (user_id) REFERENCES users (id)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci

CREATE TABLE role_permissions (
    role_id bigint NOT NULL,
    permission_id bigint NOT NULL,
    PRIMARY KEY (role_id, permission_id),
    KEY FKegdk29eiy7mdtefy5c7eirr6e (permission_id),
    CONSTRAINT FKegdk29eiy7mdtefy5c7eirr6e FOREIGN KEY (permission_id) REFERENCES permissions (id),
    CONSTRAINT FKn5fotdgk8d1xvo8nav9uv3muc FOREIGN KEY (role_id) REFERENCES roles (id)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;

CREATE TABLE permissions (
    id bigint NOT NULL AUTO_INCREMENT,
    created_at datetime(6) DEFAULT NULL,
    description varchar(255) DEFAULT NULL,
    name varchar(255) DEFAULT NULL,
    updated_at datetime(6) DEFAULT NULL,
    PRIMARY KEY (id)
) ENGINE = InnoDB AUTO_INCREMENT = 19 DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci

CREATE TABLE application_statuses (
  id TINYINT PRIMARY KEY,
  code VARCHAR(30) NOT NULL UNIQUE, -- SUBMITTED, VIEWED, INTERVIEW, OFFER, REJECTED, WITHDRAWN
  name VARCHAR(100) NOT NULL
) ENGINE=InnoDB;

CREATE TABLE categories (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(120) NOT NULL UNIQUE
) ENGINE=InnoDB;

CREATE TABLE locations (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  country_code CHAR(2) NOT NULL,
  admin1 VARCHAR(100), -- province/state
  city VARCHAR(100),
  display_name VARCHAR(200) NOT NULL,
  INDEX idx_loc_country (country_code),
  INDEX idx_loc_city (city)
) ENGINE=InnoDB;

CREATE TABLE skills (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL UNIQUE,
  slug VARCHAR(120) NOT NULL UNIQUE
) ENGINE=InnoDB;

CREATE TABLE benefits (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(120) NOT NULL UNIQUE
) ENGINE=InnoDB;

-- ===== users & auth =====
CREATE TABLE users (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  email VARCHAR(150) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(150) NOT NULL,
  phone VARCHAR(30),
  headline VARCHAR(200),
  address VARCHAR(255),
  summary TEXT,
  avatar_url VARCHAR(255),
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_users_active (is_active),
  FULLTEXT INDEX ftx_users_name_summary (full_name, headline, summary)
) ENGINE=InnoDB;

CREATE TABLE user_roles (
  user_id BIGINT NOT NULL,
  role_id BIGINT NOT NULL,
  PRIMARY KEY (user_id, role_id),
  CONSTRAINT fk_ur_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_ur_role FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE RESTRICT
) ENGINE=InnoDB;

CREATE TABLE user_skills (
  user_id BIGINT NOT NULL,
  skill_id BIGINT NOT NULL,
  level TINYINT, -- 1..5
  years_experience DECIMAL(4,1),
  PRIMARY KEY (user_id, skill_id),
  CONSTRAINT fk_us_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_us_skill FOREIGN KEY (skill_id) REFERENCES skills(id) ON DELETE RESTRICT
) ENGINE=InnoDB;

-- ===== companies =====
CREATE TABLE companies (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(180) NOT NULL,
  slug VARCHAR(200) NOT NULL UNIQUE,
  website VARCHAR(200),
  logo_url VARCHAR(255),
  description MEDIUMTEXT,
  size_min INT,
  size_max INT,
  verified BOOLEAN DEFAULT FALSE,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE company_admins (
  company_id BIGINT NOT NULL,
  user_id BIGINT NOT NULL,
  PRIMARY KEY (company_id, user_id),
  CONSTRAINT fk_ca_company FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
  CONSTRAINT fk_ca_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ===== jobs =====
CREATE TABLE jobs (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  company_id BIGINT NOT NULL,
  title VARCHAR(180) NOT NULL,
  slug VARCHAR(220) NOT NULL UNIQUE,
  description MEDIUMTEXT NOT NULL,
  employment_type VARCHAR(30) NOT NULL, -- FULL_TIME, PART_TIME, INTERN, CONTRACT
  seniority VARCHAR(30), -- JUNIOR, MID, SENIOR, LEAD
  category_id BIGINT,
  location_id BIGINT,
  is_remote BOOLEAN DEFAULT FALSE,
  salary_min INT,
  salary_max INT,
  currency CHAR(3) DEFAULT 'VND',
  published BOOLEAN DEFAULT FALSE,
  published_at DATETIME,
  expires_at DATETIME,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_jobs_company FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
  CONSTRAINT fk_jobs_category FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL,
  CONSTRAINT fk_jobs_location FOREIGN KEY (location_id) REFERENCES locations(id) ON DELETE SET NULL,
  INDEX idx_jobs_company (company_id),
  INDEX idx_jobs_published (published, published_at),
  INDEX idx_jobs_expire (expires_at),
  FULLTEXT INDEX ftx_jobs_text (title, description)
) ENGINE=InnoDB;

CREATE TABLE job_skills (
  job_id BIGINT NOT NULL,
  skill_id BIGINT NOT NULL,
  required BOOLEAN DEFAULT TRUE,
  PRIMARY KEY (job_id, skill_id),
  CONSTRAINT fk_js_job FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE,
  CONSTRAINT fk_js_skill FOREIGN KEY (skill_id) REFERENCES skills(id) ON DELETE RESTRICT
) ENGINE=InnoDB;

CREATE TABLE job_benefits (
  job_id BIGINT NOT NULL,
  benefit_id BIGINT NOT NULL,
  PRIMARY KEY (job_id, benefit_id),
  CONSTRAINT fk_jb_job FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE,
  CONSTRAINT fk_jb_benefit FOREIGN KEY (benefit_id) REFERENCES benefits(id) ON DELETE RESTRICT
) ENGINE=InnoDB;

-- ===== resume =====
CREATE TABLE resumes (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id BIGINT NOT NULL,
  title VARCHAR(150) NOT NULL,
  summary TEXT,
  is_default BOOLEAN DEFAULT FALSE,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_res_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY uq_user_default (user_id, is_default) -- tối đa 1 resume default
) ENGINE=InnoDB;

CREATE TABLE resume_experiences (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  resume_id BIGINT NOT NULL,
  company VARCHAR(150) NOT NULL,
  position VARCHAR(150) NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE,
  current BOOLEAN DEFAULT FALSE,
  description TEXT,
  CONSTRAINT fk_re_resume FOREIGN KEY (resume_id) REFERENCES resumes(id) ON DELETE CASCADE,
  INDEX idx_re_resume (resume_id)
) ENGINE=InnoDB;

CREATE TABLE resume_educations (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  resume_id BIGINT NOT NULL,
  school VARCHAR(150) NOT NULL,
  degree VARCHAR(120),
  major VARCHAR(120),
  start_date DATE,
  end_date DATE,
  CONSTRAINT fk_red_resume FOREIGN KEY (resume_id) REFERENCES resumes(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE resume_files (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  resume_id BIGINT NOT NULL,
  file_url VARCHAR(255) NOT NULL,
  file_type VARCHAR(50) NOT NULL, -- PDF/DOCX
  uploaded_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_rf_resume FOREIGN KEY (resume_id) REFERENCES resumes(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ===== ứng tuyển =====
CREATE TABLE applications (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id BIGINT NOT NULL,
  job_id BIGINT NOT NULL,
  resume_id BIGINT,
  cover_letter TEXT,
  status_id TINYINT NOT NULL, -- FK -> application_statuses
  applied_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_user_job (user_id, job_id),
  CONSTRAINT fk_app_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_app_job FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE,
  CONSTRAINT fk_app_resume FOREIGN KEY (resume_id) REFERENCES resumes(id) ON DELETE SET NULL,
  CONSTRAINT fk_app_status FOREIGN KEY (status_id) REFERENCES application_statuses(id) ON DELETE RESTRICT,
  INDEX idx_app_job (job_id, status_id),
  INDEX idx_app_user (user_id, applied_at)
) ENGINE=InnoDB;

CREATE TABLE application_status_history (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  application_id BIGINT NOT NULL,
  old_status_id TINYINT,
  new_status_id TINYINT NOT NULL,
  changed_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  note VARCHAR(255),
  CONSTRAINT fk_ash_app FOREIGN KEY (application_id) REFERENCES applications(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ===== social =====
CREATE TABLE saved_jobs (
  user_id BIGINT NOT NULL,
  job_id BIGINT NOT NULL,
  saved_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, job_id),
  CONSTRAINT fk_sj_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_sj_job FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE follow_companies (
  user_id BIGINT NOT NULL,
  company_id BIGINT NOT NULL,
  followed_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, company_id),
  CONSTRAINT fk_fc_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_fc_company FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE notifications (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id BIGINT NOT NULL,
  title VARCHAR(150) NOT NULL,
  body VARCHAR(500),
  read_at DATETIME,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_notif_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_notif_user (user_id, created_at),
  INDEX idx_notif_unread (user_id, read_at)
) ENGINE=InnoDB;

INSERT INTO roles(code,name) VALUES 
 ('CANDIDATE','Candidate'),('EMPLOYER','Employer'),('ADMIN','Admin');

INSERT INTO application_statuses(id,code,name) VALUES
 (1,'SUBMITTED','Submitted'),
 (2,'VIEWED','Viewed'),
 (3,'INTERVIEW','Interview'),
 (4,'OFFER','Offer'),
 (5,'REJECTED','Rejected'),
 (6,'WITHDRAWN','Withdrawn');
