<template>
  <v-app>
    <!-- App Bar -->
    <v-app-bar app>
      <v-img
          src="/assets/img/logo.svg"
          alt="Logo"
          max-width="120"
          class="mr-4"
      ></v-img>

      <!-- Breadcrumbs -->
      <v-breadcrumbs :items="breadcrumbs">
        <template v-slot:item="{ item }">
          <v-breadcrumbs-item :to="item.to" exact>
            {{ item.text }}
          </v-breadcrumbs-item>
        </template>
      </v-breadcrumbs>

      <v-spacer></v-spacer>

      <!-- User Menu -->
      <v-menu offset-y>
        <template v-slot:activator="{ on, attrs }">
          <v-btn text v-bind="attrs" v-on="on">
            {{ currentUser.name }}
            <v-icon>mdi-menu-down</v-icon>
          </v-btn>
        </template>
        <v-list>
          <v-list-item v-for="user in users" :key="user.id" @click="changeProfile(user.id)">
            <v-list-item-title>{{ user.name }}</v-list-item-title>
          </v-list-item>
          <v-list-item @click="logout">
            <v-list-item-title>Çıkış Yap</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>
    </v-app-bar>

    <!-- Navigation Drawer -->
    <v-navigation-drawer
        v-model="drawer"
        :mini-variant.sync="mini"
        permanent
        app
    >
      <v-list-item class="px-2">
        <v-list-item-avatar>
          <v-img src="https://randomuser.me/api/portraits/men/85.jpg"></v-img>
        </v-list-item-avatar>

        <v-list-item-content v-if="drawer">
          <v-list-item-title>{{ currentUser.name }}</v-list-item-title>
        </v-list-item-content>

        <v-btn icon @click.stop="mini = !mini">
          <v-icon>{{ mini ? 'mdi-chevron-right' : 'mdi-chevron-left' }}</v-icon>
        </v-btn>
      </v-list-item>

      <v-divider></v-divider>

      <!-- Menu Items with Router -->
      <v-list dense>
        <v-list-item
            v-for="item in items"
            :key="item.title"
            :to="item.route"
            router
            link
            :exact="item.route === '/'"
        >
          <v-list-item-icon>
            <v-icon>{{ item.icon }}</v-icon>
          </v-list-item-icon>
          <v-list-item-content v-if="drawer">
            <v-list-item-title>{{ item.title }}</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>

    <!-- Main Content -->
    <v-main>
      <v-container fluid>
        <router-view />
      </v-container>
    </v-main>
  </v-app>
</template>

<script>
import store from "./store";

export default {
  computed: {
    currentUser() {
      return store.getters.getUser
    },
    users() {
      return store.state.users
    }
  },
  data() {
    return {
      drawer: true,
      mini: true,
      items: [
        { title: "Dashboard", icon: "mdi-view-dashboard-outline", route: "/" }, // Genel durum ve özet için uygun
        { title: "Kullanıcılar", icon: "mdi-account-group-outline", route: "/users" }, // Kullanıcı listesi için uygun
        { title: "Takvim", icon: "mdi-calendar-month-outline", route: "/calendar" }, // Takvim görünümü için uygun
        { title: "Görevler", icon: "mdi-clipboard-check-outline", route: "/tasks" }, // Görev yönetimi için uygun
      ],
      breadcrumbs: [],
    };
  },

  mounted() {
    this.updateBreadcrumbs();
    this.updateDrawerState();
    window.addEventListener("resize", this.updateDrawerState);
  },

  beforeDestroy() {
    window.removeEventListener("resize", this.updateDrawerState);
  },

  watch: {
    "$route"() {
      this.updateBreadcrumbs();
      this.drawer = true;
    },
  },

  methods: {
    updateDrawerState() {
      this.drawer = this.$vuetify.breakpoint.mdAndUp;
    },
    updateBreadcrumbs() {
      const route = this.$route;
      this.breadcrumbs = route.matched.map((match) => ({
        text: match.name,
        to: match.path,
      }));
    },
    changeProfile(id) {
      store.commit('changeAuth', id);
    },
    logout() {
      alert("Çıkış Yapıldı");
    },
  },
};
</script>

<style scoped>
.v-main {
  transition: margin-left 0.3s ease;
}
.v-breadcrumbs-item {
  color: black !important;
}
</style>
