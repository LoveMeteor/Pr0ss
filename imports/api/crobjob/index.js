import { SyncedCron } from 'meteor/percolate:synced-cron'
import backupEmailAttachments from './backupEmailAttachments'
import { observeGoogleFile, registerCallback } from './editGoogleFile'

//SyncedCron.add({
  //name: 'observe google file',
  //schedule: parser => parser.text('every 5 minutes'),
  //job: observeGoogleFile,
//})

//SyncedCron.add({
  //name: 'register callback',
  //schedule: parser => parser.text('every 1 hours'),
  //job: registerCallback,
//})

SyncedCron.start()
