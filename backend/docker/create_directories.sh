#!/bin/bash

# Create directories for MySQL
mkdir -p /mydata/mysql/conf
mkdir -p /mydata/mysql/data
mkdir -p /mydata/sql/mysql

# Create directories for Nacos
mkdir -p /mydata/nacos/logs

# Create directories for Seata
mkdir -p /mydata/seata/config
mkdir -p /mydata/seata/logs

# Create directories for Redis
mkdir -p /mydata/redis/data
mkdir -p /mydata/redis/config

# Create directories for Minio
mkdir -p /mydata/minio/data
mkdir -p /mydata/minio/config

# Create directories for XXL-Job-Admin
mkdir -p /mydata/xxljob/logs

# Create directories for Nginx
mkdir -p /mydata/nginx/conf
mkdir -p /mydata/nginx/conf/conf.d
mkdir -p /mydata/nginx/html
mkdir -p /mydata/nginx/logs

# Copy Nginx configuration and html files (remove existing files before copy)