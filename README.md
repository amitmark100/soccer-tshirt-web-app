# soccer-tshirt-web-app
Final FS project

# PM2 :

```bash
# Step A: Compile TypeScript to JavaScript
npm run build

# Step B: Start/Restart the production process
# This runs the app in Cluster Mode for maximum performance
npx pm2 start ecosystem.config.js --env production

# Step C: Save the process list (to persist after server reboots)
npx pm2 save