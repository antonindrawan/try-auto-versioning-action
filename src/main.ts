import * as core from '@actions/core'
import {wait} from './wait'
import simpleGit, {GitError, SimpleGit, StatusResult, TagResult} from 'simple-git';
import { SemVer } from 'semver';
import { getUnpackedSettings } from 'node:http2';

async function run(): Promise<void> {
  try {
    const ms: string = core.getInput('milliseconds')
    core.debug(`Waiting ${ms} milliseconds ...`) // debug is only output if you set the secret `ACTIONS_RUNNER_DEBUG` to true

    core.debug(new Date().toTimeString())
    await wait(parseInt(ms, 10))
    core.debug(new Date().toTimeString())

    const git: SimpleGit = simpleGit()

    core.setOutput('time', new Date().toTimeString())

    let version: SemVer;
    const tags: TagResult = await git.tags()
    if (tags.latest === undefined) {
      version = new SemVer("0.0.1")
      core.debug(version.format());
    } else {
      version = new SemVer(tags.latest)
      version.inc('patch')
      core.debug("latest tag: " + version.format());
    }

    await git.addTag(version.format()).then((value: { name: string; }): void => {
      console.log("addTag result: " + value['name'])
      git.push('origin', value['name']).then((success) => {
        console.log('repo successfully pushed');
      }).catch((error: GitError) => {
        console.log('repo push failed: ' + error);
      });

    }).catch((error : GitError) : void => {

    })
    //console.log(status.isClean());

  } catch (error) {
    core.setFailed(error.message)
  }
}

run()
