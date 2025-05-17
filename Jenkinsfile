pipeline {
    agent any                       
    tools {
        nodejs 'NodeJS'             // provides node, npm, npx
        jdk    'JDK17'              // not strictly needed but harmless
    }
    environment {
        IMAGE_NAME = "my-hd-pipeline:${env.BUILD_NUMBER}"

        PATH = "${env.PATH}:/usr/bin:/bin"
    }
    stages {
        stage('Checkout') {
            steps {
                git branch: 'main',
                    url: 'https://github.com/mattdeakin/my-hd-pipeline.git'
            }
        }
        stage('Install') {
            steps {
                sh 'npm ci'
            }
        }
        stage('Test') {
            steps {
                sh 'npm test'
            }
            post {
                always {
                    archiveArtifacts artifacts: 'coverage/**/*.*', fingerprint: true
                }
            }
        }
        stage('SonarCloud Analysis') {
            steps {
                withCredentials([string(credentialsId: 'SONAR_TOKEN', variable: 'SONAR_TOKEN')]) {
                    script {
                        def scannerHome = tool name: 'SonarScanner',
                                            type: 'hudson.plugins.sonar.SonarRunnerInstallation'

                        sh "${scannerHome}/bin/sonar-scanner -Dsonar.login=${SONAR_TOKEN}"
                    }
                }
            }
        }
        stage('NPM Audit') {
            steps {
                sh 'npm audit --audit-level=high || true'  
            }
        }
        stage('Build Docker Image') {
            steps {
                sh "docker build -t ${IMAGE_NAME} ."
            }
        }
        stage('Deploy to Staging') {
            steps {
                sh 'docker-compose down || true'   
                sh 'docker-compose up -d'         
            }
        }
        stage('Smoke Test') {
            steps {
                sh 'curl --retry 10 --retry-connrefused --silent http://localhost:3000/ | grep -q "Hello, HD world!"'
            }
        }
        stage('Promote to Production') {
            when { beforeAgent true; expression { params.PROMOTE_TO_PROD } }
            steps {
                echo "Here you would push ${IMAGE_NAME} to ECR/GCR/Docker Hub and deploy to prod."
            }
        }
    }
    parameters {
        booleanParam(
            name: 'PROMOTE_TO_PROD',
            defaultValue: false,
            description: 'Tick this box when you are ready to deploy to production'
        )
    }
    post {
        always {
            archiveArtifacts artifacts: 'coverage/**/*.*', fingerprint: true
        }
    }

}
