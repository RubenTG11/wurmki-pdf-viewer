#!/bin/sh

# Generate env-config.js with runtime environment variables
echo "Generating runtime configuration..."

cat > /usr/share/nginx/html/env-config.js << EOF
window.ENV = {
  VITE_SUPABASE_URL: '${VITE_SUPABASE_URL}',
  VITE_SUPABASE_ANON_KEY: '${VITE_SUPABASE_ANON_KEY}',
  VITE_SUPABASE_BUCKET_NAME: '${VITE_SUPABASE_BUCKET_NAME}'
}
EOF

echo "Runtime configuration generated successfully!"
echo "VITE_SUPABASE_URL: ${VITE_SUPABASE_URL}"
echo "VITE_SUPABASE_BUCKET_NAME: ${VITE_SUPABASE_BUCKET_NAME}"

# Start nginx
exec nginx -g 'daemon off;'
