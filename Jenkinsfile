/**
 * Jenkinsfile Declarativo para CI/CD de aplicação Node.js no OpenShift.
 * Utiliza o Dockerfile existente para construir e implantar a imagem.
 *
 * Requisito: O Jenkins precisa ter acesso aos plugins Docker Pipeline e OpenShift Pipeline.
 * Requisito: Os recursos básicos (DeploymentConfig/Service) da app (ex: 'meu-app-node') devem existir no OpenShift.
 */

pipeline {
    agent any
    
    // ========================================================================
    // VARIÁVEIS DE AMBIENTE
    // ========================================================================
    environment {
        // Nome da sua aplicação e dos recursos no OpenShift
        APP_NAME = 'meu-app-node' 
        
        // Tag da imagem. Usa o número da build do Jenkins para exclusividade
        IMAGE_TAG = "latest-${env.BUILD_NUMBER}"
        
        // Registro de Imagens (Endpoint interno do OpenShift ImageStream)
        // O env.OPENSHIFT_PROJECT é injetado pelo OpenShift Build/Pipeline Hook
        DOCKER_REGISTRY = "image-registry.openshift-image-registry.svc:5000/${env.OPENSHIFT_PROJECT}" 
        
        FULL_IMAGE_NAME = "${DOCKER_REGISTRY}/${APP_NAME}:${IMAGE_TAG}"
    }

    stages {
        // ====================================================================
        // ESTÁGIO 1: CHECKOUT
        // ====================================================================
        stage('Checkout Code') {
            steps {
                echo "Iniciando Pipeline de CI/CD para ${APP_NAME}"
                // O Jenkins já faz o checkout automático do SCM.
                // Aqui você poderia adicionar testes unitários, se houver.
            }
        }

        // ====================================================================
        // ESTÁGIO 2: BUILD DA IMAGEM DOCKER
        // ====================================================================
        stage('Build Docker Image') {
            steps {
                // Comando complexo Docker Pipeline DSL exige o bloco 'script'
                script {
                    echo "Construindo Imagem Docker: ${FULL_IMAGE_NAME}"
                    
                    // 1. Constrói a imagem Docker localmente usando o 'Dockerfile'
                    // O ponto '.' indica que o Dockerfile e o contexto de build estão na raiz.
                    docker.build("${APP_NAME}:${IMAGE_TAG}", "-f Dockerfile .")
                    
                    // 2. Autentica e Registra a imagem no Registro Interno do OpenShift
                    docker.withRegistry("https://${DOCKER_REGISTRY}", 'openshift-registry') {
                        // Faz o push da tag para o ImageStream do OpenShift
                        docker.image("${APP_NAME}:${IMAGE_TAG}").push()
                        echo "Imagem ${APP_NAME}:${IMAGE_TAG} pushada com sucesso."
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
                sh "oc tag ${APP_NAME}:${IMAGE_TAG} ${APP_NAME}:latest"
                
                // Comando complexo OpenShift Pipeline DSL exige o bloco 'script'
                script {
                    // Força o DeploymentConfig a reconhecer a nova imagem taggeada (latest)
                    openshift.withCluster() {
                        openshift.withProject(env.OPENSHIFT_PROJECT) {
                            echo "Disparando novo rollout para o DeploymentConfig: ${APP_NAME}"
                            openshift.selector('dc', "${APP_NAME}").rollout().latest()
                            echo "Deployment iniciado. Aguardando conclusão..."
                            // Opcional: Adicionar um openshift.selector('dc', "${APP_NAME}").rollout().status() aqui se quiser aguardar
                        }
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
            echo 'Pipeline FALHOU! Verifique os logs e o status do build.'
        }
    }
}