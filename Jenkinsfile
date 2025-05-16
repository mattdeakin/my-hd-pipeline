pipeline {
    agent any

    tools {
        jdk    'JDK17'
        nodejs 'NodeJS'
    }

    /* ── global env ─────────────────────────────────────────────── */
    environment {
    /* Prepend /usr/local/bin so Jenkins can see Docker */
        PATH="/usr/local/bin:${env.PATH}"
    }

    /* ── stages ─────────────────────────────────────────────────── */
    stages {

        stage('Debug Docker availability') {
            steps {
                sh 'echo PATH=$PATH'
                sh 'which docker || true'
                sh 'docker version || true'
            }
        }

        /* 1️⃣  CHECKOUT */
        stage('Checkout') {
            steps { checkout scm }
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
            steps { sh 'npm test' }
            post { always { junit 'coverage/**/*.xml' } }   // harmless if file isn’t there
        }

        /* 4️⃣  CODE QUALITY */
        stage('SonarCloud Analysis') {
            steps {
                withCredentials([string(credentialsId: 'SONAR_TOKEN',
                                        variable: 'SONAR_TOKEN')]) {
                    script {
                        def scannerHome = tool 'SonarScanner'
                        sh "${scannerHome}/bin/sonar-scanner -Dsonar.login=$SONAR_TOKEN"
                    }
                }
            }
        }

        /* 5️⃣  SECURITY */
        stage('NPM Audit (Security Scan)') {
            steps { sh 'npm audit --audit-level=high || true' }
        }

        /* 6️⃣  DEPLOY (staging via Compose) */
        stage('Deploy to Staging') {
            steps { sh 'docker-compose up -d' }
        }

        /* 7️⃣  RELEASE (manual approval → prod) */
        stage('Promote to Production') {
            when { beforeAgent true; expression { params.PROMOTE_TO_PROD } }
            steps {
                echo "Pretend we’re pushing ${IMAGE_NAME} to prod Kubernetes/EC2..."
            }
        }

        /* 8️⃣  MONITORING */
        stage('Smoke test /health') {
            steps {
                sh 'curl --retry 5 --retry-connrefused http://localhost:3000/ | grep Hello'
            }
        }
    }

    /* ── parameters & post ──────────────────────────────────────── */
    parameters {
        booleanParam(name: 'PROMOTE_TO_PROD',
                     defaultValue: false,
                     description: 'Tick to deploy to production')
    }

    post {
        always {
            /* shut down any compose stack so ports free up for next run */
            sh 'docker-compose down || true'
            cleanWs()
        }
    }
}
