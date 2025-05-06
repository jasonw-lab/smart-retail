# 基础镜像
FROM openjdk:17-jdk-alpine

# 维护者信息 (使用LABEL替代已弃用的MAINTAINER)
LABEL maintainer="dev"

# 修改容器时区(alpine镜像RUN apk --no-cache add tzdata && cp /usr/share/zoneinfo/Asia/Tokyo /etc/localtime && echo "Asia/Tokyo" > /etc/timezone \
                 #    && apk --no-cache add ttf-dejavu fontconfig需安装tzdata来设置时区)，安装字体库(验证码)
RUN apk --no-cache add tzdata && cp /usr/share/zoneinfo/Asia/Tokyo /etc/localtime && echo "Asia/Tokyo" > /etc/timezone \
    && apk --no-cache add ttf-dejavu fontconfig

# 在运行时自动挂载 /tmp 目录为匿名卷，提高可移植性。如果 /tmp 目录没有挂载为卷，这些文件会写入容器的可写层，可能导致容器镜像膨胀。
VOLUME /tmp

# 工作目录
WORKDIR /app

# 复制Maven项目的源代码
COPY ./pom.xml ./pom.xml
COPY ./src ./src

# 安装Maven并构建应用
RUN apk add --no-cache maven \
    && mvn package -DskipTests \
    && mv target/youlai-boot.jar app.jar \
    && rm -rf target \
    && apk del maven

# 指定容器启动时执行的命令 (使用JSON格式)
CMD ["java", "-Xms512m", "-Xmx512m", "-Djava.security.egd=file:/dev/./urandom", "-jar", "/app/app.jar"]

# 暴露容器的端口
EXPOSE 8989