# HTTPS Proxy Configuration

This project is configured to use HTTPS proxy for API requests. Here's how it works:

## Configuration

### Vite Configuration (`vite.config.js`)
The proxy is configured in the Vite development server to forward all `/api` requests to your HTTPS backend.

Key features:
- **Environment-based configuration**: Uses `VITE_API_URL` environment variable
- **Self-signed certificate support**: Handles development certificates with `secure: false`
- **Request/Response logging**: Detailed logging for debugging
- **Error handling**: Comprehensive error handling for proxy issues

### Environment Variables

Create a `.env` file in your project root:

```bash
# For HTTPS (production)
VITE_API_URL=https://13.203.103.15:8080

# For HTTP (development) - uncomment the line below and comment the above line
# VITE_API_URL=http://13.203.103.15:8080
```

## Usage

### Development
1. Set your API URL in `.env` file
2. Run the development server:
   ```bash
   npm run dev
   ```
3. All API requests to `/api/*` will be proxied to your backend

### Production
For production, you should:
1. Remove the `rejectUnauthorized: false` option from `axiosConfig.js`
2. Ensure your backend has valid SSL certificates
3. Set `secure: true` in the proxy configuration

## Troubleshooting

### SSL Certificate Issues
If you encounter SSL certificate errors in development:
- The current configuration has `rejectUnauthorized: false` for development
- The proxy is set to `secure: false` to handle self-signed certificates
- For production, ensure your backend has valid SSL certificates

### Self-Signed Certificate Errors
If you see "self-signed certificate" errors:
- The configuration now handles self-signed certificates automatically
- `secure: false` in Vite proxy allows self-signed certificates
- `rejectUnauthorized: false` in axios allows self-signed certificates

### Proxy Errors
Check the console for detailed error messages. Common issues:
- Backend server not running
- Incorrect API URL
- Network connectivity issues

### Debugging
The configuration includes comprehensive logging:
- Request details in console
- Response status codes
- Error details with timestamps

## Security Notes

⚠️ **Important**: The `rejectUnauthorized: false` and `secure: false` options should only be used in development. For production:
1. Ensure your backend has valid SSL certificates
2. Remove the `rejectUnauthorized: false` option
3. Set `secure: true` in the proxy configuration 