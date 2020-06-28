/* Copyright 2020 Tecnativa - Alexandre D. Díaz
 * License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl). */
 "use strict";


/**
 *  Execute various promises in sequential order and return a promise with all results
 *  Code from: https://decembersoft.com/posts/promises-in-serial-with-array-reduce/
 *
 * @param {Array[Promise]} tasks
 * @returns {Promise[Array]}
 */
function execSequentialPromises(tasks) {
    return tasks.reduce((promiseChain, currentTask) => {
        return promiseChain.then(chainResults => currentTask.then(currentResult => [...chainResults, currentResult]));
    }, Promise.resolve([]));
}
