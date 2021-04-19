import * as core from '@actions/core'
import simpleGit, {PushResult, SimpleGit, TagResult} from 'simple-git'
import {SemVer} from 'semver'
import * as fs from 'fs'

declare let process: {
  env: {
    GITHUB_EVENT_PATH: string
  }
}

async function run(): Promise<void> {
  try {
    const ev = JSON.parse(
      fs.readFileSync(process.env.GITHUB_EVENT_PATH, 'utf8')
    )

    const prNum = ev.pull_request.number
    core.info(`GITHUB_EVENT_PATH: ${process.env.GITHUB_EVENT_PATH}`)
    core.info(`Content: ${JSON.stringify(ev)}`)
    core.info(`PR number: ${prNum}`)
  } catch (error) {
    core.info(error)
  }

  try {
    const git: SimpleGit = simpleGit()
    let version: SemVer
    const tags: TagResult = await git.tags()
    if (tags.latest === undefined) {
      version = new SemVer('0.0.1')
      core.info(version.format())
    } else {
      version = new SemVer(tags.latest)
      version.inc('patch')
    }

    // add the tag
    try {
      const value: {name: string} = await git.addTag(version.format())
      core.info(`addTag result: ${value['name']}`)

      // push the tag
      try {
        const pushResult: PushResult = await git.push('origin', value['name'])
        core.info(`tag successfully pushed to ${String(pushResult.repo)}`)
      } catch (error) {
        core.setFailed(error.message)
      }
    } catch (error) {
      core.setFailed(error.message)
    }
  } catch (error) {
    core.setFailed(error.message)
  }
}

run()
