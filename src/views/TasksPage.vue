<template>
  <v-container fluid>
    <v-row>
      <!-- Filtreler -->
      <v-col cols="12" sm="4">
        <v-autocomplete
            v-model="filters.selectedTaskName"
            :items="tasks.map(t => t.name)"
            label="Görev Adı"
            item-text="name"
            item-value="name"
            clearable
            dense
        ></v-autocomplete>
      </v-col>
      <v-col cols="12" sm="4">
        <v-autocomplete
            v-model="filters.assignedUser"
            :items="store.state.users.map(u => u.username)"
            label="Atanan Kullanıcı"
            item-text="name"
            item-value="name"
            clearable
            dense
        ></v-autocomplete>
      </v-col>
      <v-col cols="12" sm="4">
        <v-autocomplete
            v-model="filters.assignedBy"
            :items="store.state.users.map(u => u.username)"
            label="Atayan Kullanıcı"
            item-text="name"
            item-value="name"
            clearable
            dense
        ></v-autocomplete>
      </v-col>
      <v-col cols="12" sm="3">
        <v-select
            v-model="filters.status"
            :items="statusOptions"
            label="Görev Durumu"
            clearable
        ></v-select>
      </v-col>
      <v-col cols="12" sm="3">
        <v-text-field
            v-model="filters.startDate"
            label="Başlangıç Tarihi"
            type="date"
            clearable
        ></v-text-field>
      </v-col>
      <v-col cols="12" sm="3">
        <v-text-field
            v-model="filters.endDate"
            label="Bitiş Tarihi"
            type="date"
            clearable
        ></v-text-field>
      </v-col>
      <v-col cols="12" sm="3">
        <v-select
            v-model="filters.priority"
            :items="priorityOptions"
            label="Önem Derecesi"
            clearable
        >
          <template v-slot:selection="{ item}">
            <v-icon :color="getPriorityColor(item.value)">
              {{ getPriorityIcon(item.value) }}
            </v-icon>
            {{ item.text }}
          </template>
          <template v-slot:item="{ item }">
            <v-icon :color="getPriorityColor(item.value)">
              {{ getPriorityIcon(item.value) }}
            </v-icon>
            {{ item.text }}
          </template>
        </v-select>
      </v-col>
    </v-row>
    <v-data-table
        :headers="headers"
        :items="filteredTasks"
        item-key="name"
        class="elevation-1"
    >
      <template v-slot:top>
        <v-toolbar flat>
          <v-toolbar-title>Görev Listesi</v-toolbar-title>
          <v-spacer></v-spacer>
          <v-btn color="primary" @click="openAddDialog">
            Yeni Görev Ekle
          </v-btn>
        </v-toolbar>
      </template>
      <template>
        <v-toolbar flat>
          <v-toolbar-title>Görev Listesi</v-toolbar-title>
        </v-toolbar>
      </template>
      <template v-slot:[`item.startDate`]="{ item }">
        <td>{{ formatDate(item.startDate) }}</td>
      </template>
      <template v-slot:[`item.endDate`]="{ item }">
        <td>{{ formatDate(item.endDate) }}</td>
      </template>
      <template v-slot:[`item.completionDate`]="{ item }">
        <td>{{ item.completionDate ? formatDate(item.completionDate) : 'Tamamlanmamış' }}</td>
      </template>
      <template v-slot:[`item.delay`]="{ item }">
        <td>{{ calculateDelay(item.endDate) }}</td>
      </template>
      <template v-slot:[`item.assignedBy`]="{ item }">
        <td>{{ getUser(item.assignedBy).name }}</td>
      </template>
      <template v-slot:[`item.assignedUser`]="{ item }">
        <td>{{ getUser(item.assignedUser).name }}</td>
      </template>
      <template v-slot:[`item.priority`]="{ item }">
        <v-row align="center" no-gutters>
          <v-icon :color="getPriorityColor(item.priority)" class="mr-2">
            {{ getPriorityIcon(item.priority) }}
          </v-icon>
          <span>{{ getPriorityText(item.priority) }}</span>
        </v-row>
      </template>
      <template v-slot:[`item.status`]="{ item }">
        <v-row align="center" no-gutters>
          <!-- Durum İkonu -->
          <v-icon :color="getStatusColor(item.status)" class="mr-2">
            {{ getStatusIcon(item.status) }}
          </v-icon>
          <!-- Durum Metni -->
          <span>{{ getStatusText(item.status) }}</span>
        </v-row>
      </template>

      <template v-slot:[`item.actions`]="{ item }">
        <v-icon v-if="canEdit(item)" small @click="editItem(item)">
          mdi-pencil
        </v-icon>
        <v-icon small @click="viewItem(item)">
          mdi-eye
        </v-icon>
        <v-icon v-if="canDelete(item)" small @click="deleteItem(item)">
          mdi-delete
        </v-icon>
      </template>
    </v-data-table>
    <v-dialog v-model="dialogDelete" max-width="400px">
      <v-card>
        <v-card-title class="text-h5">Bu görevi silmek istediğinize emin misiniz?</v-card-title>
        <v-card-actions>
          <v-btn color="blue darken-1" text @click="closeDelete">İptal</v-btn>
          <v-btn color="red darken-1" text @click="deleteItemConfirm">Sil</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-dialog v-model="dialogForm" max-width="600px">
      <v-card>
        <v-card-title>
          <span class="headline">{{ isShow ? 'Görev Detayı' : editedIndex === -1 ? 'Yeni Görev Ekle' : 'Görev Düzenle' }}</span>
        </v-card-title>
        <v-card-text>
          <v-form ref="form">
            <v-text-field
                v-model="editedItem.name"
                :disabled="isShow"
                label="Görev Adı"
                required
            ></v-text-field>
            <v-text-field
                v-model="editedItem.startDate"
                :disabled="isShow"
                label="Başlangıç Tarihi"
                type="date"
                required
            ></v-text-field>
            <v-text-field
                v-model="editedItem.endDate"
                :disabled="isShow"
                label="Bitiş Tarihi"
                type="date"
                required
            ></v-text-field>
            <v-autocomplete
                v-model="editedItem.assignedUser"
                :disabled="isShow"
                :items="store.state.users"
                label="Atanan Kullanıcı"
                item-text="name"
                item-value="id"
                required
            ></v-autocomplete>
            <v-autocomplete
                v-model="editedItem.assignedBy"
                :disabled="isShow"
                :items="store.state.users"
                label="Atayan Kullanıcı"
                item-text="name"
                item-value="id"
                required
            ></v-autocomplete>
            <v-select
                v-model="editedItem.priority"
                :disabled="isShow"
                :items="priorityOptions"
                label="Önem Derecesi"
                required
            >
              <template v-slot:selection="{ item }">
                <v-icon :color="getPriorityColor(item.value)">
                  {{ getPriorityIcon(item.value) }}
                </v-icon>
                {{ item.text }}
              </template>
              <template v-slot:item="{ item }">
                <v-icon :color="getPriorityColor(item.value)">
                  {{ getPriorityIcon(item.value) }}
                </v-icon>
                {{ item.text }}
              </template>
            </v-select>
            <v-select
                v-model="editedItem.status"
                :disabled="isShow"
                :items="statusOptions"
                label="Görev Durumu"
            ></v-select>
          </v-form>
        </v-card-text>
        <v-card-actions v-if="!isShow">
          <v-spacer></v-spacer>
          <v-btn color="blue darken-1" text @click="closeDialogForm">İptal</v-btn>
          <v-btn color="green darken-1" text @click="saveTask">Kaydet</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

  </v-container>
</template>

<script>
import moment from 'moment';
import store from "@/store";

export default {
  data() {
    return {
      tasks: [],
      dialogForm: false,
      dialogDelete: false,
      filters: {
        selectedTaskName: null,
        startDate: '',
        endDate: '',
        assignedUser: null,
        assignedBy: null,
        priority: null,
        status: null,
      },
      priorityOptions: [
        {text: 'Çok Yüksek', value: 'highest', disabled: false},
        {text: 'Yüksek', value: 'high', disabled: false},
        {text: 'Orta', value: 'medium', disabled: false},
        {text: 'Düşük', value: 'low', disabled: false},
        {text: 'Çok Düşük', value: 'lowest', disabled: false},
      ],
      statusOptions: [
        {text: 'Atanmış', value: 'assigned', disabled: false},
        {text: 'Başarılı', value: 'completed', disabled: false},
        {text: 'Başarısız', value: 'failed', disabled: false},
      ],
      headers: [
        { text: 'Görev Adı', align: 'start', value: 'name' },
        { text: 'Başlangıç Tarihi', value: 'startDate' },
        { text: 'Bitiş Tarihi', value: 'endDate' },
        { text: 'Gecikme', value: 'delay' },
        { text: 'Tamamlanma Tarihi', value: 'completionDate' },
        { text: 'Atanan Kullanıcı', value: 'assignedUser' },
        { text: 'Atayan Kullanıcı', value: 'assignedBy' },
        { text: 'Önem Derecesi', value: 'priority' },
        { text: 'Görev Durumu', value: 'status' },
        { text: 'İşlemler', value: 'actions', sortable: false },
      ],
      isShow: false,
      editedIndex: -1,
      editedItem: {
        name: '',
        startDate: '',
        endDate: '',
        assignedUser: '',
        assignedBy: '',
        priority: '',
        status: 'assigned',
      },
      defaultItem: { },
    };
  },
  created() {
    this.initialize()
  },
  computed: {
    store() {
      return store
    },
    filteredTasks() {
      return this.tasks.filter(task => {
        const matchesTaskName =
            !this.filters.selectedTaskName ||
            task.name.toLowerCase().includes(this.filters.selectedTaskName.toLowerCase());

        const matchesStartDate =
            !this.filters.startDate || moment(task.startDate).isSameOrAfter(this.filters.startDate);

        const matchesEndDate =
            !this.filters.endDate || moment(task.endDate).isSameOrBefore(this.filters.endDate);

        const matchesAssignedUser =
            !this.filters.assignedUser ||
            task.assignedUser === store.state.users.find(u => u.username === this.filters.assignedUser).id;

        const matchesAssignedBy =
            !this.filters.assignedBy ||
            task.assignedBy === store.state.users.find(u => u.username === this.filters.assignedBy).id;

        const matchesPriority =
            !this.filters.priority || task.priority === this.filters.priority;

        const matchesStatus =
            !this.filters.status ||
            (this.filters.status === 'Atanmış' && task.status === 'assigned') ||
            (this.filters.status === 'Başarılı' && task.status === 'completed') ||
            (this.filters.status === 'Başarısız' && task.status === 'failed');


        return (
            matchesTaskName &&
            matchesStartDate &&
            matchesEndDate &&
            matchesAssignedUser &&
            matchesAssignedBy &&
            matchesPriority &&
            matchesStatus
        );
      });
    },
  },
  watch: {
    dialogForm: function(newValue) {
      if (newValue === false && this.isShow) {
        this.isShow = false;
      }
    }
  },
  methods: {
    initialize() {
      this.tasks = store.state.tasks;

      const taskId = this.$route.params.taskId;
      if (taskId) {
        const task = this.tasks.find((t) => t.id === taskId);

        if (this.canEdit(task)) {
          this.editItem(task);
        }
      }

      const userId = this.$route.params.userId;
      if (userId) {
        const status = this.$route.params.status;
        const user = store.state.users.find((u) => u.id === userId);
        if (status === 'assignedBy') {
          this.filters.assignedBy = user.username;
        } else if(status === 'assignedUser') {
          this.filters.assignedUser = user.username;
        }
      }
    },
    openAddDialog() {
      this.editedIndex = -1;
      this.resetEditedItem();
      this.dialogForm = true;
    },
    editItem(item) {
      this.editedIndex = this.tasks.findIndex((i) => i.id === item.id);
      this.editedItem = Object.assign({}, item);
      this.dialogForm = true;
    },
    saveTask() {
      this.editedItem.completionDate = this.editedItem.status !== 'assigned' ? moment().format("YYYY-MM-DD") : null;
      if (this.editedIndex > -1) {
        store.commit('updateTask', {
          index: this.editedIndex,
          task: this.editedItem,
        });
        store.commit('recalculateUserStats');
        this.$set(this.tasks, this.editedIndex, this.editedItem);
      } else {
        store.commit('addTask', this.editedItem);
        store.commit('recalculateUserStats');
        this.tasks = store.state.tasks;
      }
      this.closeDialogForm();
    },
    closeDialogForm() {
      this.dialogForm = false;
      this.resetEditedItem();
    },

    resetEditedItem() {
      this.editedItem = {
        name: '',
        startDate: '',
        endDate: '',
        assignedUser: '',
        assignedBy: '',
        priority: '',
        status: 'assigned',
      };
    },
    formatDate(date) {
      return moment(date).format('DD/MM/YYYY');
    },
    calculateDelay(endDate) {
      const end = moment(endDate);
      const today = moment();
      const duration = moment.duration(end.diff(today));
      return duration.humanize();
    },
    getUser(userId) {
      return store.state.users.find(u => u.id === userId);
    },
    // Silme İşlemi
    deleteItem(item) {
      this.editedIndex = this.tasks.findIndex((i) => i.id === item.id);
      this.editedItem = Object.assign({}, item); // Silinecek öğeyi geçici bir değişkene aktar
      this.dialogDelete = true; // Silme onayı için dialogu aç
    },

    // Silme Onayı
    deleteItemConfirm() {
      store.commit('deleteTask', this.editedItem);
      store.commit('recalculateUserStats');
      this.tasks = [...store.state.tasks];
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
      if (this.editedIndex > -1) {
        Object.assign(this.tasks[this.editedIndex], this.editedItem);
      } else {
        this.tasks.push(this.editedItem);
      }
      this.close();
    },

    viewItem(item) {
      this.isShow = true;
      this.editedIndex = this.tasks.findIndex((i) => i.id === item.id);
      this.editedItem = Object.assign({}, item);
      this.dialogForm = true;
    },

    getPriorityIcon(priority) {
      switch (priority) {
        case 'highest':
          return 'mdi-chevron-double-up';
        case 'high':
          return 'mdi-chevron-up';
        case 'medium':
          return 'mdi-unfold-more-horizontal';
        case 'low':
          return 'mdi-chevron-down';
        case 'lowest':
          return 'mdi-chevron-double-down';
        default:
          return '';
      }
    },
    getPriorityText(priority) {
      switch (priority) {
        case 'highest':
          return 'Çok Yüksek';
        case 'high':
          return 'Yüksek';
        case 'medium':
          return 'Orta';
        case 'low':
          return 'Düşük';
        case 'lowest':
          return 'Çok Düşük';
        default:
          return '';
      }
    },
    getPriorityColor(priority) {
      switch (priority) {
        case 'highest':
          return 'red';
        case 'high':
          return 'red';
        case 'medium':
          return 'orange';
        case 'low':
          return 'blue';
        case 'lowest':
          return 'blue';
        default:
          return '';
      }
    },
    getStatusText(status) {
      switch (status) {
        case "assigned":
          return 'Atanmış';
        case "completed":
          return 'Başarılı';
        case "failed":
          return 'Başarısız';
        default:
          return '';
      }
    },
    getStatusIcon(status) {
      switch (status) {
        case 'completed':
          return 'mdi-check-circle';
        case 'failed':
          return 'mdi-close-circle';
        case 'assigned':
          return 'mdi-account-check';
        default:
          return 'mdi-account-off';
      }
    },
    getStatusColor(status) {
      switch (status) {
        case 'completed':
          return 'green';
        case 'failed':
          return 'red';
        case 'assigned':
          return 'blue';
        default:
          return 'grey';
      }
    },
    canEdit(task) {
      return task.assignedBy === store.state.auth || task.assignedUser === store.state.auth;
    },
    canDelete(task) {
      return task.assignedBy === store.state.auth;
    },
  },
};
</script>
