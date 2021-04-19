import * as core from '@actions/core'
import simpleGit, {GitError, SimpleGit, TagResult} from 'simple-git';
import { SemVer } from 'semver';

async function run(): Promise<void> {
  try {
    const git: SimpleGit = simpleGit()
    let version: SemVer;
    const tags: TagResult = await git.tags()
    if (tags.latest === undefined) {
      version = new SemVer("0.0.1")
      core.debug(version.format());
    } else {
      version = new SemVer(tags.latest)
      version.inc('patch')
    }

    await git.addTag(version.format()).then((value: { name: string; }) => {
      console.log("addTag result: " + value['name'])

      // push the tag
      git.push('origin', value['name']).then((success) => {
        console.log('tag successfully pushed');
      }).catch((error: GitError) => {
        console.log("push tag failed: " + error);
        core.setFailed(error.message)
      });

    }).catch((error : GitError) => {
      console.log("addTag failed: " + error)
      core.setFailed(error.message)
    })

  } catch (error) {
    core.setFailed(error.message)
  }
}

run()
