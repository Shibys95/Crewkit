
SERVICE_NAME=crewkit.site
IMAGE=$SERVICE_NAME
CONTAINER=$SERVICE_NAME
DOCKERFILE=deploy/Dockerfile
PORT=8005

docker build -f $DOCKERFILE -t $IMAGE .
docker stop $CONTAINER || true && docker rm $CONTAINER || true
docker run --name $CONTAINER --restart=unless-stopped -d -p $PORT:3000 $IMAGE