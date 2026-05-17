pipeline {
    agent any

    tools {
        nodejs 'NodeJS'
    }

    stages {
        stage('Descargar Código') {
            steps {
                echo 'Obteniendo el código de GitHub...'
                checkout scm
            }
        }

        stage('Instalar Dependencias') {
            steps {
                echo 'Instalando node_modules...'
                sh 'npm install'
            }
        }

        stage('Desplegar API') {
            steps {
                echo 'Levantando el servidor con PM2...'
                sh 'pm2 restart GlucoTrack-API || pm2 start server.js --name "GlucoTrack-API"'
            }
        }
    }
}