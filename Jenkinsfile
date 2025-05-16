pipeline {
    agent any
    tools {
        jdk     'JDK17'    // needed only because you already have it configured
        nodejs  'NodeJS'
    }

    environment {
        environment {
        // “PATH+LOCAL” means “take the current PATH and prepend these paths”
        PATH+LOCAL = "/opt/homebrew/bin:/usr/local/bin"
    }

    stages {

        stage('Debug Docker availability') {
            steps { sh 'echo PATH=$PATH && which docker && docker version' }
        }

        /* 1️⃣  CHECKOUT (always) */
        stage('Checkout') {
            steps {
                /* Multibranch has already done the clone, but this keeps a
                visible stage in Blue Ocean.  Takes <1 s. */
                checkout scm
            }
        }

        /* 2️⃣  BUILD */
        stage('Build') {
            steps {
                sh 'npm ci'
                sh 'npm run docker-build'
            }
        }

        /* 3️⃣  TEST */
        stage('Test') {
            steps {
                sh 'npm test'
            }
            post {
                always { junit 'coverage/**/*.xml' }
            }
        }

        /* 4️⃣  CODE QUALITY */
        stage('SonarCloud Analysis') {
            steps {
                withCredentials([string(credentialsId: 'SONAR_TOKEN', variable: 'SONAR_TOKEN')]) {
                    script {                         // ← Imperative Groovy lives here
                        /* Ask Jenkins for the install path
                        The short form works because we named
                        the tool “SonarScanner” in Global Tools. */
                        def scannerHome = tool 'SonarScanner'

                        // Run the scanner binary
                        sh "${scannerHome}/bin/sonar-scanner " +
                        "-Dsonar.login=$SONAR_TOKEN"
                    }
                }
            }
        }

        /* 5️⃣  SECURITY */
        stage('NPM Audit (Security Scan)') {
            steps {
                sh 'npm audit --audit-level=high || true'
            }
        }

        /* 6️⃣  DEPLOY (staging via Compose) */
        stage('Deploy to Staging') {
            steps {
                sh 'docker-compose up -d'
            }
        }

        /* 7️⃣  RELEASE (manual approval → prod) */
        stage('Promote to Production') {
            when { beforeAgent true; expression { params.PROMOTE_TO_PROD == true } }
            steps {
                echo "Pretend we’re pushing ${IMAGE_NAME} to prod Kubernetes/EC2..."
            }
        }

        /* 8️⃣  MONITORING (optional for HD) */
        stage('Smoke test /health') {
            steps {
                sh 'curl --retry 5 --retry-connrefused http://localhost:3000/ | grep Hello'
            }
        }
    }

    parameters {
        booleanParam(name: 'PROMOTE_TO_PROD', defaultValue: false, description: 'Tick to deploy to production')
    }

    post {
        always { cleanWs() }
    }
}
