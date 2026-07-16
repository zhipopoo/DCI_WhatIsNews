# ==================== Build Stage ====================
FROM maven:3.9-eclipse-temurin-21-alpine AS build

WORKDIR /build

# Copy POM first for dependency caching
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Copy source and build
COPY src ./src
RUN mvn package -DskipTests -B

# ==================== Runtime Stage ====================
FROM eclipse-temurin:21-jre-alpine

# Install ffmpeg for video transcoding
RUN apk add --no-cache ffmpeg

WORKDIR /app

# Copy the built JAR from build stage
COPY --from=build /build/target/*.jar app.jar

RUN mkdir -p /app/uploads

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]
