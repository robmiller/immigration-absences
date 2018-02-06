var app = new Vue({
  el: "#app",
  data: {
    period: {
      start: "2013-02-06",
      end:   "2018-02-06",
    },
    years: [],
    violating_years: [],
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
        this.years.push({ start: moment(start), end: end, total_absences: 0 });
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
      var self = this;
      self.violating_years = [];
      self.years.forEach(function(year) {
        year.total_absences = 0;

        var absences = self.absences.map(function(absence) {
          if ( self.overlaps(absence, year) ) {
            // Clamp the absence within this period
            var start = Math.max(moment(year.start).format("X"), moment(absence.start).format("X"));
            var end   = Math.min(moment(year.end).format("X"), moment(absence.end).format("X"));
            // Calculate the number of days
            return Math.ceil((moment(end, "X").add(23, "hours").format("X") - start) / 86400);
          } else {
            return 0;
          }
        });

        year.total_absences = absences.reduce((a, c) => a + c);
        if ( year.total_absences > 180 ) {
          self.violating_years.push(year);
        }
      });
    },
    parse_absences: function() {
      var input = document.getElementById("absences").value;
      this.absences = input.split(/\n|\r/)
        .filter(l => l.match(/^\d{4}-\d{2}-\d{2}\s+(-|–)\s+\d{4}-\d{2}-\d{2}$/))
        .map(a => a.split(/\s+(?:-|–)\s+/))
        .map(a => { return { start: moment(a[0]), end: moment(a[1]) }; });

        this.calculate_periodic_absences();
        this.calculate_total_absent_days();
    },
    overlaps: function(period_one, period_two) {
      if ( period_one.start.isBetween(period_two.start, period_two.end, null, "[]") ) {
        return true;
      }

      if ( period_one.end.isBetween(period_two.start, period_two.end, null, "[]") ) {
        return true;
      }

      return false;
    },
  }
});

app.parse_absences();
app.calculate_years();
