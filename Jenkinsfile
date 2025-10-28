pipeline {
  agent any

  environment {
    DOCKERHUB_CRED = 'dockerhub'
    DOCKER_USER    = credentials('dockerhub').username
    DOCKER_PSW     = credentials('dockerhub').password
    IMAGE          = "${DOCKER_USER}/jx-node-api"
    TAG            = "${env.BRANCH_NAME == 'main' ? env.BUILD_NUMBER : env.BRANCH_NAME.replaceAll('/','-') + '-' + env.BUILD_NUMBER}"
    // Cache dir for npm on Jenkins agent
    NPM_CONFIG_CACHE = "${WORKSPACE}/.npm"
  }

  options {
    timestamps()
    ansiColor('xterm')
    buildDiscarder(logRotator(numToKeepStr: '20'))
  }

  stages {
    stage('Checkout') {
      steps { checkout scm }
    }

    stage('Use Node inside Docker') {
      agent { docker { image 'node:20-alpine' args "-v ${env.WORKSPACE}:${env.WORKSPACE}" } }
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
        stage('Build app (no-op in this demo)') {
          steps { sh 'echo "Build step placeholder (TS transpile, webpack, etc.)"' }
        }
      }
    }

    stage('Docker Build & Push') {
      steps {
        sh 'echo "$DOCKER_PSW" | docker login -u "$DOCKER_USER" --password-stdin'
        sh 'docker build -t "$IMAGE:$TAG" .'
        sh 'docker tag "$IMAGE:$TAG" "$IMAGE:latest"'
        sh 'docker push "$IMAGE:$TAG"'
        sh 'docker push "$IMAGE:latest"'
      }
    }

    stage('Deploy (docker compose)') {
      steps {
        writeFile file: 'deploy.env', text: "DOCKER_USER=${env.DOCKER_USER}\nTAG=${env.TAG}\n"
        sh 'set -a && . ./deploy.env && docker compose up -d --pull always'
      }
    }
  }

  post {
    success {
      echo "Deployed http://localhost:8081/health"
    }
    cleanup {
      sh 'docker logout || true'
    }
  }
}
