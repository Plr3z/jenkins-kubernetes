pipeline {
  agent any

  environment {
    APP_NAME = "meu-app-node"
    PROJECT  = "teste"
  }

  stages {

    stage('Checkout SCM') {
      steps {
        checkout scm
      }
    }

    stage('Build & Deploy no OpenShift') {
      steps {
        script {
          openshift.withCluster() {
            openshift.withProject(PROJECT) {

              echo "Disparando build do ${APP_NAME} no projeto ${PROJECT}"

              openshift.startBuild(
                APP_NAME,
                "--from-dir=.",
                "--follow"
              )

              echo "Build finalizado, iniciando rollout"

              openshift.selector("dc", APP_NAME).rollout().latest()
            }
          }
        }
      }
    }
  }

  post {
    success {
      echo "Pipeline executado com sucesso 🚀"
    }
    failure {
      echo "Pipeline FALHOU! Verifique o BuildConfig ${APP_NAME}"
    }
