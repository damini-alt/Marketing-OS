import { execSync } from 'child_process';
import os from 'os';
import fs from 'fs';

try {
  console.log('Cleaning workflows directory and leftover docker/nginx files from dist...');
  fs.rmSync('dist/workflows', { recursive: true, force: true });
  fs.rmSync('dist/Dockerfile', { force: true });
  fs.rmSync('dist/nginx.conf', { force: true });

  console.log('Cleaning old dist.zip...');
  fs.rmSync('dist.zip', { force: true });

  console.log('Zipping project folder (dist), nginx.conf, and Dockerfile together...');
  if (os.platform() === 'win32') {
    // Compress dist directory, nginx.conf, and Dockerfile into dist.zip
    execSync('powershell -Command "Compress-Archive -Path dist, nginx.conf, Dockerfile -DestinationPath dist.zip -Force"');
  } else {
    execSync('zip -r dist.zip dist nginx.conf Dockerfile');
  }
  console.log('Successfully created dist.zip containing dist folder, nginx.conf, and Dockerfile!');
} catch (error) {
  console.error('Failed to create dist.zip:', error.message);
  process.exit(1);
}
