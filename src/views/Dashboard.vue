<template>
  <v-container fluid>
    <v-row  class="justify-center align-center">
      <v-col
          cols="12"
          sm="6"
          md="4"
          lg="2"
      >
        <v-card>
          <v-card-title class="heading" style="font-size: 14px ">
            Başarılı Görevler
          </v-card-title>

          <v-divider></v-divider>

          <v-list dense>
            <v-list-item
                v-for="(task) in getTasks('completed')"
                :key="task.id"
            >
              <v-list-item-content>
                {{ task.name }}
              </v-list-item-content>
            </v-list-item>
          </v-list>
        </v-card>
      </v-col>

      <v-col
          cols="12"
          sm="6"
          md="4"
          lg="2"
      >
        <v-card>
          <v-card-title class="heading" style="font-size: 14px ">
            Başarısız Görevler
          </v-card-title>

          <v-divider></v-divider>

          <v-list dense>
            <v-list-item
                v-for="(task) in getTasks('failed')"
                :key="task.id"
            >
              <v-list-item-content>
                {{ task.name }}
              </v-list-item-content>
            </v-list-item>
          </v-list>
        </v-card>
      </v-col>

      <v-col
          cols="12"
          sm="6"
          md="4"
          lg="2"
      >
        <v-card>
          <v-card-title class="heading" style="font-size: 14px ">
            Tamamlanmamış Görevler
          </v-card-title>

          <v-divider></v-divider>

          <v-list dense>
            <v-list-item
                v-for="(task) in getTasks('assigned')"
                :key="task.id"
            >
              <v-list-item-content>
                {{ task.name }}
              </v-list-item-content>
            </v-list-item>
          </v-list>
        </v-card>
      </v-col>

      <v-col
          cols="12"
          sm="6"
          md="4"
          lg="2"
      >
        <v-card>
          <v-card-title class="heading" style="font-size: 14px ">
            Süresi Geçen Başarılı Görevler
          </v-card-title>

          <v-divider></v-divider>

          <v-list dense>
            <v-list-item
                v-for="(task) in getTasks('completed', true)"
                :key="task.id"
            >
              <v-list-item-content>
                {{ task.name }}
              </v-list-item-content>
            </v-list-item>
          </v-list>
        </v-card>
      </v-col>

      <v-col
          cols="12"
          sm="6"
          md="4"
          lg="2"
      >
        <v-card>
          <v-card-title class="heading" style="font-size: 14px ">
            Süresi Geçen Başarısız Görevler
          </v-card-title>

          <v-divider></v-divider>

          <v-list dense>
            <v-list-item
                v-for="(task) in getTasks('failed', true)"
                :key="task.id"
            >
              <v-list-item-content>
                {{ task.name }}
              </v-list-item-content>
            </v-list-item>
          </v-list>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import store from "@/store";
import moment from "moment";

export default {
  name: 'HomePage',
  methods: {
    getTasks (status, checkExpire = false) {
      let tasks = store.state.tasks.filter((t) => t.assignedUser === store.state.auth && t.status === status);

      if (checkExpire) {
        tasks = tasks.filter((t) => moment(t.completionDate).isSameOrAfter(moment(t.endDate)));
      }

      return tasks.length > 0 ? tasks : [{id: 1, name: 'Görev Bulunmamaktadır'}];
    },
  },
};
</script>
