import {spawnSync} from 'node:child_process';
const result=spawnSync(process.execPath,['node_modules/@wp-playground/cli/wp-playground.js','server','--help'],{stdio:'inherit'});process.exitCode=result.status??1;
