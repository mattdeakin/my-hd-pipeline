/*
 * Declarative pipeline for the 7.3 HD task
 * Tools & credentials are assumed to be configured in Jenkins:
 *   – NodeJS  (“NodeJS”)
 *   – JDK     (“JDK17”)
 *   – SonarScanner (“SonarScanner”)
 *   – Secret-text credential  SONAR_TOKEN
 */

pipeline {
    agent any

    tools {
        nodejs 'NodeJS'
        jdk    'JDK17'
    }

    environment {
        IMAGE_NAME = "my-hd-pipeline:${env.BUILD_NUMBER}"
        PATH       = "${env.PATH}:/usr/bin:/bin"
    }

    stages {

        stage('Checkout') {
            steps {
                git branch: 'main',
                    url: 'https://github.com/mattdeakin/my-hd-pipeline.git'
            }
        }

        stage('Install')   { steps { sh 'npm ci'  } }
        stage('Test')      {
            steps { sh 'npm test' }
            post { always { archiveArtifacts artifacts: 'coverage/**/*.*', fingerprint: true } }
        }

        stage('SonarCloud Analysis') {
            steps {
                withCredentials([string(credentialsId: 'SONAR_TOKEN', variable: 'SONAR_TOKEN')]) {
                    script {
                        def scannerHome = tool name: 'SonarScanner',
                                           type: 'hudson.plugins.sonar.SonarRunnerInstallation'
                        sh "${scannerHome}/bin/sonar-scanner -Dsonar.token=$SONAR_TOKEN"
                    }
                }
            }
        }

        stage('NPM Audit')          { steps { sh 'npm audit --audit-level=high || true' } }
        stage('Build Docker Image') { steps { sh "docker build -t ${IMAGE_NAME} ."    } }

        stage('Deploy to Staging')  {
            steps {
                sh 'docker-compose down || true'
                sh 'docker-compose up -d'
            }
        }

        /* ✅ Deterministic smoke test */
        stage('Smoke Test') {
            steps {
                sh """
                   curl --retry 10 --retry-connrefused --silent http://localhost:3000/ |
                   grep -q 'HD-API-OK'
                """
            }
        }

        stage('Promote to Production') {
            when { beforeAgent true; expression { params.PROMOTE_TO_PROD } }
            steps {
                echo "Here you would push ${IMAGE_NAME} to a registry and deploy."
            }
        }
    }

    parameters {
        booleanParam(name: 'PROMOTE_TO_PROD',
                     defaultValue: false,
                     description: 'Tick this to deploy to production')
    }

    post { always { cleanWs() } }
}
