import Vue from 'vue'
import App from './App.vue'
import vuetify from './plugins/vuetify'
import store from "./store";
import moment from "moment";
import router from "./router";

Vue.config.productionTip = false

Vue.prototype.$moment = moment;

new Vue({
  router,
  vuetify,
  store,
  render: h => h(App)
}).$mount('#app')
