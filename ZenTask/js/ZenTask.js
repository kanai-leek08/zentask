$(function() {
  Vue.config.debug = false;

  var app = new Vue({
    el: '#app',
    data: {
      disp: {
        projectName: true,
        ticketId: true,
        title: true,
        code: true,
        time: true
      },
      tasks: [],
      sortKey: '',
      filterKey: '',
      searchQuery: '',
      isReverse: {
        projectName: false,
        ticketId: false,
        title: false,
        code: false,
        time: false
      }
    },
    created: function() {
      var self = this;
  　  self.tasks = localStorage.get('ZenTask-Task');
      $(window).on("beforeunload",function(e){ self.saveTask(); });
    },
    methods:{
      addTask: function(){
        var self = this;
        self.tasks.unshift(
          {
            projectName: 'ProjectName',
            ticketId: 'Ticket ID',
            title: 'New Task',
            code: 'CostCode',
            worker: 'Worker',
            time: '00:00:00',
            timerObj: null,
            isDone: false,
            isActive: false
          }
        );
        setTimeout(function(){
          $('.card[data-id=0]').addClass('go');
        }, 100);
      },
      saveTask: function(){
        $.each(this.tasks, function() {
          this.timerObj = null;
          this.isActive = false;
        });
        localStorage.set('ZenTask-Task', this.tasks);
      },
      editTask: function(elem) {
      },
      removeTask: function(index) {
        this.tasks.$remove(index)
      },
      doneTask: function(elem) {
        elem.isDone = true;
      },
      sortBy: function(key) {
        this.sortKey = key;
        this.isReverse[key] = !this.isReverse[key]
      },
      toggleTime(elem) {
        var countTime = function(startTime) {
          elem.timerObj = setTimeout(function() {
            stopDate = new Date();
            time = stopDate.getTime() - startTime;
            hour = Math.floor(time / (60 * 60 * 1000));
            time = time - (hour * 60 * 60 * 1000);
            minute = Math.floor(time / (60 * 1000));
            time = time - (minute * 60 * 1000);
            second = Math.floor(time / 1000);
            elem.time = hour.get0FillStr(2) + ":" + minute.get0FillStr(2) + ":" + second.get0FillStr(2);
            countTime(startTime);
          }, 1000);
        };
        if (elem.timerObj === null) {
          elem.isActive = true;
          $('.activeIcon' ,elem.$el).fadeIn(100);
          var times = elem.time.split(':');
          var countTimeMillSec = parseInt(times[0]*60*60*1000) - parseInt(times[1]*60*1000) - parseInt(times[2]*1000); // 通算ミリ秒計算
          countTime(Date.now() + countTimeMillSec);
        } else {
          elem.isActive = false;
          $('.activeIcon' ,elem.$el).fadeOut(100);
          clearTimeout(elem.timerObj);
          elem.timerObj = null;
        }
      }
    }
  });
});
