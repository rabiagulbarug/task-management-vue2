import Vue from 'vue';
import Router from 'vue-router';
import Dashboard from "@/views/Dashboard.vue";
import CalendarPage from "@/views/CalendarPage.vue";
import TasksPage from "@/views/TasksPage.vue";
import UsersPage from "@/views/UsersPage.vue";

Vue.use(Router);

const router = new Router({
    mode: 'history',
    routes: [
        { path: '/', name: 'Dashboard', component: Dashboard },
        { path: '/calendar', name: 'Takvim', component: CalendarPage },
        { path: '/users', name: 'Kullanıcılar', component: UsersPage },
        { path: '/tasks', name: 'Görevler', component: TasksPage },
    ],
});

export default router;
