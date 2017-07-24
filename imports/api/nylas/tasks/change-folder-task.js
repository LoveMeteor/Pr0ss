import _ from 'underscore';
import ChangeMailTask from './change-mail-task';
import SyncbackCategoryTask from './syncback-category-task';

// Public: Create a new task to apply labels to a message or thread.
//
// Takes an options object of the form:
//   - folder: The {Folder} or {Folder} IDs to move to
//   - threads: An array of {Thread}s or {Thread} IDs
//   - threads: An array of {Message}s or {Message} IDs
//   - undoData: Since changing the folder is a destructive action,
//   undo tasks need to store the configuration of what folders messages
//   were in. When creating an undo task, we fill this parameter with
//   that configuration
//
export default class ChangeFolderTask extends ChangeMailTask {

    constructor(options = {}) {
        super(options);
        this.taskDescription = options.taskDescription;
        this.folder = options.folder;
    }

    label() {
        if (this.folder) {
            return `Moving to ${this.folder.display_name}…`;
        }
        return "Moving to folder…";
    }

    categoriesToAdd() {
        return [this.folder];
    }

    description() {
        if (this.taskDescription) {
            return this.taskDescription;
        }

        let folderText = "";
        //if (this.folder instanceof Category) {
            folderText = ` to ${this.folder.display_name}`;
        //}

        if (this.threads.length > 0) {
            if (this.threads.length > 1) {
                return `Moved ${this.threads.length} threads${folderText}`;
            }
            return `Moved 1 thread${folderText}`;
        }
        if (this.messages.length > 0) {
            if (this.messages.length > 1) {
                return `Moved ${this.messages.length} messages${folderText}`;
            }
            return `Moved 1 message${folderText}`;
        }
        return `Moved objects${folderText}`;
    }

    isDependentOnTask(other) {
        return (other instanceof SyncbackCategoryTask);
    }

    performLocal() {
        if (!this.folder) {
            return Promise.reject(new Error("Must specify a `folder`"))
        }
        if (this.threads.length > 0 && this.messages.length > 0) {
            return Promise.reject(new Error("ChangeFolderTask: You can move `threads` or `messages` but not both"))
        }
        if (this.threads.length === 0 && this.messages.length === 0) {
            return Promise.reject(new Error("ChangeFolderTask: You must provide a `threads` or `messages` Array of models or IDs."))
        }

        return super.performLocal();
    }

    processNestedMessages() {
        return false;
    }

    changesToModel(model) {
        if (model.object == 'thread') {
            return {folders: [this.folder]}
        }
        if (model.object == 'message') {
            return {folders: [this.folder]}
        }
        return null;
    }

    requestBodyForModel(model) {
        if (model.object == 'thread') {
            return {folder: model.folders[0] ? model.folders[0].id : null};
        }
        if (model.object == 'message') {
            return {folder: model.folder ? model.folder.id : null};
        }
    }
}
