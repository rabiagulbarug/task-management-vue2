<template>
  <v-row class="fill-height">
    <v-col>
      <v-sheet height="64">
        <v-toolbar
            flat
        >
          <v-btn
              outlined
              class="mr-4"
              color="grey darken-2"
              @click="setToday"
          >
            Bugün
          </v-btn>
          <v-btn
              fab
              text
              small
              color="grey darken-2"
              @click="prev"
          >
            <v-icon small>
              mdi-chevron-left
            </v-icon>
          </v-btn>
          <v-btn
              fab
              text
              small
              color="grey darken-2"
              @click="next"
          >
            <v-icon small>
              mdi-chevron-right
            </v-icon>
          </v-btn>
          <v-toolbar-title v-if="$refs.calendar">
            {{ $refs.calendar.title }}
          </v-toolbar-title>
          <v-spacer></v-spacer>
          <v-menu
              bottom
              right
          >
            <template v-slot:activator="{ on, attrs }">
              <v-btn
                  outlined
                  color="grey darken-2"
                  v-bind="attrs"
                  v-on="on"
              >
                <span>{{ typeToLabel[type] }}</span>
                <v-icon right>
                  mdi-menu-down
                </v-icon>
              </v-btn>
            </template>
            <v-list>
              <v-list-item @click="type = 'day'">
                <v-list-item-title>Gün</v-list-item-title>
              </v-list-item>
              <v-list-item @click="type = 'week'">
                <v-list-item-title>Hafta</v-list-item-title>
              </v-list-item>
              <v-list-item @click="type = 'month'">
                <v-list-item-title>Ay</v-list-item-title>
              </v-list-item>
              <v-list-item @click="type = '4day'">
                <v-list-item-title>4 gün</v-list-item-title>
              </v-list-item>
            </v-list>
          </v-menu>
        </v-toolbar>
      </v-sheet>
      <v-sheet height="600">
        <v-calendar
            ref="calendar"
            v-model="focus"
            color="primary"
            :events="events"
            :event-color="getEventColor"
            :type="type"
            @click:event="showEvent"
            @click:more="viewDay"
            @click:date="viewDay"
            @change="updateRange"
        ></v-calendar>
        <v-menu
            v-model="selectedOpen"
            :close-on-content-click="false"
            :activator="selectedElement"
            offset-x
        >
          <v-card
              color="grey lighten-4"
              min-width="350px"
              flat
          >
            <v-toolbar
                :color="selectedEvent.color"
                dark
            >
              <v-btn icon>
                <v-icon>mdi-pencil</v-icon>
              </v-btn>
              <v-toolbar-title v-html="selectedEvent.name"></v-toolbar-title>
              <v-spacer></v-spacer>
              <v-btn icon>
                <v-icon>mdi-heart</v-icon>
              </v-btn>
              <v-btn icon>
                <v-icon>mdi-dots-vertical</v-icon>
              </v-btn>
            </v-toolbar>
            <v-card-text>
              <span v-html="selectedEvent.details"></span>
            </v-card-text>
            <v-card-actions>
              <v-btn
                  text
                  color="secondary"
                  @click="selectedOpen = false"
              >
                İptal
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-menu>
      </v-sheet>
    </v-col>
  </v-row>
</template>

<script>
import store from "@/store";
import moment from "moment";

export default {
  data: () => ({
    focus: '',
    type: 'month',
    typeToLabel: {
      month: 'Ay',
      week: 'Hafta',
      day: 'Gün',
      '4day': '4 Gün',
    },
    selectedEvent: {},
    selectedElement: null,
    selectedOpen: false,
    events: [],
    colors: ['blue', 'indigo', 'deep-purple', 'cyan', 'green', 'orange', 'grey darken-1'],
    names: ['Meeting', 'Holiday', 'PTO', 'Travel', 'Event', 'Birthday', 'Conference', 'Party'],
  }),
  mounted () {
    this.$refs.calendar.checkChange()
  },
  methods: {
    viewDay ({ date }) {
      this.focus = date
      this.type = 'day'
    },
    getEventColor (event) {
      return event.color
    },
    setToday () {
      this.focus = ''
    },
    prev () {
      this.$refs.calendar.prev()
    },
    next () {
      this.$refs.calendar.next()
    },
    showEvent ({ nativeEvent, event }) {
      this.$router.push({ name: 'Görevler', params: { taskId: event.id }});

      const open = () => {
        this.selectedEvent = event
        this.selectedElement = nativeEvent.target
        requestAnimationFrame(() => requestAnimationFrame(() => this.selectedOpen = true))
      }

      if (this.selectedOpen) {
        this.selectedOpen = false
        requestAnimationFrame(() => requestAnimationFrame(() => open()))
      } else {
        open()
      }

      nativeEvent.stopPropagation()
    },
    updateRange ({ start, end }) {
      const calendarStartDate = moment(start.date, 'YYYY-MM-DD');
      const calendarEndDate = moment(end.date, 'YYYY-MM-DD');

      const getTaskColor = (priority) => {
        switch (priority) {
          case 'highest':
            return 'red';
          case 'high':
            return 'orange';
          case 'medium':
            return 'grey darken-1';
          case 'low':
            return 'orange';
          case 'lowest':
            return 'red';
          default:
            return 'grey darken-1';
        }
      };

      this.events = store.state.tasks.filter(function (task) {
        const taskStartDate = moment(task.startDate, 'YYYY-MM-DD');
        const taskEndDate = moment(task.endDate, 'YYYY-MM-DD');

        return taskStartDate.isSameOrAfter(calendarStartDate) || taskEndDate.isSameOrBefore(calendarEndDate);
      }).map(function (task) {
        const calendarStart = new Date(task.startDate);
        const calendarEnd = new Date(task.endDate);

        return {
          id: task.id,
          name: task.name,
          start: calendarStart,
          end: calendarEnd,
          color: getTaskColor(task.priority),
          timed: false,
        };
      });
    },
  },
}
</script>
