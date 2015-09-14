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
      $(".button-collapse").sideNav();
      $(".dropdown-button").dropdown();
      setTimeout(function() {
        //$('.modal-trigger').leanModal({opacity: .6, in_duration: 100, out_duration: 100});
      }, 500);

      self.setUpdateTask();
      $(window).on("beforeunload",function(e){ self.saveTask(); });
    },
    methods:{
      addTask: function(){
        var self = this;
        self.tasks.unshift(
          {
            projectName: 'ProjectName',
            ticketId: 'Ticket ID',
            title: '',
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
          $('.modal-trigger').leanModal({opacity: .6, in_duration: 100, out_duration: 100});
        }, 100);
      },
      setUpdateTask: function(){
        $('#div802').click(function() {
          $('#div802').css( 'display', 'none');
          $('#div802-edit')
              .val( $( '#div802').text())
              .css( 'display', '')
              .focus();
        });
        $('#div802-edit').blur(function() {
            $('#div802-edit').css( 'display', 'none');
            $('#div802')
                .text($('#div802-edit').val())
                .css( 'display', '');
        });
      },
      saveTask: function(){
        $.each(this.tasks, function() {
          this.timerObj = null;
          this.isActive = false;
          this.deleteTarget = false;
        });
        localStorage.set('ZenTask-Task', this.tasks);
      },
      editTask: function(elem) {
      },
      openDeleteModal: function(index) {
        this.tasks[index].deleteTarget = true;
      },
      deleteTask: function(index) {
		    if (confirm('削除しますか。') === false) {
			    return false;
		    }
        this.tasks.$remove(index);
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
          elem.task.timerObj = setTimeout(function() {
            stopDate = new Date();
            time = stopDate.getTime() - startTime;
            hour = Math.floor(time / (60 * 60 * 1000));
            time = time - (hour * 60 * 60 * 1000);
            minute = Math.floor(time / (60 * 1000));
            time = time - (minute * 60 * 1000);
            second = Math.floor(time / 1000);
            elem.task.time = hour.get0FillStr(2) + ":" + minute.get0FillStr(2) + ":" + second.get0FillStr(2);
            countTime(startTime);
          }, 1000);
        };
        //タイマーリセット処理
        $.each(this.$children, function() {
          clearTimeout(this.task.timerObj);
          this.task.isActive = false;
        });
        $('.sashWrap').hide(400);

        elem.task.isActive = true;
        $('.sashWrap' ,elem.$el).show(400);
        var times = elem.task.time.split(':');
        var countTimeMillSec = parseInt(times[0]*60*60*1000) - parseInt(times[1]*60*1000) - parseInt(times[2]*1000); // 通算ミリ秒計算
        countTime(Date.now() + countTimeMillSec);
      }
    }
  });
});
