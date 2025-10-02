create table if not exists blacklisted_tokens
(
    created_at  datetime(6) null,
    expiry_date datetime(6) not null,
    id          bigint auto_increment
        primary key,
    updated_at  datetime(6) null,
    user_id     bigint      null,
    token       longtext    not null
);

create table if not exists permissions
(
    created_at  datetime(6)  null,
    id          bigint auto_increment
        primary key,
    updated_at  datetime(6)  null,
    description varchar(255) null,
    name        varchar(255) null
);

create table if not exists roles
(
    id         bigint auto_increment
        primary key,
    created_at datetime(6) null,
    updated_at datetime(6) null,
    name       varchar(50) not null,
    priority   tinyint     not null
);

create table if not exists role_permissions
(
    role_id       bigint not null,
    permission_id bigint not null,
    constraint `PRIMARY`
        primary key (role_id, permission_id),
    constraint FKegdk29eiy7mdtefy5c7eirr6e
        foreign key (permission_id) references permissions (id),
    constraint FKn5fotdgk8d1xvo8nav9uv3muc
        foreign key (role_id) references roles (id)
);

create table if not exists users
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
    constraint UK6dotkott2kjsp8vw4d0m25fb7
        unique (email)
);

create table if not exists refresh_tokens
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

create table if not exists user_roles
(
    user_id bigint not null,
    role_id bigint not null,
    constraint `PRIMARY`
        primary key (user_id, role_id),
    constraint FKh8ciramu9cc9q3qcqiv4ue8a6
        foreign key (role_id) references roles (id),
    constraint FKhfh9dx7w3ubf1co1vdev94g3f
        foreign key (user_id) references users (id)
);


