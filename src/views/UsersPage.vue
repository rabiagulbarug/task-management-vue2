<template>
  <v-data-table
      :headers="headers"
      :items="users"
      :v-model="users"
      sort-by="calories"
      class="elevation-1"
  >
    <template v-slot:top>
      <v-toolbar flat>
        <v-toolbar-title>Kullanıcılar</v-toolbar-title>
        <v-divider class="mx-4" inset vertical></v-divider>
        <v-spacer></v-spacer>
        <v-dialog v-model="dialog" max-width="500px">
          <template v-slot:activator="{ on, attrs }">
            <v-btn color="primary" dark class="mb-2" v-bind="attrs" v-on="on">
              Yeni Kullanıcı
            </v-btn>
          </template>
          <v-card>
            <v-card-title>
              <span class="text-h5">{{ formTitle }}</span>
            </v-card-title>
            <v-card-text>
              <v-container>
                <v-row>
                  <v-col cols="12" sm="6" md="12">
                    <v-text-field v-model="editedItem.username" label="Kullanıcı Adı"></v-text-field>
                  </v-col>
                  <v-col cols="12" sm="6" md="12">
                    <v-text-field v-model="editedItem.name" label="İsim Soyisim"></v-text-field>
                  </v-col>
                </v-row>
              </v-container>
            </v-card-text>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn color="blue darken-1" text @click="close">Cancel</v-btn>
              <v-btn color="blue darken-1" text @click="save">Save</v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
        <v-dialog v-model="dialogDelete" max-width="400px">
          <v-card>
            <v-card-title class="text-h5">Kullanıcıyı silmek istediğinize emin misiniz?</v-card-title>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn color="black darken-1" text @click="closeDelete">Vazgeç</v-btn>
              <v-btn color="white darken-1" style="background-color: brown" text @click="deleteItemConfirm">Evet, Sil</v-btn>
              <v-spacer></v-spacer>
            </v-card-actions>
          </v-card>
        </v-dialog>
      </v-toolbar>
    </template>

    <!-- Actions Kolonu -->
    <template v-slot:[`item.actions`]="{ item }">
      <v-icon small class="mr-2" @click="editItem(item)">
        mdi-pencil
      </v-icon>
      <v-icon small @click="deleteItem(item)">
        mdi-delete
      </v-icon>
      &nbsp;
      <v-btn x-small @click="goTaskList(item)">Görevleri Listele</v-btn>
      &nbsp;
      <v-btn x-small @click="goAssignedByTaskList(item)">Atadığı Görevleri Listele</v-btn>
    </template>

    <template v-slot:no-data>
      <v-btn color="primary" @click="initialize">Reset</v-btn>
    </template>
  </v-data-table>
</template>

<script>
import store from "@/store";

export default {
  data: () => ({
    users: [],
    dialog: false,
    dialogDelete: false,
    headers: [
      { text: 'Kullanıcı Adı', align: 'start', sortable: false, value: 'username' },
      { text: 'İsim Soyisim', value: 'name' },
      { text: 'Atanmış Görev Sayısı', value: 'assignedCount' },
      { text: 'Başarılı Görev Sayısı', value: 'completedCount' },
      { text: 'Başarısız Görev Sayısı', value: 'failedCount' },
      { text: 'İşlemler', value: 'actions', sortable: false },
    ],
    editedIndex: -1,
    editedItem: { username: '', name: '', assignedCount: 0, completedCount: 0, failedCount: 0 },
    defaultItem: { username: '', name: '', assignedCount: 0, completedCount: 0, failedCount: 0 },
  }),
  computed: {
    formTitle() {
      return this.editedIndex === -1 ? 'Yeni Kullanıcı' : 'Kullanıcıyı Düzenle';
    },
  },
  created() {
    this.users = store.state.users;
  },
  watch: {
    dialog(val) {
      val || this.close();
    },
    dialogDelete(val) {
      val || this.closeDelete();
    },
  },
  methods: {
    goTaskList(item) {
      this.$router.push({ name: 'Görevler', params: { userId: item.id, status: 'assignedUser' }});
    },
    goAssignedByTaskList(item) {
      this.$router.push({ name: 'Görevler', params: { userId: item.id, status: 'assignedBy' }});
    },
    editItem(item) {
      this.editedIndex = this.users.findIndex((i) => i.id === item.id);
      this.editedItem = Object.assign({}, item);
      this.dialog = true;
    },
    deleteItem(item) {
      this.editedIndex = this.users.findIndex((i) => i.id === item.id);
      this.editedItem = Object.assign({}, item);
      this.dialogDelete = true;
    },
    deleteItemConfirm() {
      store.commit('deleteUser', this.editedItem);
      this.users = [...store.state.users];
      this.closeDelete();
    },
    close() {
      this.dialog = false;
      this.$nextTick(() => {
        this.editedItem = Object.assign({}, this.defaultItem);
        this.editedIndex = -1;
      });
    },
    closeDelete() {
      this.dialogDelete = false;
      this.$nextTick(() => {
        this.editedItem = Object.assign({}, this.defaultItem);
        this.editedIndex = -1;
      });
    },
    save() {
      if (this.editedItem.id !== undefined) {
        store.commit('updateUser', this.editedItem);
        this.$set(this.users, this.editedIndex, this.editedItem);
      } else {
        store.commit('addUser', this.editedItem);
        this.users = store.state.users;
      }
      this.close();
    },
  },
};
</script>
