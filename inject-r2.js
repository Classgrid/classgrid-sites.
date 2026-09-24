const fs = require('fs');
const file = 'c:/CLASSGRIDPLATFORM/classgrid_platoform-desktop-/server/src/mcp/tools.js';
let code = fs.readFileSync(file, 'utf8');

if (!code.includes('cloudflare_r2_connector')) {
  // Inject Schema
  code = code.replace(
    "    name: 'vercel_connector',",
    `    name: 'cloudflare_r2_connector',
    description: 'Upload files (like HTML, CSS) directly to the Classgrid Cloudflare R2 storage bucket. Use this for Classgrid Managed website hosting.',
    inputSchema: {
      type: 'object',
      properties: {
        operation: { type: 'string', enum: ['upload_file'], description: 'The operation to perform.' },
        path: { type: 'string', description: 'The file path in the bucket (e.g. "sites/nikhil/index.html").' },
        content: { type: 'string', description: 'The raw text/HTML content to upload.' },
        mimeType: { type: 'string', description: 'The MIME type (e.g. "text/html" or "text/css").' }
      },
      required: ['operation', 'path', 'content', 'mimeType']
    }
  },
  {
    name: 'vercel_connector',`
  );

  // Inject Logic
  code = code.replace(
    "    if (name === 'vercel_connector') {",
    `    if (name === 'cloudflare_r2_connector') {
      const { operation, path: s3Path, content, mimeType } = args;
      if (operation === 'upload_file') {
        if (!s3Path || !content || !mimeType) throw new Error('path, content, and mimeType are required.');
        try {
          const buffer = Buffer.from(content, 'utf-8');
          const publicUrl = await uploadBufferToR2(buffer, 'generated.html', mimeType, s3Path);
          return { content: [{ type: 'text', text: \`Successfully uploaded file to Cloudflare R2!\\nLive URL: \${publicUrl}\` }] };
        } catch (error) {
          throw new Error(\`Failed to upload to R2: \${error.message}\`);
        }
      } else {
        throw new Error(\`Unsupported R2 operation: \${operation}\`);
      }
    }

    if (name === 'vercel_connector') {`
  );

  fs.writeFileSync(file, code);
  console.log('Successfully injected cloudflare_r2_connector');
} else {
  console.log('cloudflare_r2_connector already exists');
}
