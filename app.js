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

      this.years = [];

      var next_year = moment(period_start).add(1, 'y');
      this.years.push({ start: moment(this.period.start), end: next_year });

      for ( var i = 0; i < 4; i++ ) {
        var year_after = moment(next_year).add(1, 'y');
        this.years.push({ start: next_year, end: year_after});
        next_year = moment(year_after);
      }

      this.period.end = moment(period_start).add(5, 'y').format("YYYY-MM-DD");

      this.calculate_total_absent_days();
    },
    calculate_total_absent_days: function() {
      this.total_absent_days = 5;
    }
  }
});
