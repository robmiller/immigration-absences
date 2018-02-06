var app = new Vue({
  el: "#app",
  data: {
    period: {
      start: "2013-02-06",
      end:   "2018-02-06",
    },
    years: [],
    absences: [],
    total_absent_days: 0
  },
  methods: {
    calculate_years: function() {
      if ( !this.period.start.match(/^\d{4}-\d{2}-\d{2}$/) ) {
        return;
      }

      period_start = moment(this.period.start);
      period_end   = moment(period_start).add(5, 'y').subtract(1, 'd')

      this.years = [];

      var start = moment(this.period.start);

      while ( true ) {
        var end = moment(start).add(1, 'y').subtract(1, 'd');
        this.years.push({ start: moment(start), end: end });
        start.add(1, 'd');

        if ( end >= period_end ) {
          break;
        }
      }

      this.calculate_periodic_absences();
      this.calculate_total_absent_days();
    },
    calculate_total_absent_days: function() {
      this.total_absent_days = 5;
    },
    calculate_periodic_absences: function() {
      // For each 12 month period, fetch the absences in that period
      // That means:
      //    - the absences that overlap this period in any way;
      //    - reduced to only the days that overlap.
      // Then: sum the overlapping absent days to find a total for that
      // period
      // Move onto the next period
    },
  }
});

app.calculate_years();
