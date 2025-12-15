/**
 * Jenkinsfile para aplicação Node.js no OpenShift
 * Assume que o Cluster OpenShift está configurado e o Jenkins está rodando.
 * Necessita que o DeploymentConfig/Service da sua app (ex: 'meu-app-node') já exista.
 */

pipeline {
    agent any
    
    // Variáveis importantes
    environment {
        // Nome da sua aplicação e dos recursos no OpenShift
        APP_NAME = 'meu-app-node' 
        // Tag da imagem. Usaremos o número da build do Jenkins para exclusividade
        IMAGE_TAG = "latest-${env.BUILD_NUMBER}"
        // Registro de Imagens (ex: registro interno do OpenShift - ImageStream)
        DOCKER_REGISTRY = "image-registry.openshift-image-registry.svc:5000/${env.OPENSHIFT_PROJECT}" 
        FULL_IMAGE_NAME = "${DOCKER_REGISTRY}/${APP_NAME}:${IMAGE_TAG}"
    }

    stages {
        stage('Checkout Code') {
            steps {
                echo "Fetching source code..."
                // O SCM (Source Control Management) do Jenkins fará o checkout automático.
                // Aqui podemos adicionar qualquer outra preparação de código se necessário.
            }
        }

        stage('Build Docker Image') {
            steps {
                script {
                    echo "Building Docker Image: ${FULL_IMAGE_NAME}"
                    
                    // 1. Constrói a imagem Docker localmente no Workspace do Jenkins
                    // O Dockerfile já deve estar na raiz.
                    docker.build("${APP_NAME}:${IMAGE_TAG}", "-f Dockerfile .")
                    
                    // 2. Registra a imagem no Registro Interno do OpenShift
                    // Usa o cliente 'docker' do Jenkins e as credenciais fornecidas pelo OpenShift.
                    docker.withRegistry("https://${DOCKER_REGISTRY}", 'openshift-registry') {
                        // Força o push da tag para o ImageStream do OpenShift
                        docker.image("${APP_NAME}:${IMAGE_TAG}").push()
                    }
                }
            }
        }

        stage('Deploy to OpenShift') {
            steps {
                // Comando para taggear a imagem recém-construída no ImageStream interno do OpenShift
                sh "oc tag ${APP_NAME}:${IMAGE_TAG} ${APP_NAME}:latest"
                
                echo "Starting OpenShift Deployment..."
                // Dispara o deployment usando a nova tag 'latest'
                openshift.withCluster() {
                    openshift.withProject(env.OPENSHIFT_PROJECT) {
                        // Isso força o DeploymentConfig a usar a nova imagem taggeada
                        openshift.selector('dc', "${APP_NAME}").rollout().latest()
                    }
                }
            }
        }
    }
}