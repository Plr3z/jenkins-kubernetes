/**
 * Jenkinsfile Declarativo para CI/CD de aplicação Node.js no OpenShift.
 * Utiliza o recurso 'BuildConfig' do OpenShift para realizar o build da imagem.
 */

pipeline {
    // Usamos 'any', mas o agente precisa ter acesso ao 'oc' CLI (padrão em agentes OpenShift).
    agent any 
    
    // ========================================================================
    // VARIÁVEIS DE AMBIENTE
    // ========================================================================
    environment {
        OPENSHIFT_PROJECT = 'teste'     // Seu projeto
        APP_NAME = 'meu-app-node'       // Nome do BuildConfig, ImageStream e DeploymentConfig
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
        // ESTÁGIO 2: INICIAR BUILD NO OPENSHIFT (DOCKER/S2I)
        // ====================================================================
        stage('Start OpenShift Build') {
            steps {
                script {
                    echo "Disparando Build (BuildConfig: ${APP_NAME}) no OpenShift."
                    
                    openshift.withProject(env.OPENSHIFT_PROJECT) {
                        
                        // 1. Seleciona o BuildConfig
                        def bc = openshift.selector("bc", "${APP_NAME}")
                        
                        // 2. Inicia o build
                        // Usamos '.start('--wait')' para bloquear e aguardar o OpenShift Build terminar.
                        echo "Aguardando o build do OpenShift ser concluído..."
                        bc.start('--wait') 

                        // 3. Verifica o status do último build
                        def latestBuild = openshift.selector('build').withLatest()
                        if (latestBuild.object().status.phase != 'Complete') {
                             error "Build no OpenShift falhou! Status: ${latestBuild.object().status.phase}"
                        }
                        
                        echo "Build OpenShift concluído com sucesso!"
                    }
                }
            }
        }

        // ====================================================================
        // ESTÁGIO 3: DEPLOY NO OPENSHIFT
        // ====================================================================
        stage('Deploy to OpenShift') {
            steps {
                script {
                    echo "Iniciando Implantação no OpenShift..."
                    
                    // O OpenShift Build já enviou a nova imagem para o ImageStream.
                    // Se o DeploymentConfig for configurado para reagir ao ImageStream,
                    // ele já pode ter iniciado automaticamente. 
                    // No entanto, para forçar o processo e monitorar, fazemos o rollout manual.
                    openshift.withProject(env.OPENSHIFT_PROJECT) {
                        echo "Disparando novo rollout para o DeploymentConfig: ${APP_NAME}"
                        
                        // Força o DeploymentConfig a usar a imagem mais recente
                        openshift.selector('dc', "${APP_NAME}").rollout().latest()
                        
                        echo "Deployment iniciado. Aguardando conclusão..."
                        // Espera o rollout terminar para finalizar o Pipeline
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
            echo 'Pipeline concluída com SUCESSO! Build e Deploy OpenShift finalizados.'
        }
        failure {
            echo 'Pipeline FALHOU! Verifique o log do Build no OpenShift (oc logs bc/meu-app-node).'
        }
    }
}/**
 * Jenkinsfile Declarativo para CI/CD de aplicação Node.js no OpenShift.
 * Utiliza o recurso 'BuildConfig' do OpenShift para realizar o build da imagem.
 */

pipeline {
    // Usamos 'any', mas o agente precisa ter acesso ao 'oc' CLI (padrão em agentes OpenShift).
    agent any 
    
    // ========================================================================
    // VARIÁVEIS DE AMBIENTE
    // ========================================================================
    environment {
        OPENSHIFT_PROJECT = 'teste'     // Seu projeto
        APP_NAME = 'meu-app-node'       // Nome do BuildConfig, ImageStream e DeploymentConfig
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
        // ESTÁGIO 2: INICIAR BUILD NO OPENSHIFT (DOCKER/S2I)
        // ====================================================================
        stage('Start OpenShift Build') {
            steps {
                script {
                    echo "Disparando Build (BuildConfig: ${APP_NAME}) no OpenShift."
                    
                    // A CORREÇÃO ESTÁ AQUI: Envolver com openshift.withCluster()
                    openshift.withCluster() {
                        openshift.withProject(env.OPENSHIFT_PROJECT) {
                            
                            // 1. Seleciona o BuildConfig
                            def bc = openshift.selector("bc", "${APP_NAME}")
                            
                            // 2. Inicia o build
                            echo "Aguardando o build do OpenShift ser concluído..."
                            bc.start('--wait') 

                            // 3. Verifica o status do último build
                            def latestBuild = openshift.selector('build').withLatest()
                            if (latestBuild.object().status.phase != 'Complete') {
                                 error "Build no OpenShift falhou! Status: ${latestBuild.object().status.phase}"
                            }
                            
                            echo "Build OpenShift concluído com sucesso!"
                        }
                    }
                }
            }
        }

        // ====================================================================
        // ESTÁGIO 3: DEPLOY NO OPENSHIFT
        // ====================================================================
        stage('Deploy to OpenShift') {
            steps {
                script {
                    echo "Iniciando Implantação no OpenShift..."
                    
                    // A CORREÇÃO ESTÁ AQUI: Envolver com openshift.withCluster()
                    openshift.withCluster() {
                        openshift.withProject(env.OPENSHIFT_PROJECT) {
                            echo "Disparando novo rollout para o DeploymentConfig: ${APP_NAME}"
                            
                            // Força o DeploymentConfig a usar a imagem mais recente
                            openshift.selector('dc', "${APP_NAME}").rollout().latest()
                            
                            echo "Deployment iniciado. Aguardando conclusão..."
                            // Espera o rollout terminar para finalizar o Pipeline
                            openshift.selector('dc', "${APP_NAME}").rollout().status('--watch=true')
                            echo "Deployment concluído com sucesso!"
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
            echo 'Pipeline concluída com SUCESSO! Build e Deploy OpenShift finalizados.'
        }
        failure {
            echo 'Pipeline FALHOU! Verifique o log do Build no OpenShift (oc logs bc/meu-app-node).'
        }
    }
}