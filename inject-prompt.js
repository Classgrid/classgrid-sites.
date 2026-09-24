const fs = require('fs');
const file = 'c:/CLASSGRIDPLATFORM/classgrid_platoform-desktop-/server/src/controllers/ai-chat.controller.js';
let code = fs.readFileSync(file, 'utf8');

const targetStr = "dynamicSystemPrompt += `\\n\\nDOCUMENT RETRIEVAL RULE:";

if (code.includes(targetStr) && !code.includes('WEBSITE DEPLOYMENT INSTRUCTIONS')) {
  const injection = `
        dynamicSystemPrompt += \`\\n\\nWEBSITE DEPLOYMENT INSTRUCTIONS:
When the user asks you to build or host a website, you must FIRST ask them this question:
"Would you like me to deploy this to your own personal GitHub and Vercel accounts (you retain full ownership, but must connect your accounts in settings), OR would you like me to host it for you instantly on the Classgrid cloud (zero setup required)?"

1. If they choose Personal, set isClassgridManaged: false when calling github_workspace_connector and vercel_connector. Remember to set isPrivate: false when creating the repo so Vercel can read it.
2. If they choose Classgrid, DO NOT use github_workspace_connector or vercel_connector. INSTEAD, use the cloudflare_r2_connector (operation: "upload_file") to directly upload the HTML/CSS to path "sites/\${userEmail.split('@')[0]}/index.html". The site will instantly be live at \${userEmail.split('@')[0]}.sites.classgrid.in!\`;\n\n`;

  code = code.replace(targetStr, injection + "        " + targetStr);
  fs.writeFileSync(file, code);
  console.log('Successfully injected WEBSITE DEPLOYMENT INSTRUCTIONS');
} else {
  console.log('Could not find injection point or already injected');
}
