pipeline{
    agent any 
    environment {
        BASH = 'C:\\Users\\Anirudh\\AppData\\Local\\Programs\\Git\\bin\\bash.exe'
        
    }
    stages{
        stage('installation'){
            steps{
                bat "${env.BASH} scripts/install-deps.sh"
                echo "done with install?"
            }
            
        }
        stage('run on 127.0.0.1'){
            steps{
                bat "${env.BASH} scripts/run-dev.sh"
                echo "finished" 
            }
            
        }
        stage('Wait for User Confirmation') {
            steps {
                script {
                    def userInput = input(
                        message: 'Services are running. Press Proceed when ready to stop them.',
                        parameters: [
                            booleanParam(name: 'Proceed', defaultValue: false, description: 'Check this box and click Proceed to stop services.')
                        ]
                    )
                }
            }
        }
        stage('killing processes'){
            steps{
                script{
                    bat "${env.BASH} scripts/cleanup.sh"
                }
            }
        }
    }
}