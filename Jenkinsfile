/*
 * Declarative pipeline for the 7.3 HD task
 * — minimal, self-contained, works on any default Jenkins agent
 * — assumes the Jenkins master/agent already has:
 *       • NodeJS tool        named  “NodeJS”
 *       • JDK   tool         named  “JDK17”
 *       • SonarScanner tool  named  “SonarScanner”
 *       • Secret-text credential  SONAR_TOKEN  (your SonarCloud token)
 */

pipeline {
    agent any

    /* ---------- global tools ------------------------------------------- */
    tools {
        nodejs 'NodeJS'
        jdk    'JDK17'
    }

    /* ---------- global environment ------------------------------------- */
    environment {
        IMAGE_NAME = "my-hd-pipeline:${env.BUILD_NUMBER}"
        // keep default PATH; no need for the old workaround
    }

    /* ---------- stages -------------------------------------------------- */
    stages {

        /* 1️⃣  Checkout source ------------------------------------------------ */
        stage('Checkout') {
            steps {
                git branch: 'main',
                    url: 'https://github.com/mattdeakin/my-hd-pipeline.git'
            }
        }

        /* 2️⃣  Install dependencies ----------------------------------------- */
        stage('Install') {
            steps { sh 'npm ci' }
        }

        /* 3️⃣  Unit tests ---------------------------------------------------- */
        stage('Test') {
            steps { sh 'npm test' }
            post {
                always { archiveArtifacts artifacts: 'coverage/**/*.*', fingerprint: true }
            }
        }

        /* 4️⃣  SonarCloud static analysis ----------------------------------- */
        stage('SonarCloud Analysis') {
            steps {
                withCredentials([string(credentialsId: 'SONAR_TOKEN', variable: 'SONAR_TOKEN')]) {
                    script {
                        def scannerHome = tool name: 'SonarScanner',
                                             type: 'hudson.plugins.sonar.SonarRunnerInstallation'
                        sh "${scannerHome}/bin/sonar-scanner"
                    }
                }
            }
        }

        /* 5️⃣  Vulnerability scan ------------------------------------------- */
        stage('NPM Audit') {
            steps { sh 'npm audit --audit-level=high || true' }
        }

        /* 6️⃣  Build container image ---------------------------------------- */
        stage('Build Docker Image') {
            steps { sh "docker build -t ${IMAGE_NAME} ." }
        }

        /* 7️⃣  Deploy to local staging -------------------------------------- */
        stage('Deploy to Staging') {
            steps {
                sh 'docker-compose down || true'   // clear previous run
                sh 'docker-compose up -d'          // start new container
            }
        }

        /* 8️⃣  Smoke test (now waits for /health) --------------------------- */
        stage('Smoke Test') {
            steps {
                sh '''
                # Wait (max 20 s) until the app answers on /health
                for i in {1..20}; do
                  if curl --silent http://localhost:3000/health >/dev/null 2>&1; then
                    break
                  fi
                  sleep 1
                done

                # Functional check on /todos (requires auth header)
                curl --retry 10 --retry-connrefused --silent \
                     -H "Authorization: Bearer secret123" \
                     http://localhost:3000/todos | grep -q '\\['
                '''
            }
        }

        /* 9️⃣  Manual promotion gate --------------------------------------- */
        stage('Promote to Production') {
            when { beforeAgent true; expression { params.PROMOTE_TO_PROD } }
            steps {
                echo "Here you would push ${IMAGE_NAME} to a registry and deploy to prod."
            }
        }
    }

    /* ---------- parameters ---------------------------------------------- */
    parameters {
        booleanParam(
            name: 'PROMOTE_TO_PROD',
            defaultValue: false,
            description: 'Tick when you are ready to deploy to production'
        )
    }

    /* ---------- post-build housekeeping --------------------------------- */
    post {
        always { archiveArtifacts artifacts: 'coverage/**/*.*', fingerprint: true }
    }
}
