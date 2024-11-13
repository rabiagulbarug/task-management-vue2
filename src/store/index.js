import Vue from 'vue';
import Vuex from 'vuex';
import createPersistedState from "vuex-persistedstate";

Vue.use(Vuex);

export default new Vuex.Store({
    state: {
        users: [
            {
                id: 1,
                name: "Rabia Gül Çakılkaya",
                username: "rabiagulcakilkaya",
                assignedCount: 1,
                completedCount: 1,
                failedCount: 0,
            },
            {
                id: 2,
                name: "Behlül Çakılkaya",
                username: "behlulcakilkaya",
                assignedCount: 1,
                completedCount: 0,
                failedCount: 0,
            },
            {
                id: 3,
                name: "Orkun Çakılkaya",
                username: "orkuncakilkaya",
                assignedCount: 0,
                completedCount: 0,
                failedCount: 0,
            }
        ],
        tasks: [
            {
                id: 1,
                name: 'Görev 1',
                startDate: '2024-11-12',
                endDate: '2024-11-13',
                completionDate: '2024-01-08',
                assignedUser: 1,
                assignedBy: 2,
                priority: 'highest',
                status: "completed",
            },
            {
                id: 2,
                name: 'Görev 2',
                startDate: '2024-10-29',
                endDate: '2024-11-04',
                completionDate: null,
                assignedUser: 2,
                assignedBy: 3,
                priority: 'high',
                status: "assigned",
            },
        ],
        auth: 1,
    },
    mutations: {
        addUser(state, user) {
            state.users.push(
                {
                    ...user,
                    id: state.users[state.users.length - 1].id + 1,
                }
            );
        },
        updateUser(state, user) {
            const target = state.users.findIndex((u) => u.id === user.id);
            state.users[target] = user;
        },
        deleteUser(state, user) {
            state.users = state.users.filter((u) => u.id !== user.id)
        },
        addTask(state, task) {
            state.tasks.push({
                ...task,
                id: state.tasks[state.tasks.length - 1].id + 1,
            });
        },
        updateTask(state, payload) {
            state.tasks[payload.index] = payload.task;
        },
        deleteTask(state, task) {
            state.tasks = state.tasks.filter((t) => t.id !== task.id);
        },
        changeAuth(state, id) {
            state.auth = id
        },
        recalculateUserStats(state) {
            state.users = state.users.map(function (user)  {
                return {
                    ...user,
                    assignedCount: state.tasks.filter((t) => t.assignedUser === user.id).length,
                    completedCount: state.tasks.filter((t) => t.assignedUser === user.id && t.status === 'completed').length,
                    failedCount: state.tasks.filter((t) => t.assignedUser === user.id && t.status === 'failed').length,
                };
            });
        },
    },
    getters: {
        getUser: (state) => state.users.find(u => u.id === state.auth),
    },
    plugins: [createPersistedState()],
});
