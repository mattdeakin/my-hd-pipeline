pipeline {
    agent any

    tools {
        jdk    'JDK17'
        nodejs 'NodeJS'
    }

    /* ── global env ───────────────────────────────────────────── */
    environment {
        /* prepend Homebrew & /usr/local to PATH for Jenkins user */
        PATH+LOCAL="/opt/homebrew/bin:/usr/local/bin"
    }

    /* ── stages ───────────────────────────────────────────────── */
    stages {

        /* 1️⃣  CHECKOUT (Multibranch already cloned, but keeps a stage) */
        stage('Checkout') {
            steps { checkout scm }
        }

        /* 2️⃣  BUILD  – just install deps */
        stage('Build') {
            steps { sh 'npm ci' }
        }

        /* 3️⃣  TEST  – Jest with coverage */
        stage('Test') {
            steps { sh 'npm test -- --coverage' }
            post { always { junit 'coverage/**/*.xml' /* ok if file missing */ } }
        }

        /* 4️⃣  CODE QUALITY – SonarCloud */
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

        /* 5️⃣  SECURITY – npm audit */
        stage('NPM Audit (Security Scan)') {
            steps { sh 'npm audit --audit-level=high || true' }
        }

        /* 6️⃣  RELEASE – stub for “high-HD” */
        stage('Promote to Production') {
            when { beforeAgent true; expression { params.PROMOTE_TO_PROD } }
            steps { echo 'Release placeholder – skipped on local Jenkins.' }
        }
    }

    /* ── params & post ───────────────────────────────────────── */
    parameters {
        booleanParam(name: 'PROMOTE_TO_PROD',
                     defaultValue: false,
                     description: 'Tick to run the release placeholder')
    }

    post { always { cleanWs() } }
}
