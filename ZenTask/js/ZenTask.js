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
      var tasks = localStorage.get('ZenTask-Task');
      if (tasks) {
        self.tasks = tasks;
      }
      $(".button-collapse").sideNav();
      $(".dropdown-button").dropdown();
      $('.modal-trigger').leanModal({opacity: .6, in_duration: 200, out_duration: 200});

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
      resetTime() {
        $.each(this.$children, function() {
          this.task.time = '00:00:00';
        });
      },
      downloadCsv: function() {
        var csvData = [];
        csvData.push('id,プロジェクト,ユーザ,チケットＩＤ,稼働時間,コメント,行動,日付');
        var today = Date.getCurrentDate('/', false);
        $.each(this.$children, function() {
          var taskTodayTime = this.task.time;
          var times = taskTodayTime.split(':');
          var hun = parseInt(times[1]);
          var hunMap = {};
          var Z60 = Math.abs(60 - hun);
          var Z45 = Math.abs(45 - hun);
          var Z30 = Math.abs(30 - hun);
          var Z15 = Math.abs(15 - hun);
          var Z00 = Math.abs(0 - hun);
          hunMap[Z60] = 60;
          hunMap[Z45] = 45;
          hunMap[Z30] = 30;
          hunMap[Z15] = 15;
          hunMap[Z00] = 0;
          var hunKinjichi = Math.min.apply(null, [Z60,Z45,Z30,Z15,Z00]);
          var taskTimeForRedmine = (parseInt(times[0]*60) + hunMap[hunKinjichi]) / 60;
          if (taskTimeForRedmine === 0) {
            return true;//continueと同じ
          }
          var task = [
              '',//id は空にしておく
              this.task.projectName,
              this.task.worker,
              this.task.ticketId,
              taskTimeForRedmine,
              '', //comment
              this.task.code,
              today,
          ];
          csvData.push(task.join(','));
          }
        );

        // 指定されたデータを保持するBlobを作成する。
        var blob = new Blob([ csvData.join("\n") ], { "type" : "application/x-msdownload" });
        // Aタグのhref属性にBlobオブジェクトを設定し、リンクを生成
        window.URL = window.URL || window.webkitURL;
        var $target = $("#csvFile");
        location.download = 'test.txt';//TODO ファイル名がつかない（
        location.href = window.URL.createObjectURL(blob);
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
