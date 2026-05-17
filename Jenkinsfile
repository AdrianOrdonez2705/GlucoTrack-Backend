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
                bat 'npm install'
            }
        }

       stage('Desplegar API') {
            steps {
                echo 'Levantando el servidor con PM2...'
                bat 'set PORT=3000 && pm2 restart GlucoTrack-API --update-env || set PORT=3000 && pm2 start server.js --name "GlucoTrack-API"'
            }
        }
    }
}