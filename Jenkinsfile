def runCmd(String command) {
  if (isUnix()) {
    sh command
  } else {
    bat command
  }
}

pipeline {
  agent any

  options {
    timestamps()
  }

  parameters {
    choice(
      name: 'SUITE',
      choices: ['fast', 'regression', 'parallel', 'full'],
      description: 'Which Jenkins execution lane to run'
    )
  }

  environment {
    HEADLESS = 'true'
    CI = 'true'
  }

  stages {
    stage('Checkout') {
      steps {
        checkout scm
      }
    }

    stage('Install') {
      steps {
        script {
          runCmd('npm ci')

          if (isUnix()) {
            runCmd('npx playwright install --with-deps chromium')
          } else {
            runCmd('npx playwright install chromium')
          }
        }
      }
    }

    stage('Typecheck') {
      steps {
        script {
          runCmd('npm run typecheck')
        }
      }
    }

    stage('Fast Lanes') {
      when {
        expression { params.SUITE == 'fast' || params.SUITE == 'full' }
      }
      parallel {
        stage('Smoke') {
          steps {
            script {
              runCmd('npm run test:smoke')
            }
          }
        }

        stage('API') {
          steps {
            script {
              runCmd('npm run test:api')
            }
          }
        }

        stage('Contract') {
          steps {
            script {
              runCmd('npm run test:contract')
            }
          }
        }
      }
    }

    stage('Parallel Safe Lane') {
      when {
        expression { params.SUITE == 'parallel' || params.SUITE == 'full' }
      }
      steps {
        script {
          runCmd('npm run test:parallel')
        }
      }
    }

    stage('Regression') {
      when {
        expression { params.SUITE == 'regression' || params.SUITE == 'full' }
      }
      steps {
        script {
          runCmd('npm run test:regression')
        }
      }
    }
  }

  post {
    always {
      archiveArtifacts artifacts: 'playwright-report/**,reports/**,test-results/**', allowEmptyArchive: true
      junit testResults: 'reports/results.xml', allowEmptyResults: true
    }
  }
}
