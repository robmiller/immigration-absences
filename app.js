var app = new Vue({
  el: "#app",
  data: {
    period: {
    },
    years: [],
    violating_years: [],
    absences: [],
    total_absent_days: 0
  },
  mounted: function() {
    this.period.start = moment().subtract(5, 'y').format("YYYY-MM-DD");

    this.parse_absences();
    this.calculate_years();
  },
  methods: {
    calculate_years: function() {
      if ( !this.period.start.match(/^\d{4}-\d{2}-\d{2}$/) ) {
        return;
      }

      period_start = moment(this.period.start);
      period_end   = moment(period_start).add(5, 'y').subtract(1, 'd')
      this.period.end = period_end.format("YYYY-MM-DD")

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
      if ( this.absences.length == 0 ) {
        this.total_absent_days = 0;
        return;
      }

      this.total_absent_days = this.absences.map(a => a.days).reduce((a, c) => a + c);
    },
    calculate_periodic_absences: function() {

      var self = this;
      self.violating_years = [];

      if ( this.absences.length == 0 ) {
        return;
      }

      self.years.forEach(function(year) {
        year.total_absences = 0;

        var absences = self.absences.map(function(absence) {
          if ( self.overlaps(absence, year) ) {
            // Clamp the absence within this period
            var start = moment.max(moment(year.start), moment(absence.start));
            var end   = moment.min(moment(year.end), moment(absence.end));
            // Calculate the number of days
            return Math.ceil((moment(end).add(23, "hours") - start) / 86400 / 1000);
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
        .map(a => { return { start: moment(a[0]).add(1, "day"), end: moment(a[1]).subtract(1, "day") }; });
      this.absences.forEach(a => a.days = Math.ceil((moment(a.end).add(23, "hours") - a.start) / 86400 / 1000));

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
