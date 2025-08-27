pipeline {
    agent {
        docker {
            image 'maven-terraform-node-agent:latest'
            args '-v /var/run/docker.sock:/var/run/docker.sock'
        }
    }

    environment {
        EC2_INSTANCE_IP     = '13.203.132.105'
        EC2_INSTANCE_USER   = 'ec2-user'
        DEPLOY_PATH         = '/home/ec2-user'
        AWS_REGION          = 'ap-south-1'
        TF_PLAN_FILE        = 'tfplan'
        SERVICE_NAME        = 'gfj-app.service'
        START_SCRIPT        = '/home/ec2-user/start.gfj.sh'
    }

    parameters {
        booleanParam(name: 'APPLY_TF', defaultValue: false, description: 'Apply Terraform changes?')
        booleanParam(name: 'DESTROY_TF', defaultValue: false, description: 'Destroy infrastructure instead of running pipeline?')
    }

    stages {
        stage('Terraform Destroy') {
            when { expression { return params.DESTROY_TF == true } }
            steps {
                echo "💣 Destroying infrastructure..."
                withAWS(credentials: 'GEMS-AWS', region: "${env.AWS_REGION}") {
                    dir('terraform-gem/environments/dev') {
                        sh '''
                            terraform init -input=false
                            terraform destroy -auto-approve
                        '''
                    }
                }
            }
        }

        stage('Terraform Init & Plan') {
            when { expression { return params.DESTROY_TF == false } }
            steps {
                echo "🌍 Initializing and planning Terraform..."
                withAWS(credentials: 'GEMS-AWS', region: "${env.AWS_REGION}") {
                    dir('terraform-gem/environments/dev') {
                        sh '''
                            terraform init -input=false
                            terraform plan -out=${TF_PLAN_FILE}
                        '''
                    }
                }
            }
        }

        stage('Terraform Apply') {
            when { expression { return params.APPLY_TF == true && params.DESTROY_TF == false } }
            steps {
                echo "🚀 Applying Terraform changes..."
                withAWS(credentials: 'GEMS-AWS', region: "${env.AWS_REGION}") {
                    dir('terraform-gem/environments/dev') {
                        sh '''
                            terraform apply -auto-approve ${TF_PLAN_FILE}
                        '''
                    }
                }
            }
        }

        stage('Build Backend') {
            when { expression { return params.DESTROY_TF == false } }
            steps {
                dir('gfj-be') {
                    sh 'echo "🔧 Checking Maven version..."'
                    sh 'mvn -v'

                    sh 'echo "🛠️ Building the Spring Boot project..."'
                    sh 'mvn clean package -DskipTests=true || exit 1'

                    sh 'echo "📦 Listing JARs in target directory..."'
                    sh 'ls -lh target/*.jar || echo "❌ No JAR found!"'

                    script {
                        def jarFile = sh(script: "ls target/*.jar | grep SNAPSHOT | head -n 1", returnStdout: true).trim()
                        env.JAR_NAME = jarFile.tokenize('/').last()
                        echo "📌 Detected JAR: ${env.JAR_NAME}"
                    }
                }
            }
        }

        stage('Build Frontend') {
            when { expression { return params.DESTROY_TF == false } }
            steps {
                dir('gfj-ui') {
                    sh '''
                        echo "🌐 Building React frontend..."
                        npm install
                        npm run build
                    '''
                }
            }
        }

        stage('Deploy Backend') {
            when { expression { return params.DESTROY_TF == false } }
            steps {
                echo "🚚 Deploying Spring Boot backend..."
                sshagent(credentials: ['ec2-creds']) {
                    sh """
                        scp -o StrictHostKeyChecking=no gfj-be/target/${JAR_NAME} ${EC2_INSTANCE_USER}@${EC2_INSTANCE_IP}:${DEPLOY_PATH}/

                        ssh -o StrictHostKeyChecking=no ${EC2_INSTANCE_USER}@${EC2_INSTANCE_IP} '
                            sed -i "s|java -jar .*\\.jar|java -jar ${DEPLOY_PATH}/${JAR_NAME}|g" ${START_SCRIPT}
                            echo "✅ Updated start.gfj.sh:"
                            grep "java -jar" ${START_SCRIPT}

                            chmod +x ${START_SCRIPT} &&
                            sudo systemctl daemon-reload &&
                            sudo systemctl enable ${SERVICE_NAME} &&
                            sudo systemctl restart ${SERVICE_NAME} &&
                            sudo systemctl status ${SERVICE_NAME} --no-pager -l
                        '
                    """
                }
            }
        }

        stage('Deploy Frontend') {
            when { expression { return params.DESTROY_TF == false } }
            steps {
                echo "🚚 Deploying React frontend..."
                sshagent(credentials: ['ec2-creds']) {
                    sh """
                        scp -o StrictHostKeyChecking=no -r gfj-ui/dist/* ${EC2_INSTANCE_USER}@${EC2_INSTANCE_IP}:/tmp/gfj-ui-dist/

                        ssh -o StrictHostKeyChecking=no ${EC2_INSTANCE_USER}@${EC2_INSTANCE_IP} '
                            sudo rm -rf /usr/share/nginx/html/*
                            sudo cp -r /tmp/gfj-ui-dist/* /usr/share/nginx/html/
                            sudo systemctl restart nginx
                            echo "✅ Frontend deployed to /usr/share/nginx/html"
                        '
                    """
                }
            }
        }
    }

    post {
        success { echo '✅ Job finished successfully!' }
        failure { echo '❌ Job failed. Check the logs for more details.' }
    }
}
