
##############################################
# Stage 1: build the React frontend
##############################################
FROM node:20-alpine AS frontend-build
WORKDIR /app/ui

# Install dependencies first so this layer is cached unless package*.json actually changes.
COPY src/ui/package.json src/ui/package-lock.json ./

RUN npm install

COPY src/ui/ ./

ENV CI=false
RUN npm run build

##############################################
# Stage 2: build the Spring Boot backend, bundling the compiled frontend
##############################################
FROM maven:3.9-eclipse-temurin-17 AS backend-build
WORKDIR /app

# Resolve dependencies in their own layer, cached unless pom.xml changes.
COPY pom.xml .
RUN mvn -B dependency:go-offline

COPY src/main ./src/main


COPY --from=frontend-build /app/ui/build/ ./src/main/resources/static/

RUN mvn -B clean package -DskipTests

##############################################
# Stage 3: minimal runtime image
##############################################
FROM eclipse-temurin:17-jre-alpine AS runtime
WORKDIR /app

RUN addgroup -S spring && adduser -S spring -G spring
USER spring

# pom.xml sets <finalName>app</finalName>, so the built jar is target/app.jar
COPY --from=backend-build /app/target/app.jar ./app.jar

EXPOSE 8080

# Keep the JVM aware of the container's memory limit
ENV JAVA_OPTS="-XX:+UseContainerSupport -XX:MaxRAMPercentage=75"

# spring-boot-starter-actuator is already a dependency, so /actuator/health is available out of the box for this.
HEALTHCHECK --interval=30s --timeout=3s --start-period=30s --retries=3 \
    CMD wget -qO- http://localhost:8080/actuator/health || exit 1

# application.properties reads server.port from $PORT if set, defaulting to 8080
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]
