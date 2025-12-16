pipeline {
    agent any 
    
    environment {
        OPENSHIFT_PROJECT = 'teste'     
        APP_NAME = 'meu-app-node'       
    }

    stages {
        stage('Checkout & Setup') {
            steps {
                echo "Iniciando Pipeline de CI/CD para ${APP_NAME} no projeto ${OPENSHIFT_PROJECT}"
            }
        }

        stage('Start OpenShift Build') {
            steps {
                script {
                    echo "Disparando Build (BuildConfig: ${APP_NAME}) no OpenShift."
                    
                    openshift.withCluster() {
                        openshift.withProject(env.OPENSHIFT_PROJECT) {
                            
                            def bc = openshift.selector("bc", "${APP_NAME}")
                            
                            echo "Aguardando o build do OpenShift ser concluído..."
                            bc.start('--wait') 

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

        stage('Deploy to OpenShift') {
            steps {
                script {
                    echo "Iniciando Implantação no OpenShift (Rollout Restart)..."
                    
                    openshift.withCluster() {
                        openshift.withProject(env.OPENSHIFT_PROJECT) {
                            
                            sh "oc rollout restart deployment/${APP_NAME} -n ${OPENSHIFT_PROJECT}"
                            echo "Rollout reiniciado para ${APP_NAME}."
                            
                            echo "Aguardando a conclusão do rollout..."
                            openshift.selector('deployment', "${APP_NAME}").rollout().status('--watch=true')
                            
                            echo "Deployment concluído com sucesso!"
                        }
                    }
                }
            }
        }
    }
    
    post {
        success {
            echo '✅ Pipeline concluída com SUCESSO! Build e Deploy OpenShift finalizados.'
        }
        failure {
            echo '❌ Pipeline FALHOU! Verifique o log do Build no OpenShift (oc logs bc/meu-app-node).'
        }
    }
}