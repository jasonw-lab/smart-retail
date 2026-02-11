package com.youlai.boot.common.util;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * Minimal .env loader for local development.
 * <p>
 * Note: JVM cannot reliably mutate OS environment variables at runtime, so this loads
 * entries into {@link System#getProperties()} (system properties). Spring Boot reads
 * system properties as a high-priority property source, so placeholders like
 * ${MYSQL_HOST:...} will resolve correctly.
 */
public final class DotenvUtils {

    private DotenvUtils() {
    }

    /**
     * Load .env from common locations, without overriding existing environment variables
     * or system properties.
     *
     * @return loaded key/value pairs (in file order) from the first found .env file
     */
    public static Map<String, String> loadIfPresent() {
        List<Path> candidates = List.of(
                Paths.get(".env"),
                Paths.get("backend/.env"),
                Paths.get("apps/backend/.env")
        );

        for (Path candidate : candidates) {
            if (Files.isRegularFile(candidate)) {
                System.out.println("Loading .env from: " + candidate.toAbsolutePath());
                return loadFromFile(candidate);
            }
        }
        System.out.println("No .env file found in standard locations");
        return Map.of();
    }

    private static Map<String, String> loadFromFile(Path dotenvPath) {
        Map<String, String> loaded = new LinkedHashMap<>();
        List<String> lines;
        try {
            lines = Files.readAllLines(dotenvPath, StandardCharsets.UTF_8);
        } catch (IOException e) {
            System.err.println("Failed to read .env file: " + e.getMessage());
            return Map.of();
        }

        int loadedCount = 0;
        for (String rawLine : lines) {
            String line = rawLine == null ? "" : rawLine.trim();
            if (line.isEmpty() || line.startsWith("#")) {
                continue;
            }

            int idx = line.indexOf('=');
            if (idx <= 0) {
                continue;
            }

            String key = line.substring(0, idx).trim();
            String value = line.substring(idx + 1).trim();
            if (key.isEmpty()) {
                continue;
            }

            value = stripOptionalQuotes(value);

            loaded.put(key, value);

            if (System.getenv(key) != null) {
                continue;
            }
            if (System.getProperty(key) != null) {
                continue;
            }
            System.setProperty(key, value);
            loadedCount++;
        }

        System.out.println("Loaded " + loadedCount + " environment variables from .env");
        return loaded;
    }

    private static String stripOptionalQuotes(String value) {
        if (value == null) {
            return null;
        }
        if (value.length() >= 2) {
            char first = value.charAt(0);
            char last = value.charAt(value.length() - 1);
            if ((first == '"' && last == '"') || (first == '\'' && last == '\'')) {
                return value.substring(1, value.length() - 1);
            }
        }
        return value;
    }
}

