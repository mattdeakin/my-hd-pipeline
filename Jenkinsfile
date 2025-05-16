/*
 * Declarative pipeline for the 7.3 HD task
 * – minimal, self-contained, works on any default Jenkins agent
 * – assumes the Jenkins master/agent already has:
 *     • NodeJS tool called  “NodeJS”
 *     • JDK   tool called  “JDK17”   (you kept this from your old pipeline)
 *     • SonarScanner tool called “SonarScanner”
 *     • Secret-text credential ID  SONAR_TOKEN   (your SonarCloud token)
 */

pipeline {
    agent any                       // run on any free agent

    /* ----- global tools -------------------------------------------------- */
    tools {
        nodejs 'NodeJS'             // provides node, npm, npx
        jdk    'JDK17'              // not strictly needed but harmless
    }

    /* ----- global environment ------------------------------------------- */
    environment {
        IMAGE_NAME = "my-hd-pipeline:${env.BUILD_NUMBER}"   // e.g. my-hd-pipeline:42
    }

    /* ----- stages -------------------------------------------------------- */
    stages {

        /* 1️⃣  Git checkout */
        stage('Checkout') {
            steps {
                git branch: 'main',
                    url: 'https://github.com/mattdeakin/my-hd-pipeline.git'
            }
        }

        /* 2️⃣  Install Node dependencies */
        stage('Install') {
            steps {
                sh 'npm ci'          // faster & reproducible
            }
        }

        /* 3️⃣  Unit tests + coverage */
        stage('Test') {
            steps {
                sh 'npm test'
            }
            post {
                always {
                    junit 'coverage/**/*.xml'   // Jest’s JUnit XML if configured
                    archiveArtifacts artifacts: 'coverage/**/*.*', fingerprint: true
                }
            }
        }

        /* 4️⃣  SonarCloud static-analysis */
        stage('SonarCloud Analysis') {
            steps {
                withCredentials([string(credentialsId: 'SONAR_TOKEN', variable: 'SONAR_TOKEN')]) {
                    /* ← everything below must live inside ‘script { … }’ */
                    script {
                        // 1 locate the scanner
                        def scannerHome = tool name: 'SonarScanner',
                                            type: 'hudson.plugins.sonar.SonarRunnerInstallation'

                        // 2 run it
                        sh "${scannerHome}/bin/sonar-scanner -Dsonar.login=${SONAR_TOKEN}"
                    }
                }
            }
        }


        /* 5️⃣  Dependency-vulnerability scan */
        stage('NPM Audit') {
            steps {
                sh 'npm audit --audit-level=high || true'   // show CVEs but don’t fail build
            }
        }

        /* 6️⃣  Build container image (optional but nice) */
        stage('Build Docker Image') {
            steps {
                sh "docker build -t ${IMAGE_NAME} ."
            }
        }

        /* 7️⃣  Deploy to local staging with Compose */
        stage('Deploy to Staging') {
            steps {
                sh 'docker-compose down || true'   // clean previous run
                sh 'docker-compose up -d'          // start new container
            }
        }

        /* 8️⃣  Smoke-test the running container */
        stage('Smoke Test') {
            steps {
                sh 'curl --retry 10 --retry-connrefused --silent http://localhost:3000/ | grep -q "Hello, HD world!"'
            }
        }

        /* 9️⃣  Promote to production (manual gate) */
        stage('Promote to Production') {
            when { beforeAgent true; expression { params.PROMOTE_TO_PROD } }
            steps {
                echo "Here you would push ${IMAGE_NAME} to ECR/GCR/Docker Hub and deploy to prod."
            }
        }
    }

    /* ----- parameters ---------------------------------------------------- */
    parameters {
        booleanParam(
            name: 'PROMOTE_TO_PROD',
            defaultValue: false,
            description: 'Tick this box when you are ready to deploy to production'
        )
    }

    /* ----- post-build housekeeping -------------------------------------- */
    post {
        always { cleanWs() }         // wipe workspace to keep agents tidy
    }
}
