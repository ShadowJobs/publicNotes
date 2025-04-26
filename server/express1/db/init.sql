CREATE DATABASE IF NOT EXISTS antdp1use;
USE antdp1use;

CREATE TABLE IF NOT EXISTS user (
    id INT AUTO_INCREMENT,
    name VARCHAR(255),
    phone VARCHAR(20),
    gender CHAR(1),
    PRIMARY KEY (id)
);

INSERT INTO user (name, phone, gender,ip) VALUES ('linying0', '15822223331', 'F','1.1.1.1'), ('ziye', '15888888888', 'M','1.2.2.1');
INSERT INTO user (name, phone, gender) VALUES ('ly2', '15822223331', 'F','1.1.1.2');
delete from user where name='ly2';
alter table user add column token varchar(255) not null default '' comment 'token';
alter table user add column token_up_time datetime comment 'token更新时间';
alter table user add column token_expire_time datetime comment 'token过期时间';
alter table user add column login_status tinyint not null default 0 comment '登录状态';
alter table user add column psw varchar(255) not null default '' comment '密码';
alter table user add column psw_update_time datetime not null default '1970-01-01 00:00:00' comment '密码更新时间';
alter table user add column psw_expire_time datetime not null default '1970-01-01 00:00:00' comment '密码过期时间';
alter table user add column psw_error_times int not null default 0 comment '密码错误次数';
alter table user add column psw_lock_time int comment '密码锁定时间(秒)';
alter table user add column psw_lock_status tinyint not null default 0 comment '密码锁定状态';
-- 删除列login_status
alter table user drop column login_status;
alter table user add column login_time datetime comment '登录时间';
insert into user (name,phone,gender,token,token_up_time,token_expire_time,psw,psw_update_time,psw_expire_time,psw_error_times,psw_lock_time,psw_lock_status,login_time,ip)
values('linying', '15822223331', 'F', 'token', '2020-01-01 00:00:00', '2020-01-01 00:00:00', 'password', '2020-01-01 00:00:00', '2020-01-01 00:00:00', 0, 0, 0, '2020-01-01 00:00:00','1.2.1.2');
update user set name='ly1' where name='linying0';
ALTER TABLE user ADD UNIQUE (name);
alter table user add COLUMN ip varchar(30) not null default '' comment 'ip';
UPDATE user SET ip = name;
ALTER TABLE user ADD UNIQUE (ip);
CREATE TABLE front_end_errors (
    id INT AUTO_INCREMENT PRIMARY KEY,
    type VARCHAR(50) NOT NULL,
    message TEXT NOT NULL,
    stack TEXT,
    source VARCHAR(255),
    lineno INT,
    colno INT,
    component_stack TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    user CHAR(50) NULL
);

CREATE TABLE `api_log` (
  `log_id` int(11) NOT NULL AUTO_INCREMENT,
  `url` varchar(255) DEFAULT NULL,
  `host` varchar(128) DEFAULT NULL,
  `start_time` datetime DEFAULT CURRENT_TIMESTAMP,
  `execute_ms` int(11) DEFAULT NULL,
  `succeed` int(11) DEFAULT '0',
  `user` varchar(100) DEFAULT NULL,
  `payload` json DEFAULT NULL,
  `error_info` json DEFAULT NULL,
  `header` json DEFAULT NULL,
  `error` json DEFAULT NULL,
  PRIMARY KEY (`log_id`),
  KEY `api_log_start_time_index` (`start_time`),
  KEY `api_log_succeed_index` (`succeed`),
  KEY `api_log_url_index` (`url`),
  KEY `api_log_host_index` (`host`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4;


create table uploaded_files (
    id int primary key auto_increment,
    user_id int,
    filename varchar(255),
    md5 varchar(255),
    chunk_num int COMMENT 'total chunk number',
    upload_time datetime,
    size int COMMENT 'file size'
);

alter table user 
  add column clear_psw tinyint not null default 0 comment '清除密码标记',
  add column email varchar(255) default '' comment '邮箱',
  add column role varchar(30) default '' comment '权限',
  add column avatar_path varchar(255) default '' comment '头像路径';
-- ALTER TABLE user ADD UNIQUE (email);
-- ALTER TABLE user add column email varchar(255) default '' comment '邮箱' unique; 这样可以一句实现add column和unique



-- execute in shell： mysql -u yourusername -p -h localhost < init.sql