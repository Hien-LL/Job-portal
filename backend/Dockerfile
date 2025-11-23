# ===== build =====
FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /app
ENV LANG=C.UTF-8 LC_ALL=C.UTF-8 MAVEN_OPTS="-Dfile.encoding=UTF-8"

COPY pom.xml .
RUN mvn -q -DskipTests dependency:go-offline
COPY src ./src
RUN mvn -q -DskipTests clean package

# ===== run =====
FROM eclipse-temurin:21-jre
WORKDIR /app
ENV LANG=C.UTF-8 LC_ALL=C.UTF-8


# install a small MySQL client for readiness checks, then create non-root user
RUN apt-get update && \
    apt-get install -y --no-install-recommends default-mysql-client ca-certificates && \
    rm -rf /var/lib/apt/lists/* && \
    useradd -ms /bin/bash appuser && \
    mkdir -p /app/logs /app/uploads && chown -R appuser:appuser /app

# copy jar from build stage
COPY --from=build /app/target/*.jar /app/app.jar

# add a small wait script to ensure dependent services are up
COPY wait-and-run.sh /app/wait-and-run.sh
RUN chmod +x /app/wait-and-run.sh && chown appuser:appuser /app/wait-and-run.sh

USER appuser

EXPOSE 8080
ENTRYPOINT ["/bin/bash","/app/wait-and-run.sh"]
