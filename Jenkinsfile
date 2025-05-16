pipeline {
    agent any

    tools {
        jdk    'JDK17'
        nodejs 'NodeJS'
    }

    /* ── global env ─────────────────────────────────────────────── */
    environment {
        /* Prepend /usr/local/bin so Jenkins can see Docker.
           Using PATH+SUFFIX syntax as recommended by Jenkins (see JENKINS-41339)
           to correctly prepend to the PATH variable after tool paths are also added.
        */
        PATH+USR_LOCAL_BIN = "/usr/local/bin"
    }

    /* ── stages ─────────────────────────────────────────────────── */
    stages {

        stage('Debug Docker availability') {
            steps {
                sh 'echo "Effective PATH inside shell is: $PATH"'
                sh 'which sh' // Should now find sh
                sh 'which docker || echo "docker not found in PATH, will likely fail later stages"'
                sh 'docker version || echo "docker version command failed or docker not found"'
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
                sh 'npm run docker-build' // This step might define IMAGE_NAME and tag.
                                          // If it does, ensure it's accessible for later stages,
                                          // possibly by writing to a file or exporting.
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
                        // Ensure a tool named 'SonarScanner' is configured in Jenkins Global Tool Configuration
                        // The type might be 'hudson.plugins.sonar.SonarRunnerInstallation'
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
            steps {
                // Assuming docker-compose is in the PATH (e.g., /usr/local/bin or installed via Node)
                sh 'docker-compose up -d'
            }
        }

        /* 7️⃣  RELEASE (manual approval → prod) */
        stage('Promote to Production') {
            when { beforeAgent true; expression { params.PROMOTE_TO_PROD } }
            steps {
                // IMAGE_NAME should be defined, e.g., in environment block or from build step.
                // Using env.IMAGE_NAME, default to a placeholder if not set.
                echo "Pretend we’re pushing ${env.IMAGE_NAME ?: 'your-default-image-name'} to prod Kubernetes/EC2..."
            }
        }

        /* 8️⃣  MONITORING */
        stage('Smoke test /health') {
            steps {
                // Add a small delay to allow services started by docker-compose to fully initialize
                sh 'sleep 15' // Adjusted sleep time, can be tuned
                // The stage name suggests /health, original curl was for /
                // Assuming /health is the correct endpoint.
                sh 'curl --retry 5 --retry-connrefused --retry-delay 5 http://localhost:3000/health | grep Hello'
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
            sh 'docker-compose down || true' // This also relies on sh and docker-compose being in PATH
            cleanWs()
        }
    }
}