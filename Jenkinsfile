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
          sh 'rm -rf node_modules'
          sh 'rm -rf package-lock.json'
          sh 'npm install --unsafe-perm'
        }
      }
    }
    stage('Build staging') {
      when {
        beforeAgent true
        branch 'dev*'
      }
      steps {
        dir('twelvet-react-ui') {
          sh 'rm -rf dist'
          sh 'npm run build:stage'
          dir('dist') {
            sh(script: 'tar cvzf twelvet-react-ui.tar.gz .', returnStatus: true)
            archiveArtifacts artifacts: '**/*.tar.gz', fingerprint: true
          }
        }
      }
    }
    stage('Build prod') {
      when {
        beforeAgent true
        branch 'master*'
      }
      steps {
        dir('twelvet-react-ui') {
          sh 'rm -rf dist'
          sh 'npm run build:prod'
          dir('dist') {
            sh(script: 'tar cvzf vue-shh-twelvet-react-ui.tar.gz .', returnStatus: true)
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
    withCredentials([usernamePassword(credentialsId: 'twelvet', passwordVariable: 'password', usernameVariable: 'userName')]) {
      remote.user = userName
      remote.password = password
      remote.allowAnyHosts = true
      stage('push to twelvet-react-ui') {
        sshPut remote: remote, from: 'twelvet-react-ui/dist/twelvet-react-ui.tar.gz', into: '/data/docker/nginx/html/twelvet/.'
        sshCommand remote: remote, command: 'tar xvzf /data/docker/nginx/html/twelvet/vue-shh-admin-ui.tar.gz -C /data/docker/nginx/html/twelvet'
      }
    }
  }
}




