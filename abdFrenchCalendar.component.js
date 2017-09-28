(function() {

  "use strict";

  const abdFrenchCalendarController = class {

    constructor(
      $mdMedia
    ) {
      this.$mdMedia = $mdMedia

      this.currentDay = moment()
      this.currentMonth = moment().date(1)
      this.startDate = this.currentMonth.clone()
      this.months = moment.monthsShort()
      this.weekdays = moment.weekdaysShort(true)
      this.defaultDisabledDates = null
    }

    $onInit() {
      this._buildMonth(this.startDate.startOf('week'), this.currentMonth)
    }

    $onChanges(ev) {
      if (ev.disablePastDays || ev.disableFutureDays || ev.disableOtherDays) {
        if (ev.disablePastDays.currentValue != ev.disablePastDays.previousValue || ev.disableFutureDays.currentValue != ev.disableFutureDays.previousValue || ev.disableOtherDays.currentValue != ev.disableOtherDays.previousValue) {
          this._buildMonth(this.currentMonth.clone().startOf('week'), this.currentMonth)
          this.defaultDisabledDates = this.disableOtherDays.dates
          this._holidays(this.currentMonth)
        }
      }

    }

    /**
    * Show next month on calendar
    */
    nextMonth() {
      let oldYear = this.currentMonth.clone().year()
      this.currentMonth.add(1, 'M')

      if (oldYear != this.currentMonth.year()) {
        this._holidays(this.currentMonth)
      }

      this._buildMonth(this.currentMonth.clone().startOf('week'), this.currentMonth)
    }

    /**
    * Show previous month on calendar
    */
    previousMonth() {
      let oldYear = this.currentMonth.clone().year()
      this.currentMonth.subtract(1, 'M')

      if (oldYear != this.currentMonth.year()) {
        this._holidays(this.currentMonth)
      }

      this._buildMonth(this.currentMonth.clone().startOf('week'), this.currentMonth)
    }


    /**
    * Stylize the span of passed day
    *
    * @param {Object} day
    *
    * @return {Object}
    */
    stylizeDay(day) {
      let calendarWidth = angular.element(document.querySelectorAll(".calendar-weeks"))[0].clientWidth

      return {
        'height': (calendarWidth/7) + 'px',
        'border-radius': (calendarWidth/14) + 'px',
        'opacity': day.isCurMonth ? '1' : '0',
        'color': day.isDisabled ? '#DCDDDE' : (day.date.isSame(this.currentDay) ? '#F1F2F2' : '#58595B'),
        'background': day.date.isSame(this.currentDay) ? '#3DA599' : "transparent",
        'border': day.isToday ? "1px solid #3DA599" : "none",
        'cursor': day.isDisabled ? "initial" : "pointer",
        'transition': 'all 0.2s ease-in-out, height 0s'

      }
    }

    /**
    * Select the passed day and callback it
    *
    * @param {object} day
    */
    selectDate(day) {
      if (!day.isDisabled) {
        this.currentDay = moment(day.date)
        this.onDateChange({selectedDate: this.currentDay.clone()})
      }
    }


    /**
    * Build weeks of current displayed month
    *
    * @param {Date} start (the first week's day depending on moment.locale of the first month's week)
    * @param {Date} month (current displayed month with format 01/MM/YYYY)
    * @private
    */
    _buildMonth(start, month) {
      this.weeks = []
      let count = 0, done = false, date = start.clone(), monthIdx = date.month();

      while (!done) {
        this.weeks.push({days: this._buildWeek(date.clone(), month)})
        date.add(1, "w")
        done = count++ > 2 && monthIdx !== date.month()
        monthIdx = date.month()
      }
    }

    /**
    * Build days of the week of the params @date
    *
    * @param {Date} date (the first week's day of the week to build)
    * @param {Date} month (current displayed month with format 01/MM/YYYY)
    * @private
    *
    * @return {Array} (week's list of days)
    */
    _buildWeek(date, month) {
      let days = []

      for (let i = 0; i < 7; i++) {
        days.push({
          name: date.format("dd").substring(0, 1),
          number: date.date(),
          isCurMonth: date.month() === this.currentMonth.month(),
          isDisabled: this._checkDisabledDate(date),
          isToday: date.isSame(new Date(), "day"),
          date: date
        })
        date = date.clone()
        date.add(1, "d")
      }

      return days
    }

    /**
    * Check if the date need to be disabled in calendar view
    *
    * @param {Date} date
    * @private
    *
    * @return {Boolean} (week's list of days)
    */
    _checkDisabledDate(date) {
      let today = moment(), isOther = false;

      let isPast = date.isBefore(today, 'day') && this.disablePastDays
      let isFuture = date.isAfter(today, 'day') && this.disableFutureDays

      if (angular.isObject(this.disableOtherDays)) {
        for (let i = 0; i < this.disableOtherDays.dates.length && !isOther; i++) {
          isOther = moment(this.disableOtherDays.dates[i]).isSame(date, 'day')
        }

        for (let i = 0; i < this.disableOtherDays.days.length && !isOther; i++) {
          isOther = moment(this.disableOtherDays.days[i]).month() === date.month() && moment(this.disableOtherDays.days[i]).date() === date.date()
        }

        if(!isOther) {
          isOther = this.disableOtherDays.weekDays.indexOf(date.weekday()) === -1 ? false : true
        }
      }

      return isPast || isFuture || isOther
    }

    /**
    * Create holiday's list if disableHolidays is unset
    *
    * @private
    *
    * @return {Object}
    */
    _holidays(day) {
      if (!disableHolidays) {
        let curYear = day.year(),
            a = curYear % 19,
            b = Math.floor(curYear / 100),
            c = curYear % 100,
            d = Math.floor(b / 4),
            e = b % 4,
            f = Math.floor((b + 8) / 25),
            g = Math.floor((b - f + 1) / 3),
            h = (19 * a + b - d - g + 15) % 30,
            i = Math.floor(c / 4),
            k = c % 4,
            l = (32 + 2 * e + 2 * i - h - k) % 7,
            m = Math.floor((a + 11 * h + 22 * l) / 451),
            n0 = (h + l + 7 * m + 114),
            n = Math.floor(n0 / 31),
            p = n0 % 31 + 1,
            paques = moment(p + '-' + n + '-' + curYear, "DD-MM-YYYY");


        if (!angular.isUndefined(this.disableOtherDays)) {
          this.disableOtherDays.dates = this.defaultDisabledDates.concat([paques.clone().add(1, "d"), paques.clone().add(39, "d"), paques.clone().add(50, "d"), moment("1-1-" + curYear, "DD-MM-YYYY"), moment("1-5-" + curYear, "DD-MM-YYYY"), moment("8-5-" + curYear, "DD-MM-YYYY"), moment("14-7-" + curYear, "DD-MM-YYYY"), moment("15-8-" + curYear, "DD-MM-YYYY"), moment("1-11-" + curYear, "DD-MM-YYYY"), moment("11-11-" + curYear, "DD-MM-YYYY"), moment("25-12-" + curYear, "DD-MM-YYYY")])
        }
      }
    }
  }

  abdFrenchCalendarController.$inject = ['$mdMedia']

  angular
    .module('abd.frenchCalendar',[])
    .component('abdFrenchCalendar', {
      bindings: {
        onDateChange: '&',
        disablePastDays: '<?', //boolean
        disableFutureDays: '<?', //boolean
        disableOtherDays: '<?', //object {dates: [date], weekDays: [integer], days:[date]}
        disableHolidays: '<?'
      },
      templateUrl: './abdFrenchCalendar.html',
      controllerAs: "ctrl",
      controller: abdFrenchCalendar
    })
}
)();
