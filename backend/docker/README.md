# Docker Compose Environment Setup

## Changes Made

The volume mappings in the `docker-compose-env.yml` file have been updated to use the `/mydata/` prefix for all containers. For example:
- `./minio/data` has been changed to `/mydata/minio/data`
- `./minio/config` has been changed to `/mydata/minio/config`

This pattern has been applied to all containers in the docker-compose file.

## Directory Structure

A script has been provided to create all the necessary directories:

```
/mydata/
├── mysql/
│   ├── conf/
│   └── data/
├── sql/
│   └── mysql/
├── nacos/
│   └── logs/
├── seata/
│   ├── config/
│   └── logs/
├── redis/
│   ├── data/
│   └── config/
├── minio/
│   ├── data/
│   └── config/
├── xxljob/
│   └── logs/
└── nginx/
    ├── conf/
    │   └── conf.d/
    ├── html/
    └── logs/
```

## Usage

1. Run the `create_directories.sh` script to create all the necessary directories:

```bash
sudo ./create_directories.sh
```

2. Start the Docker containers using the updated `docker-compose-env.yml` file:

```bash
docker-compose -f docker-compose-env.yml up -d
```

This will start all the containers with the updated volume mappings.