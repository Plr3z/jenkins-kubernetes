/**
 * Jenkinsfile Declarativo para CI/CD de aplicação Node.js no OpenShift.
 * Utiliza o Dockerfile existente para construir e implantar a imagem.
 * * Configurado para o projeto OpenShift: 'teste'
 */

pipeline {
    // É recomendado usar um agente específico, como 'nodejs' ou 'maven', 
    // que o OpenShift provisiona com as ferramentas necessárias (docker, oc).
    agent any 
    
    // ========================================================================
    // VARIÁVEIS DE AMBIENTE
    // ========================================================================
    environment {
        // Nome do seu projeto OpenShift
        OPENSHIFT_PROJECT = 'teste' // <--- MODIFICADO para o nome do seu projeto!
        
        // Nome da sua aplicação e dos recursos no OpenShift (ImageStream, DC)
        APP_NAME = 'meu-app-node' 
        
        // Tag da imagem. Usa o número da build do Jenkins para exclusividade
        IMAGE_TAG = "latest-${env.BUILD_NUMBER}"
        
        // URL do Registro Interno do OpenShift (sem o projeto)
        DOCKER_REGISTRY_URL = "image-registry.openshift-image-registry.svc:5000"
        
        // Caminho completo da imagem: registry/project/app_name:tag
        // Note que o DOCKER_REGISTRY_URL não é usado diretamente aqui, mas sim no withRegistry, 
        // e o FULL_IMAGE_NAME é usado para o push.
        FULL_IMAGE_NAME = "${DOCKER_REGISTRY_URL}/${OPENSHIFT_PROJECT}/${APP_NAME}:${IMAGE_TAG}"
    }

    stages {
    
        // ====================================================================
        // ESTÁGIO 1: CHECKOUT
        // ====================================================================
        stage('Checkout & Setup') {
            steps {
                echo "Iniciando Pipeline de CI/CD para ${APP_NAME} no projeto ${OPENSHIFT_PROJECT}"
            }
        }

        // ====================================================================
        // ESTÁGIO 2: BUILD E PUSH DA IMAGEM DOCKER
        // ====================================================================
        stage('Build & Push Docker Image') {
            steps {
                script {
                    echo "Construindo Imagem Docker: ${FULL_IMAGE_NAME}"
                    
                    // 1. Constrói a imagem Docker localmente no agente Jenkins
                    // A tag usada localmente é APP_NAME:IMAGE_TAG
                    docker.build("${APP_NAME}:${IMAGE_TAG}", "-f Dockerfile .")
                    
                    // 2. Autentica e Registra a imagem no Registro Interno do OpenShift
                    // Usa a URL completa (com o projeto) e a credencial 'openshift-registry'
                    // A credencial 'openshift-registry' deve ter sido configurada previamente no Jenkins.
                    docker.withRegistry("https://${DOCKER_REGISTRY_URL}/${OPENSHIFT_PROJECT}", 'openshift-registry') {
                        
                        // Faz o push da tag para o ImageStream do OpenShift (ex: teste/meu-app-node:latest-N)
                        docker.image("${APP_NAME}:${IMAGE_TAG}").push() 
                        echo "Imagem ${APP_NAME}:${IMAGE_TAG} pushada com sucesso para o ImageStream."
                    }
                }
            }
        }

        // ====================================================================
        // ESTÁGIO 3: DEPLOY NO OPENSHIFT
        // ====================================================================
        stage('Deploy to OpenShift') {
            steps {
                echo "Iniciando Implantação no OpenShift..."
                
                // Primeiro, taggeia a nova imagem no ImageStream do OpenShift como 'latest'
                // Isso garante que o DeploymentConfig que monitora a tag 'latest' seja acionado.
                // O comando 'oc' é executado no agente Jenkins.
                sh "oc tag ${APP_NAME}:${IMAGE_TAG} ${APP_NAME}:latest -n ${OPENSHIFT_PROJECT}"
                
                script {
                    // Força o DeploymentConfig a reconhecer a nova imagem taggeada (latest)
                    openshift.withProject(env.OPENSHIFT_PROJECT) {
                        echo "Disparando novo rollout para o DeploymentConfig: ${APP_NAME}"
                        // Dispara o novo rollout no DeploymentConfig
                        openshift.selector('dc', "${APP_NAME}").rollout().latest()
                        
                        echo "Deployment iniciado. Aguardando conclusão..."
                        // Opcional: espera que o rollout termine
                        openshift.selector('dc', "${APP_NAME}").rollout().status('--watch=true')
                        echo "Deployment concluído com sucesso!"
                    }
                }
            }
        }
    }
    
    // ====================================================================
    // PÓS-CONSTRUÇÃO
    // ====================================================================
    post {
        success {
            echo 'Pipeline concluída com SUCESSO! Aplicação atualizada.'
        }
        failure {
            echo 'Pipeline FALHOU! Verifique os logs, o status do build e as credenciais.'
        }
    }
}