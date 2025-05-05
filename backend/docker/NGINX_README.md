# Nginx Configuration Update

## Issue Fixed
Fixed the error: `nginx: [emerg] host not found in upstream "retail-app" in /etc/nginx/conf.d/default.conf:51`

## Changes Made

### 1. Modified docker-compose-env.yml
- Commented out the dependency on the retail-app service in the nginx service configuration:
```yaml
# Removed dependency on retail-app as it's commented out
# depends_on:
#   - retail-app
```

### 2. Modified Nginx Configuration (default.conf)
- Updated the `/api/` location block to return a temporary 503 response instead of proxying to the non-existent retail-app service:
```nginx
# API proxy for retail-app backend
# Temporarily disabled as retail-app service is not available
location /api/ {
    # Return a temporary service unavailable response
    return 503 '{"status": 503, "message": "API service is temporarily unavailable"}';
    add_header Content-Type application/json;
    
    # Original proxy configuration (commented out)
    # proxy_pass http://retail-app:8989/;
    # proxy_set_header Host $host;
    # proxy_set_header X-Real-IP $remote_addr;
    # proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    # proxy_set_header X-Forwarded-Proto $scheme;
}
```

## Restoring Original Functionality

When the retail-app service becomes available (uncommented in docker-compose-env.yml), follow these steps to restore the original functionality:

1. Uncomment the retail-app service in docker-compose-env.yml
2. Restore the dependency in the nginx service:
```yaml
depends_on:
  - retail-app
```
3. Restore the original proxy configuration in default.conf:
```nginx
# API proxy for retail-app backend
location /api/ {
    proxy_pass http://retail-app:8989/;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}
```

## Testing
After making these changes, the Nginx service should start successfully without the "host not found in upstream" error. API requests to `/api/` will receive a 503 response with a JSON message indicating that the service is temporarily unavailable.