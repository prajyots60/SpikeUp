pipeline {
    agent any

    environment {
        IMAGE_NAME = "nextjs-app"
        CONTAINER_NAME = "nextjs_app_container"
        ENV_FILE_PATH = "/var/lib/jenkins/envs/nextjs.env"
    }

    stages {
        stage('Checkout') {
            steps {
                echo "📦 Cloning repository..."
                git branch: 'main', url: 'https://github.com/prajyots60/SpikeUp.git'
            }
        }

        stage('Build Docker Image') {
            steps {
                echo "🔨 Building Docker image..."
                sh 'docker build -t ${IMAGE_NAME}:latest .'
            }
        }

        stage('Stop Old Container') {
            steps {
                echo "🛑 Stopping old container (if any)..."
                script {
                    sh '''
                    docker ps -q --filter "name=${CONTAINER_NAME}" | grep -q . && \
                    docker stop ${CONTAINER_NAME} && docker rm ${CONTAINER_NAME} || \
                    echo "No old container running."
                    '''
                }
            }
        }

        stage('Deploy New Container') {
            steps {
                echo "🚀 Deploying new container..."
                sh '''
                docker run -d \
                  --name ${CONTAINER_NAME} \
                  -p 3000:3000 \
                  --env-file ${ENV_FILE_PATH} \
                  ${IMAGE_NAME}:latest
                '''
            }
        }
    }

    post {
        success {
            echo "✅ Deployment successful! Your app is live at port 3000."
        }
        failure {
            echo "❌ Deployment failed. Check Jenkins logs for details."
        }
    }
}
