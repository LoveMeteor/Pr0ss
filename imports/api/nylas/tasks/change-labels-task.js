import _ from 'underscore';
import CategoryStore from '../category-store';
import AccountStore from '../account-store';
import ChangeMailTask from './change-mail-task';
import SyncbackCategoryTask from './syncback-category-task';

// Public: Create a new task to apply labels to a message or thread.
//
// Takes an options object of the form:
// - labelsToAdd: An {Array} of {Category}s or {Category} ids to add
// - labelsToRemove: An {Array} of {Category}s or {Category} ids to remove
// - threads: An {Array} of {Thread}s or {Thread} ids
// - messages: An {Array} of {Message}s or {Message} ids
export default class ChangeLabelsTask extends ChangeMailTask {

    constructor(options = {}) {
        super(options);
        this.labelsToAdd = options.labelsToAdd || [];
        this.labelsToRemove = options.labelsToRemove || [];
        this.taskDescription = options.taskDescription;
    }

    label() {
        return "Applying labels…";
    }

    categoriesToAdd() {
        return this.labelsToAdd;
    }

    categoriesToRemove() {
        return this.labelsToRemove;
    }

    description() {
        if (this.taskDescription) {
            return this.taskDescription;
        }
        let type = "thread";
        if (this.threads.length > 1) {
            type = "threads";
        }
        if (this.labelsToAdd.length === 1 && this.labelsToRemove.length === 0 && this.labelsToAdd[0] instanceof Category) {
            return `Added ${this.labelsToAdd[0].displayName} to ${this.threads.length} ${type}`;
        }
        if (this.labelsToAdd.length === 0 && this.labelsToRemove.length === 1 && this.labelsToRemove[0] instanceof Category) {
            return `Removed ${this.labelsToRemove[0].displayName} from ${this.threads.length} ${type}`;
        }
        return `Changed labels on ${this.threads.length} ${type}`;
    }

    isDependentOnTask(other) {
        return (other instanceof SyncbackCategoryTask);
    }

    // In Gmail all threads /must/ belong to either All Mail, Trash and Spam, and
    // they are mutually exclusive, so we need to make sure that any add/remove
    // label operation still guarantees that constraint
    _ensureAndUpdateLabels = (account, existingLabelsToAdd, existingLabelsToRemove = {}) => {
        const labelsToAdd = existingLabelsToAdd;
        let labelsToRemove = existingLabelsToRemove;

        const setToAdd = new Set(_.compact(_.pluck(labelsToAdd, 'name')));
        const setToRemove = new Set(_.compact(_.pluck(labelsToRemove, 'name')));

        if (setToRemove.has('all')) {
            if (!setToAdd.has('spam') && !setToAdd.has('trash')) {
                labelsToRemove = _.reject(labelsToRemove, label => label.name === 'all');
            }
        } else if (setToAdd.has('all')) {
            if (!setToRemove.has('trash')) {
                labelsToRemove.push(CategoryStore.getTrashCategory(account));
            }
            if (!setToRemove.has('spam')) {
                labelsToRemove.push(CategoryStore.getSpamCategory(account));
            }
        }

        if (setToRemove.has('trash')) {
            if (!setToAdd.has('spam') && !setToAdd.has('all')) {
                labelsToAdd.push(CategoryStore.getAllMailCategory(account));
            }
        } else if (setToAdd.has('trash')) {
            if (!setToRemove.has('all')) {
                labelsToRemove.push(CategoryStore.getAllMailCategory(account))
            }
            if (!setToRemove.has('spam')) {
                labelsToRemove.push(CategoryStore.getSpamCategory(account))
            }
        }

        if (setToRemove.has('spam')) {
            if (!setToAdd.has('trash') && !setToAdd.has('all')) {
                labelsToAdd.push(CategoryStore.getAllMailCategory(account));
            }
        } else if (setToAdd.has('spam')) {
            if (!setToRemove.has('all')) {
                labelsToRemove.push(CategoryStore.getAllMailCategory(account))
            }
            if (!setToRemove.has('trash')) {
                labelsToRemove.push(CategoryStore.getTrashCategory(account))
            }
        }

        // This should technically not be possible, but we like to keep it safe
        return {
            labelsToAdd: _.compact(labelsToAdd),
            labelsToRemove: _.compact(labelsToRemove),
        };
    }

    performLocal() {
        if (this.messages.length > 0) {
            return Promise.reject(new Error("ChangeLabelsTask: N1 does not support viewing or changing labels on individual messages."))
        }
        if (this.labelsToAdd.length === 0 && this.labelsToRemove.length === 0) {
            return Promise.reject(new Error("ChangeLabelsTask: Must specify `labelsToAdd` or `labelsToRemove`"))
        }
        if (this.threads.length > 0 && this.messages.length > 0) {
            return Promise.reject(new Error("ChangeLabelsTask: You can move `threads` or `messages` but not both"))
        }
        if (this.threads.length === 0 && this.messages.length === 0) {
            return Promise.reject(new Error("ChangeLabelsTask: You must provide a `threads` or `messages` Array of models or IDs."))
        }

        return super.performLocal()
    }

    processNestedMessages() {
        return false;
    }

    changesToModel(model) {
        const labelsToRemoveIds = _.pluck(this.labelsToRemove, 'id')

        let labels = _.reject(model.labels, ({id}) => labelsToRemoveIds.includes(id));
        labels = labels.concat(this.labelsToAdd);

        labels = _.uniq(labels, false, (label) => label.id);
        return {labels};
    }

    requestBodyForModel(model) {
        return {
            labels: model.labels.map(l => l.id),
        };
    }
}
