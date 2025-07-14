@echo off
echo Setting up GitHub secrets...
echo.
echo You need to add these secrets to your GitHub repository:
echo.
echo 1. KUBE_CONFIG_STAGING - Base64 encoded kubeconfig for staging
echo 2. KUBE_CONFIG_PRODUCTION - Base64 encoded kubeconfig for production
echo 3. SLACK_WEBHOOK - Slack webhook URL for notifications
echo.
echo To encode your kubeconfig on Windows:
echo certutil -encode ~/.kube/config kubeconfig.b64
echo.
echo Go to: https://github.com/YOUR_USERNAME/YOUR_REPO/settings/secrets/actions
pause
