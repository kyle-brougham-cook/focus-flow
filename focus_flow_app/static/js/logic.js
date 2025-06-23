/**********************************************************************
 * File: logic.js
 * Purpose: Contains client-side logic for task management including:
 *   - Fetching tasks from the server
 *   - Creating, editing, deleting, and marking tasks as done
 *   - Syncing task state with the backend server
 **********************************************************************/

// Purpose: Define the client-side logic for the task management system

// Listener for DOM content load – initializes the task manager when the document is ready.
document.addEventListener('DOMContentLoaded', () => {
    let domain = window.location.origin;
    console.log(domain)

    // DOM is fully loaded; initialize task manager variables and event listeners.
    let focusFlow_task_list = document.getElementById('focusFlow_task_list'); // Container for tasks
    let focusFlow_task_add = document.getElementById('focusFlow_task_add_button'); // Button to add new tasks
    let task_counter = document.getElementById('amount_of_tasks'); // Displays count of tasks
    let task_list = document.getElementsByClassName('tasks'); // Collection of task items
    /**
     * Fetch tasks from the server and add them to the DOM.
     * Uses a GET request and iterates over the returned JSON data.
     */
    const get_tasks = () => {
        // Clear current task list in the DOM.
        task_list.innerHTML = '';
        fetch(`${domain}/task/dashboard`, {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            }
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            data.forEach((task, idex) => {
                make_task_gui(task.name, task, task.description, idex);
            })
        })
        .catch(error => {
            console.error('Error:', error);
        })
    };


    /**
     * Delete a task on the server via a DELETE request.
     * @param {string|number} task - The unique task ID.
     */
    const delete_tasks = (task) => {
        fetch(`${domain}/task/delete/${task}`, {
            method: 'DELETE',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            }
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            console.log(data);
        })
        .catch(error => {
            console.error('Error:', error);
        })
    };


    // Returns a promise resolving to the number of tasks in the database.
    const get_amount_of_db_tasks = async () => {
        return fetch(`${domain}/task/getTasksLength/`, {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Cache-Control': 'no-cache',
                'Accept': 'application/json'
            }

        })
        .then(response => {
            if (!response.ok) {
                throw new Error('network response was not okay!')
            }
            return response.json();
        })
        .then(data => {
            console.log(data)
            return data['amount'];
        })
        .catch(error => {
            console.error('Error', error);
            return 0;
        })
    };

    /**
     * Sends raw new task JSON data to the server using the form's action.
     * @param {FormData} form - Form data.
     * @param {string} id - Task ID.
     */
    const send_tasks = (form, id=0) => {
        let formData = new FormData(form);
        let data = {};
        formData.forEach((value, key) => {
            console.log(key, value)
            data[key] = value
        });
        data['id'] = Number(id);

        const method = form.getAttribute('data-method') || form.method;

        fetch(form.action, {
            method: method, // Use configured HTTP method.
            body: JSON.stringify(data),
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            }
        })
        .then(response => response.json())
        .then(data => {
            console.log(data);
        })
        .catch(error => {
            console.error('Error:', error);
        })
    };



    /**
     * Sends a PATCH request to mark a task as done or not done.
     * @param {string|number} task_id - Unique ID of the task.
     * @param {Object} value - Object containing the done state.
     */
    const done_tasks = (task_id, value) => {
        fetch(`${domain}/task/done/${task_id}`, {
            method: 'PATCH',
            credentials: 'include',
            body: JSON.stringify(value),
            headers: {
                'Content-Type': 'application/json'
            }
        })
        .then(response => {
            if(!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => console.log(data)) // Log successful update.
        .catch(error => console.error(error));
    };



    /**
     * Toggle the done state of a task.
     * Sets appropriate event listeners and adjusts styling.
     */
    const switchBtn = (elbutton, value) => {

        const onFalseClick = () => {
            const val = {'bool': false};
            elbutton.parentElement.style.textDecoration = '';
            elbutton.parentElement.style.color = 'black';
            task_amount();
            done_tasks(elbutton.parentElement.getAttribute('dbid'), val);
            elbutton.removeEventListener('click', onFalseClick);
            elbutton.addEventListener('click', onTrueClick);
        };

        const onTrueClick = () => {
            const val = {'bool': true};
            // Update visual style to indicate task completion.
            elbutton.parentElement.style.textDecoration = 'line-through';
            elbutton.parentElement.style.color = 'gray';
            task_amount();

            done_tasks(elbutton.parentElement.getAttribute('dbid'), val);
            elbutton.removeEventListener('click', onTrueClick);
            elbutton.addEventListener('click', onFalseClick);
        };

        if (value == false) {
            elbutton.addEventListener('click', onFalseClick);
        } else if (value == true) {
            elbutton.addEventListener('click', onTrueClick);
        }
    };

    /**
     * Attaches event listeners to "Done" buttons.
     * Applies done styling if the task is already completed.
     */
    const done_task_buttons = (buttons) => {
        for (let button of buttons) {
            // Avoid duplicate event listeners.
            if (!button.hasAttribute('isLinked')) {
                button.setAttribute('isLinked', 'true');
                if (button.parentElement.done) {
                    button.parentElement.style.textDecoration = 'line-through';
                    button.parentElement.style.color = 'gray';
                    switchBtn(button, false);
                } else {
                    switchBtn(button, true);
                }
            } else {
                continue;
            }
        }
    };

    /**
     * Iterates over delete buttons and attaches click event listeners.
     * Upon clicking, the task is removed from the DOM and the server.
     * @param {HTMLCollection} buttons - Collection of delete buttons.
     */
    const remove_task_buttons = (buttons) => {
        for (let button of buttons) {
            if (!button.hasAttribute('isLinked')) {
                button.setAttribute('isLinked', 'true');
                button.addEventListener('click', () => {
                    // Extract task ID and remove task element.
                    console.log(button.parentElement.getAttribute('dbId'));
                    button.parentElement.remove();
                    delete_tasks(button.parentElement.getAttribute('dbId'));
                    task_amount(); // Update counter after deletion.
                });
            }
        }
    };

    /**
     * Attaches click event listeners to "Edit" buttons.
     * Opens the task editor dialog on activation.
     * @param {HTMLCollection} buttons - Collection of edit buttons.
     */
    const edit_task_buttons = (buttons) => {
        for (let button of buttons) {
            if (!button.hasAttribute('isLinked')) {
                button.setAttribute('isLinked', 'true');
                button.addEventListener('click', (e) => {
                    e.preventDefault();
                    const task = button.parentElement;
                    edit_tasks_gui(task);
                });
            } else {
                continue;
            }
        }
    };

    /**
     * Updates the task counter displaying total and completed tasks.
     */
    const task_amount = () => {
        let tasks = document.getElementsByClassName('tasks'); // Get current task elements.
        let amount = tasks.length;
        let amount_done = 0;

        for (let task of tasks) {
            if (task.style.textDecoration === 'line-through') {
                amount_done++;
            }
        }
        task_counter.textContent = `${amount}/${amount_done}`;
    };

    /**
     * Creates a new task DOM element and appends it to the task list.
     * @param {string} name - Name of the task.
     * @param {Object|null} dbtask - Task object from the database.
     * @param {string|null} taskDiscription - Optional task description.
     */
    async function make_task_gui(name, dbtask=null, taskDiscription=null, idex=null, taskList=task_list) {
        let task = document.createElement('div'); // Create container for the task.
        if (dbtask != null) {
            task.id = `task_${idex}`;
            task.setAttribute('dbId', dbtask.id)
            task.name = dbtask.name;
            task.done = dbtask.done;
            task.classList.add('tasks');
            task.innerHTML = `
                <label id=task_label for="${task.id}">${dbtask.name}</label>
                <p id="description_${task.id}" class="description">${dbtask.description || ''}</p>
                <button class="task_edit" type="button" aria-label="edit_${task.name}">Edit</button>
                <button class="task_done" type="button" aria-label="done_${task.name}">Done</button>
                <button class="task_delete" type="button" aria-label="delete_${task.name}">Delete</button>
            `;
            focusFlow_task_list.appendChild(task); // Add task to the list.
            remove_task_buttons(document.getElementsByClassName('task_delete'));
            done_task_buttons(document.getElementsByClassName('task_done'));
            edit_task_buttons(document.getElementsByClassName('task_edit'));
            task_amount(); // Update task counter.

        } else {
            task.id = `task_${taskList && taskList.length ? taskList.length : 0}`;
            task.setAttribute('dbId', await get_amount_of_db_tasks())
            task.name = name;
            task.done = false;
            task.classList.add('tasks');
            task.innerHTML = `
                <label id=task_label for="${task.id}">${name}</label>
                <p id="description_${task.id}" class="description">${taskDiscription || ''}</p>
                <button class="task_edit" type="button" aria-label="edit_${task.name}">Edit</button>
                <button class="task_done" type="button" aria-label="done_${task.name}">Done</button>
                <button class="task_delete" type="button" aria-label="delete_${task.name}">Delete</button>
            `;
            focusFlow_task_list.appendChild(task);
            remove_task_buttons(document.getElementsByClassName('task_delete'));
            done_task_buttons(document.getElementsByClassName('task_done'), task.done);
            edit_task_buttons(document.getElementsByClassName('task_edit'));
            task_amount(); // Update task counter.
        }
    };

    /**
     * Opens a modal dialog to capture a new task's details.
     */
    const task_name_dialog = () => {
        let diag_box = document.createElement('dialog'); // Create dialog for user input.
        diag_box.id = 'input_dialog';

        let makeTaskForm = document.createElement('form');
        makeTaskForm.action = `${domain}/task/tasks`;
        makeTaskForm.id = 'new_task_form';
        makeTaskForm.method = 'POST';
        // Ensure the backend can handle both adding and editing tasks.

        let diag_box_label = document.createElement('label');
        diag_box_label.id = "new_task_dialog_label";
        diag_box_label.textContent = 'Add New Task';
        diag_box_label.htmlFor = 'input_dialog';
        makeTaskForm.appendChild(diag_box_label);

        // Create label and input for the task name.
        let label = document.createElement('label');
        label.textContent = 'Task Name';
        label.htmlFor = 'task_name_input_field';
        makeTaskForm.appendChild(label);

        let input = document.createElement('input');
        input.type = 'text';
        input.placeholder = 'Enter task name';
        input.id = 'task_name_input_field';
        input.name = 'name';
        input.required = true;
        makeTaskForm.appendChild(input);

        // Create label and textarea for the task description.
        let discLabel = document.createElement('label');
        discLabel.textContent = 'Task description';
        discLabel.htmlFor = 'description';
        makeTaskForm.appendChild(discLabel);

        let discInput = document.createElement('textarea');
        discInput.placeholder = "Enter your task description...";
        discInput.id = 'description';
        discInput.name = 'description';
        discInput.required = true;
        makeTaskForm.appendChild(discInput);

        // Create submit button.
        let submitButton = document.createElement('button');
        submitButton.textContent = 'Submit';
        submitButton.id = 'submitBtn';
        submitButton.type = 'submit';
        makeTaskForm.appendChild(submitButton);

        // Create cancel button.
        let cancelButton = document.createElement('button');
        cancelButton.textContent = 'Cancel';
        cancelButton.type = 'button';
        makeTaskForm.appendChild(cancelButton);

        diag_box.appendChild(makeTaskForm);

        diag_box.addEventListener('keypress', (e) => {
            if (e.key === 'Esc') {
                diag_box.close();
                diag_box.remove();
            }
        });

        makeTaskForm.addEventListener('submit', (event) => {
            event.preventDefault();
            event.stopPropagation();

            send_tasks(makeTaskForm);
            make_task_gui(input.value, null, discInput.value);
            // Close dialog after processing the form.
            diag_box.close();
            diag_box.remove();
            task_amount(); // Refresh task count.
        });

        cancelButton.addEventListener('click', (event) => {
            event.preventDefault();
            diag_box.close();
            diag_box.remove();
        });

        document.body.appendChild(diag_box);
        diag_box.showModal(); // Show input dialog as modal.
        input.focus(); // Focus the task name field.
    };

    /**
     * Opens a modal dialog to edit an existing task.
     * Updates the backend after confirmation.
     * @param {HTMLElement} task - The task element to be edited.
     */
    const edit_tasks_gui = (task) => {
        console.log('B'); // Debug: edit dialog initiated.
        const edit_task_dialog = document.createElement('dialog');
        edit_task_dialog.id = 'edit_tasks';

        let diag_edit_label = document.createElement('label');
        diag_edit_label.id = "edit_task_dialog_label";
        diag_edit_label.textContent = 'Edit Task';
        diag_edit_label.htmlFor = 'edit_tasks';
        edit_task_dialog.appendChild(diag_edit_label);

        const editTaskForm = document.createElement('form');
        editTaskForm.action = `${domain}/task/tasks`;
        editTaskForm.setAttribute('data-method', 'PATCH');
        editTaskForm.id = 'edit_task_form';

        const task_name_field_label = document.createElement('label');
        task_name_field_label.textContent = 'Task Name';
        task_name_field_label.htmlFor = 'new_task_name_field';
        editTaskForm.appendChild(task_name_field_label);

        const task_name_field = document.createElement('input');
        task_name_field.required = true;
        task_name_field.type = 'text';
        task_name_field.value = task.name;
        task_name_field.id = 'new_task_name_field';
        task_name_field.name = 'name';
        editTaskForm.appendChild(task_name_field);

        // Label for Task Description.
        const task_decription_field_label = document.createElement('label');
        task_decription_field_label.textContent = 'Task Description';
        task_decription_field_label.htmlFor = 'new_task_paragraph_field';
        editTaskForm.appendChild(task_decription_field_label);

        const task_paragraph_field = document.createElement('textarea');
        task_paragraph_field.name = 'description';
        task_paragraph_field.required = true;
        task_paragraph_field.value = task.querySelector('.description').textContent;
        task_paragraph_field.id = 'new_task_paragraph_field';
        editTaskForm.appendChild(task_paragraph_field);

        const confirmBtn = document.createElement('button');
        confirmBtn.type = 'submit';
        confirmBtn.id = 'confirmBtn';
        confirmBtn.textContent = "Confirm";
        editTaskForm.appendChild(confirmBtn);

        let cancelBtn = document.createElement('button');
        // Setup cancel button for the edit dialog.
        cancelBtn.type = 'button';
        cancelBtn.id = 'cancelBtn';
        cancelBtn.textContent = 'Cancel';
        editTaskForm.appendChild(cancelBtn);

        edit_task_dialog.addEventListener('keypress', (e) => {
            if (e.key === 'Esc') {
                edit_task_dialog.close();
                edit_task_dialog.remove();
            }
        });

        // Confirm edit: update task data and UI.
        editTaskForm.addEventListener('submit', async(e) => {
            e.preventDefault();
            send_tasks(editTaskForm, task.getAttribute('dbid'));
            edit_task_dialog.close();
            edit_task_dialog.remove();
            // Update task element with new values.
            task.querySelector('.description').textContent = task_paragraph_field.value;
            task.querySelector('#task_label').textContent = task_name_field.value;
        });

        // Cancel edit if requested by the user.
        cancelBtn.addEventListener('click', (e) => {
            e.preventDefault();
            edit_task_dialog.close();
            edit_task_dialog.remove();
        });

        edit_task_dialog.appendChild(editTaskForm);
        document.body.appendChild(edit_task_dialog);
        edit_task_dialog.showModal(); // Show edit dialog.
    };

    // Attach click listener to "Add Task" button.
    focusFlow_task_add.addEventListener('click', (event) => {
        event.preventDefault();
        task_name_dialog();
    });

    get_tasks(); // Retrieve tasks from the server.
    task_amount(); // Update task counter after initialization.
}); // End of DOMContentLoaded event listener
