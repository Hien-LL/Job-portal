create table application_status
(
    id   bigint auto_increment
        primary key,
    code varchar(50)  not null,
    name varchar(255) not null,
    constraint uk_appstatus_code
        unique (code)
);

create table benefits
(
    id   bigint auto_increment
        primary key,
    name varchar(255) not null,
    constraint UK7ho6qa31os2edhw5pk95j47c9
        unique (name)
);

create table blacklisted_tokens
(
    created_at  datetime(6) null,
    expiry_date datetime(6) not null,
    id          bigint auto_increment
        primary key,
    updated_at  datetime(6) null,
    user_id     bigint      null,
    token       longtext    not null
);

create table categories
(
    id   bigint auto_increment
        primary key,
    name varchar(100) null,
    slug varchar(255) null
);

create table locations
(
    id           bigint auto_increment
        primary key,
    city         varchar(255) null,
    country_code varchar(255) null,
    display_name varchar(255) null
);

create table permissions
(
    created_at  datetime(6)  null,
    id          bigint auto_increment
        primary key,
    updated_at  datetime(6)  null,
    description varchar(255) null,
    name        varchar(255) null
);

create table roles
(
    id         bigint auto_increment
        primary key,
    created_at datetime(6) null,
    updated_at datetime(6) null,
    name       varchar(50) not null,
    priority   tinyint     not null
);

create table role_permissions
(
    role_id       bigint not null,
    permission_id bigint not null,
    primary key (role_id, permission_id),
    constraint FKegdk29eiy7mdtefy5c7eirr6e
        foreign key (permission_id) references permissions (id),
    constraint FKn5fotdgk8d1xvo8nav9uv3muc
        foreign key (role_id) references roles (id)
);

create table skills
(
    id   bigint auto_increment
        primary key,
    name varchar(255) null,
    slug varchar(255) null
);

create table users
(
    created_at        datetime(6)  null,
    id                bigint auto_increment
        primary key,
    updated_at        datetime(6)  null,
    address           varchar(255) null,
    email             varchar(255) null,
    name              varchar(255) null,
    password          varchar(255) null,
    phone             varchar(255) null,
    image             varchar(255) null,
    user_catalogue_id bigint       null,
    avatar_url        varchar(255) null,
    headline          varchar(255) null,
    summary           varchar(255) null,
    constraint UK6dotkott2kjsp8vw4d0m25fb7
        unique (email)
);

create table companies
(
    id          bigint auto_increment
        primary key,
    created_at  datetime(6)  null,
    updated_at  datetime(6)  null,
    description varchar(255) null,
    logo_url    varchar(255) null,
    name        varchar(255) null,
    size_max    int          not null,
    size_min    int          not null,
    slug        varchar(255) null,
    verified    bit          not null,
    website     varchar(255) null,
    created_by  bigint       null,
    constraint FKmetlbmw6om0v8dkknxihl19a3
        foreign key (created_by) references users (id)
);

create table company_admins
(
    id         bigint auto_increment
        primary key,
    company_id bigint      not null,
    user_id    bigint      not null,
    constraint UK_company_admins_company_user
        unique (company_id, user_id),
    constraint FKjv0n5iebd50bsdmaep8d66olv
        foreign key (company_id) references companies (id),
    constraint FKofovk1pf83oiu912q2ogovtfb
        foreign key (user_id) references users (id)
);

create table follow_companies
(
    created_at datetime(6) not null,
    company_id bigint      not null,
    user_id    bigint      not null,
    primary key (company_id, user_id),
    constraint fk_follow_company
        foreign key (company_id) references companies (id),
    constraint fk_follow_user
        foreign key (user_id) references users (id)
);

create table jobs
(
    id              bigint auto_increment
        primary key,
    currency        varchar(255) null,
    description     varchar(255) null,
    employment_type varchar(255) null,
    expires_at      datetime(6)  null,
    is_remote       bit          not null,
    published       bit          not null,
    published_at    datetime(6)  null,
    salary_max      int          not null,
    salary_min      int          not null,
    seniority       varchar(255) null,
    slug            varchar(255) null,
    title           varchar(255) null,
    updated_at      datetime(6)  null,
    category_id     bigint       null,
    company_id      bigint       null,
    location_id     bigint       null,
    constraint FKlunrv9ems34544ff26wyfa89v
        foreign key (category_id) references categories (id),
    constraint FKrtmqcrktb6s7xq8djbs2a2war
        foreign key (company_id) references companies (id),
    constraint FKs4mry8ypepr30ypkxxo4w40n5
        foreign key (location_id) references locations (id)
);

create table application
(
    id           bigint auto_increment
        primary key,
    applied_at   datetime(6) null,
    cover_letter text        not null,
    resume_id    bigint      not null,
    updated_at   datetime(6) null,
    job_id       bigint      not null,
    status_id    bigint      not null,
    user_id      bigint      not null,
    constraint uk_application_user_job
        unique (user_id, job_id),
    constraint FKawte0mbtubellxed1dvpoxhdj
        foreign key (user_id) references users (id),
    constraint FKblh7clgv7im3poxncotven9ue
        foreign key (job_id) references jobs (id),
    constraint fk_application_status
        foreign key (status_id) references application_status (id)
);

create index idx_app_job
    on application (job_id);

create index idx_app_status
    on application (status_id);

create index idx_app_user
    on application (user_id);

create table application_status_history
(
    id             bigint auto_increment
        primary key,
    changed_at     datetime(6) not null,
    note           text        null,
    application_id bigint      not null,
    new_status_id  bigint      null,
    old_status_id  bigint      null,
    constraint fk_hist_application
        foreign key (application_id) references application (id),
    constraint fk_hist_new_status
        foreign key (new_status_id) references application_status (id),
    constraint fk_hist_old_status
        foreign key (old_status_id) references application_status (id)
);

create index idx_hist_app
    on application_status_history (application_id);

create table job_benefit
(
    job_id     bigint not null,
    benefit_id bigint not null,
    constraint FK9qcwd4phd95hvna1dt43h8rls
        foreign key (benefit_id) references benefits (id),
    constraint FKnm4c9y4yn5x5ee0oxofu7alb
        foreign key (job_id) references jobs (id)
);

create table refresh_tokens
(
    created_at    datetime(6) null,
    expiry_date   datetime(6) not null,
    id            bigint auto_increment
        primary key,
    updated_at    datetime(6) null,
    user_id       bigint      null,
    refresh_token text        not null,
    constraint FK1lih5y2npsf8u5o3vhdb9y0os
        foreign key (user_id) references users (id)
);

create table resumes
(
    id         bigint auto_increment
        primary key,
    created_at datetime(6)  null,
    updated_at datetime(6)  null,
    is_default bit          null,
    summary    longtext     null,
    title      varchar(150) not null,
    user_id    bigint       not null,
    constraint FK340nuaivxiy99hslr3sdydfvv
        foreign key (user_id) references users (id)
);

create table resume_educations
(
    id         bigint auto_increment
        primary key,
    degree     varchar(255) null,
    end_date   datetime(6)  null,
    major      varchar(255) null,
    school     varchar(255) null,
    start_date datetime(6)  null,
    resume_id  bigint       not null,
    constraint FK8ucu31di3mxa0xe9nk4af9lei
        foreign key (resume_id) references resumes (id)
);

create table resume_experiences
(
    id          bigint auto_increment
        primary key,
    company     varchar(255) null,
    current     bit          not null,
    description longtext     null,
    end_date    datetime(6)  null,
    position    varchar(255) null,
    start_date  datetime(6)  null,
    resume_id   bigint       not null,
    constraint FKqk8da5ggbet8a2ibu5j7dk2e5
        foreign key (resume_id) references resumes (id)
);

create table resume_files
(
    id          bigint auto_increment
        primary key,
    file_type   varchar(255) null,
    file_url    varchar(255) null,
    uploaded_at datetime(6)  null,
    resume_id   bigint       not null,
    constraint FKpqugn7t4fucrv7x1d4srhyy37
        foreign key (resume_id) references resumes (id)
);

create table saved_jobs
(
    saved_at datetime(6) not null,
    job_id   bigint      not null,
    user_id  bigint      not null,
    primary key (job_id, user_id),
    constraint fk_saved_job_job
        foreign key (job_id) references jobs (id),
    constraint fk_saved_job_user
        foreign key (user_id) references users (id)
);

create table user_roles
(
    user_id bigint not null,
    role_id bigint not null,
    primary key (user_id, role_id),
    constraint FKh8ciramu9cc9q3qcqiv4ue8a6
        foreign key (role_id) references roles (id),
    constraint FKhfh9dx7w3ubf1co1vdev94g3f
        foreign key (user_id) references users (id)
);

create table user_skills
(
    years_experience int         not null,
    skill_id         bigint      not null,
    user_id          bigint      not null,
    saved_at         datetime(6) null,
    job_id           bigint      not null,
    primary key (skill_id, user_id),
    constraint uk_user_skill
        unique (user_id, job_id, skill_id),
    constraint fk_user_skill_skill
        foreign key (skill_id) references skills (id),
    constraint fk_user_skill_user
        foreign key (user_id) references users (id)
);

