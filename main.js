'use strict';

const { spawn } = require('child_process');
const core = require('@actions/core');

function docker(cmd) {
  const docker = spawn('docker', cmd);

  docker.stdout.on('data', data => {
    process.stdout.write(data);
  });
  docker.stderr.on('data', data => {
    process.stdout.write(data);
  });
  docker.on('close', code => {
    if (code != 0)
      core.setFailed(`Action failed with error ${code}`);
  });
}

// Generate label
const label = (core.getInput('version') == '' ? '' : `${core.getInput('version')}-`) + core.getInput('image');
console.log(`Using floryn90/hugo:${label}`);

// Prepare command
const command = core.getInput('command') == '' ? [] :
core.getInput('command').split(' ');

// Pull image
docker(['pull', `floryn90/hugo:${label}`]);

// Run build
docker(['run', '--rm' , '-i',
  '-v', `${process.env.GITHUB_WORKSPACE}/${core.getInput('source')}:/src`,
  '-v', `${process.env.GITHUB_WORKSPACE}/${core.getInput('target')}:/target`,
  '-e', `HUGO_ENV=${core.getInput('env')}`,
  '-e', `HUGO_PANDOC=${core.getInput('pandoc_command')}`,
  `floryn90/hugo:${label}`]
  .concat(command));
