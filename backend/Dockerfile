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

# non-root
RUN useradd -ms /bin/bash appuser && \
    mkdir -p /app/logs /app/uploads && chown -R appuser:appuser /app
USER appuser

COPY --from=build /app/target/*.jar /app/app.jar

EXPOSE 8080
ENTRYPOINT ["java","-jar","/app/app.jar"]
