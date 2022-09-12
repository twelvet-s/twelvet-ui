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
        sh 'node -v'
        sh 'rm -rf node_modules'
        sh 'rm -rf yarn.lock'
        sh 'yarn'
      }
    }
    stage('Build prod') {
      when {
        beforeAgent true
        branch 'master*'
      }
      steps {
        sh 'rm -rf dist'
        sh 'yarn build'
        dir('dist') {
          sh(script: 'tar cvzf twelvet-react-ui.tar.gz .', returnStatus: true)
          archiveArtifacts artifacts: '**/*.tar.gz', fingerprint: true
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
        sshPut remote: remote, from: 'dist/twelvet-react-ui.tar.gz', into: '/twelvet/docker/nginx/html/twelvet-react-ui.tar.gz'
        sshCommand remote: remote, command: 'tar xvzf /twelvet/docker/nginx/html/twelvet-react-ui.tar.gz -C /twelvet/docker/nginx/html/'
      }
    }
  }
}




