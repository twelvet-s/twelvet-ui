pipeline {
  agent any
  tools {
    nodejs 'nodejs'
  }
  parameters {
    choice(
      description: '是否安装依赖?',
      name: 'isInstall',
      choices: ['false', 'true']
    )
  }

  stages {
    stage('install twelvet-react-ui') {
      when {
        expression { isInstall ==~ /(true)/ }
      }
      steps {
        dir('twelvet-react-ui') {
          sh 'node -v'
          sh 'npm config set sass_binary_site=https://npm.taobao.org/mirrors/node-sass'
          sh 'npm cache clean --force'
          sh 'npm install'
        }
      }
    }
    stage('Build twelvet-react-ui') {
      steps {
        dir('twelvet-react-ui') {
          sh 'rm -rf node_modules'
          sh 'rm -rf package-lock.json'
          sh 'rm -rf dist'
          sh 'npm build'
          dir('dist') {
            sh(script: 'tar cvzf twelvet-react-ui.tar.gz .', returnStatus: true)
            archiveArtifacts artifacts: '**/*.tar.gz', fingerprint: true
          }
        }
      }
    }
  }
}

node {
  if (env.BRANCH_NAME.contains('dev')) {
    def remote = [:]
    remote.name = 'twelvet'
    remote.host = env.REMOTE_HOST
    remote.port = 22
    withCredentials([usernamePassword(credentialsId: 'twelvet', passwordVariable: 'password', usernameVariable: 'userName')]) {
      remote.user = userName
      remote.password = password
      remote.allowAnyHosts = true
      stage('push to twelvet-react-ui') {
        sshPut remote: remote, from: 'twelvet-react-ui/dist/twelvet-react-ui.tar.gz', into: '/twelvet/docker/nginx/html/'
        sshCommand remote: remote, command: 'tar xvzf /twelvet/docker/nginx/html/twelvet-react-ui.tar.gz -C /twelvet/docker/nginx/html/'
      }
    }
  }
}




