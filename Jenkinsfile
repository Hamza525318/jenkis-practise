pipeline {
  agent any

  environment {
    IMAGE = "jx-node-api"
  }

  options {
    timestamps()
    buildDiscarder(logRotator(numToKeepStr: '20'))
    ansiColor('xterm')
  }

  stages {
    stage('Checkout') {
      steps { checkout scm }
    }

    stage('Build & Test inside Node') {
      agent {
        docker {
          image 'node:20-alpine'
          args "-v ${env.WORKSPACE}:${env.WORKSPACE}"
        }
      }
      stages {
        stage('Install') {
          steps {
            sh 'node -v && npm -v'
            sh 'npm ci'
          }
        }
        stage('Lint') {
          steps { sh 'npm run lint' }
        }
        stage('Test') {
          steps {
            sh 'npm run test:ci'
          }
          post {
            always {
              junit 'reports/junit/junit.xml'
            }
          }
        }
      }
    }

    stage('Docker Build & Push') {
      steps {
        withCredentials([usernamePassword(credentialsId: 'dockerhub', usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PSW')]) {
          sh 'echo "$DOCKER_PSW" | docker login -u "$DOCKER_USER" --password-stdin'
          sh 'docker build -t "$DOCKER_USER/${IMAGE}:$BUILD_NUMBER" .'
          sh 'docker tag "$DOCKER_USER/${IMAGE}:$BUILD_NUMBER" "$DOCKER_USER/${IMAGE}:latest"'
          sh 'docker push "$DOCKER_USER/${IMAGE}:$BUILD_NUMBER"'
          sh 'docker push "$DOCKER_USER/${IMAGE}:latest"'
        }
      }
    }

    stage('Deploy') {
      steps {
        sh 'docker compose down || true'
        sh 'docker compose up -d'
      }
    }
  }

  post {
    success {
      echo "Deployed successfully → http://localhost:8081"
    }
    cleanup {
      sh 'docker logout || true'
    }
  }
}
