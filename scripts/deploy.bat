@echo off
echo Deploying to Kubernetes...
echo.
echo Make sure you have configured kubectl with the correct context
echo.
echo Creating namespaces...
kubectl apply -f k8s\namespaces.yaml
echo.
echo Deploying to staging...
kubectl apply -f k8s\staging\deployment.yaml
echo.
echo Deploying to production...
kubectl apply -f k8s\production\deployment.yaml
echo.
echo Deployment completed!
pause
