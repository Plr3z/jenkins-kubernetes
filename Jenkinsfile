pipeline {
  agent any

  environment {
    APP_NAME = "meu-app-node"
    PROJECT  = "teste" // Corrigido para "teste" conforme seu projeto
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

              // 1. Inicia o Build Binário no OpenShift (--from-dir) e aguarda com --follow
              openshift.startBuild(
                APP_NAME,
                "--from-dir=.",
                "--follow"
              )

              echo "Build finalizado, iniciando rollout"

              // 2. CORREÇÃO PRINCIPAL: Usa 'oc rollout restart' para forçar o Deployment (K8s) a atualizar
              sh "oc rollout restart deployment/${APP_NAME} -n ${PROJECT}"
              
              echo "Rollout iniciado. Aguardando o novo Deployment ficar pronto..."

              // 3. Aguarda o Deployment concluir (status)
              openshift.selector('deployment', APP_NAME).rollout().status('--watch=true')
              
              echo "Deployment concluído com sucesso!"
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
      echo "Pipeline FALHOU! Verifique o log do BuildConfig ${APP_NAME} no projeto ${PROJECT}"
    }
  }
}