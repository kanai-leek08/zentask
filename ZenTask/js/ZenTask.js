$(function() {
  var app = new Vue({
    el: '#app',
    data: {
      idSeq: 1,
      projectList: {},
      tasks: [],
      sortKey: '',
      filterKey: '',
      projectId: '',
      isReverse: {
        projectName: false,
      },
      costCodeList: [
        { text: '100:要件定義', value: '100:要件定義' },
        { text: '2xx:設計全般', value: '2xx:設計全般' },
        { text: '201:基本設計', value: '201:基本設計' },
        { text: '291:基本設計レビュー', value: '291:基本設計レビュー' },
        { text: '203:詳細設計', value: '203:詳細設計' },
        { text: '293:詳細設計レビュー', value: '293:詳細設計' },
        { text: '3xx:開発全般', value: '3xx:開発全般' },
        { text: '301:コード化', value: ' 301:コード化' },
        { text: '391:コードレビュー', value: ' 391:コードレビュー' },
        { text: '303:単体バグ対応コード化', value: ' 303:単体バグ対応コード化' },
        { text: '393:単体バグ対応コードレビュー', value: ' 393:単体バグ対応コードレビュー' },
        { text: '305:結合バグ対応コード化', value: ' 305:結合バグ対応コード化' },
        { text: '395:結合バグ対応コードレビュー', value: ' 395:結合バグ対応コードレビュー' },
        { text: '401:単体テスト', value: ' 401:単体テスト' },
        { text: '402:結合テスト', value: ' 402:結合テスト' },
        { text: '403:総合テスト', value: ' 403:総合テスト' },
        { text: '501:現調・立合', value: ' 501:現調・立合' },
        { text: '503:単体テスト仕様書作成', value: ' 503:単体テスト仕様書作成' },
        { text: '593:単体テスト仕様書作成レビュー', value: ' 593:単体テスト仕様書作成レビュー' },
        { text: '504:納品ドキュメント', value: ' 504:納品ドキュメント' },
        { text: '505:結合テスト仕様書作成', value: ' 505:結合テスト仕様書作成' },
        { text: '595:結合テスト仕様書作成レビュー', value: ' 595:結合テスト仕様書作成レビュー' },
        { text: '506:総合テスト仕様書作成', value: ' 506:総合テスト仕様書作成' },
        { text: '596:総合テスト仕様書作成レビュー', value: ' 596:総合テスト仕様書作成レビュー' },
        { text: '600:間接', value: ' 600:間接' },
      ]
    },
    created: function() {
      var self = this;

      // データセット
      var idSeq = localStorage.get('ZenTask-ID');
      if (idSeq)  {
        self.idSeq = idSeq;
      }
      var tasks = localStorage.get('ZenTask-Task');
      if (tasks) {
        self.tasks = tasks;
      }
      var projectList = localStorage.get('ZenTask-ProjectList');
      if (tasks) {
        self.projectList = projectList;
      }

      // イベント イニシャライズ
      $(".button-collapse").sideNav();
      $(".dropdown-button").dropdown();
      setTimeout(function(){
        $('.modal-trigger').leanModal({opacity: .6, in_duration: 200, out_duration: 200});
        $('select').material_select();
      }, 100);
      $(window).on("beforeunload",function(e){
         self.saveTask();
         self.saveProjectList();
      });
    },
    methods:{
      addTask: function(){
        var self = this;
        self.tasks.unshift(
          {
            id: self.idSeq++,
            projectName: 'ProjectName',
            ticketId: 'Ticket ID',
            title: '',
            code: '100:要件定義',
            worker: 'Worker',
            time: '00:00:00',
            timerObj: null,
            isDone: false,
            isActive: false
          }
        );
        setTimeout(function(){
          $('.card[data-id=0]').addClass('go');
          $('select').material_select();
          $('.modal-trigger').leanModal({opacity: .6, in_duration: 100, out_duration: 100});
        }, 100);
      },
      saveTask: function(){
        $.each(this.tasks, function() {
          this.timerObj = null;
          this.isActive = false;
          this.deleteTarget = false;
        });
        localStorage.set('ZenTask-Task', this.tasks);
        localStorage.set('ZenTask-ID', this.idSeq);
      },
      saveProjectList: function(){
        localStorage.set('ZenTask-ProjectList', this.projectList);
      },
      editTask: function(elem) {
      },
      openDeleteModal: function(index) {
        this.tasks[index].deleteTarget = true;
      },
      deleteTask: function(index) {
        var self = this;
        self.tasks.$remove(index);
        self.showToast('タスクを削除しました');
      },
      doneTask: function(elem) {
        elem.isDone = true;
      },
      sortBy: function(key) {
        this.sortKey = key;
        this.isReverse[key] = !this.isReverse[key]
      },
      showToast: function(msg) {
        Materialize.toast(msg, 2000)
      },
      resetTime() {
        var self = this;
        $.each(this.tasks, function() {
          this.time = '00:00:00';
        });
        self.showToast('作業工数をリセットしました');
      },
      changeMode: function(mode) {
        if (mode === 1){
          $(".zenSection").fadeOut(100, function() {
            $(".ctrlSection, .cardSection").fadeIn(200);
          });
        } else if (mode === 2) {

        } else if (mode === 3) {
          $(".cardSection, .ctrlSection").fadeOut(200, function() {
            $(".zenSection").fadeIn(200);
          });
        }
      },
      downloadCsv: function() {
        var self = this;
        var csvData = [];
        csvData.push('id,プロジェクト,ユーザ,チケットＩＤ,稼働時間,コメント,行動,日付');
        var today = Date.getCurrentDate('/', false);
        $.each(this.$data.tasks, function() {
          var taskTodayTime = this.time;
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
              this.projectName,
              this.worker,
              this.ticketId,
              taskTimeForRedmine,
              '', //comment
              this.code,
              today,
          ];
          csvData.push(task.join(','));
          }
        );

        // 指定されたデータを保持するBlobを作成する。
        var blob = new Blob([ csvData.join("\n") ], { "type" : "application/x-msdownload" });
        // Aタグのhref属性にBlobオブジェクトを設定し、リンクを生成
        window.URL = window.URL || window.webkitURL;
        var elem = document.createElement('a');
        elem.download = 'Redmine工数.csv'; //ファイル名に日付をつける
        elem.href = window.URL.createObjectURL(blob);
        elem.click();

        self.showToast('CSVをダウンロードしました');
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

        //Activeなカードがクリックされた場合は処理しない
        if (elem.task.isActive) {
          return false;
        }

        //タイマーリセット処理
        $.each(this.tasks, function() {
          clearTimeout(this.timerObj);
          this.isActive = false;
        });

        $('.sashWrap').hide(400);

        //タイマーセット処理
        elem.task.isActive = true;
        $('.sashWrap' ,elem.$el).show(400);
        var times = elem.task.time.split(':');
        var countTimeMillSec = parseInt(times[0]*60*60*1000) - parseInt(times[1]*60*1000) - parseInt(times[2]*1000); // 通算ミリ秒計算
        countTime(Date.now() + countTimeMillSec);
      },
      registRedmineWorktime() {
        var self = this;
        var data = {
          'issue_id' : '',
          'spen_on' : '',
          'hours' : '',
          'activity_id' : '',
          'comments' : '',
        };

        self.ajax(
          'POST',
          '/time_entries.xml',
          data,
          function(){self.showToast('Redmineに工数を登録しました')},
          function(){self.showToast('Redmineへの工数登録に失敗しました')}
        );
      },
      findProjectTicket() {
        var self = this;
        var data = {
          project_id : self.projectId,
        };
        self.ajax(
          'GET',
          '/issues.json',
          data,
          self.updateTicketList,
          self.updateTicketList
          //function(){self.showToast('チケットリストの取得に失敗しました')}
        );
      },
      updateTicketList(response) {
        var self = this;
        response = mockProjectTicketData2;

        //最新データを表示するためにdelete insertする
        self.projectList.$delete([response.issues[0].project.id]);

        //プロジェクト情報のセット
        self.projectList.$add( //dataのプロパティを書き換えるときはVueの関数を使わないと反映されない
          [response.issues[0].project.id],
          {
            'name': response.issues[0].project.name,
            'ticketList': []
          }
        );

        //プロジェクトのチケット情報のセット
        $.each(response.issues, function() {
          self.projectList[this.project.id].ticketList.push(
            {
              'id': this.id,
              'name': this.subject
            }
          );
        });
      },
      ajax(method, url, data, cbSuccess, cbFailed, context) {
        $.ajax({
          type: method,
          url: url,
          data: data,
          context : context
        }).done(cbSuccess).fail(cbFailed);
      },
      watchCardDisp() {
        //検索して非表示→表示になった際にイベント再設定
        $('.card').addClass('go'); //カード表示アニメーション発火
        $('.modal-trigger').leanModal({opacity: .6, in_duration: 100, out_duration: 100}); //modalイベント登録
        $('select').material_select(); //セレクトボックスデザイン適用
      }
    }
  });
});

var mockProjectTicketData =
{
    "issues": [
        {
            "author": {
                "id": 26,
                "name": "名前"
            },
            "created_on": "2015/12/21 18:05:48 +0900",
            "description": "",
            "done_ratio": 0,
            "due_date": "2016/01/26",
            "id": 34163,
            "parent": {
                "id": 33732
            },
            "priority": {
                "id": 4,
                "name": "通常"
            },
            "project": {
                "id": 99,
                "name": "プロジェクトA"
            },
            "start_date": "2016/01/19",
            "status": {
                "id": 1,
                "name": "新規"
            },
            "subject": "Sprint18",
            "tracker": {
                "id": 1,
                "name": "WBS"
            },
            "updated_on": "2015/12/21 18:05:48 +0900"
        },
       {
            "assigned_to": {
                "id": 26,
                "name": "ほげ"
            },
            "author": {
                "id": 26,
                "name": "ふが"
            },
            "category": {
                "id": 21,
                "name": "PJ管理"
            },
            "created_on": "2014/06/02 09:26:44 +0900",
            "description": "",
            "done_ratio": 0,
            "id": 6311,
            "priority": {
                "id": 4,
                "name": "通常"
            },
            "project": {
                "id": 99,
                "name": "ほげ"
            },
            "start_date": "2014/08/04",
            "status": {
                "id": 1,
                "name": "新規"
            },
            "subject": "プロジェクト管理",
            "tracker": {
                "id": 1,
                "name": "WBS"
            },
            "updated_on": "2015/10/01 09:23:35 +0900"
        }
    ],
    "limit": 100,
    "offset": 0,
    "total_count": 21
};

var mockProjectTicketData2 =
{
    "issues": [
        {
            "author": {
                "id": 26,
                "name": "名前"
            },
            "created_on": "2015/12/21 18:05:48 +0900",
            "description": "",
            "done_ratio": 0,
            "due_date": "2016/01/26",
            "id": 35163,
            "parent": {
                "id": 33732
            },
            "priority": {
                "id": 4,
                "name": "通常"
            },
            "project": {
                "id": 100,
                "name": "プロジェクトB"
            },
            "start_date": "2016/01/19",
            "status": {
                "id": 1,
                "name": "新規"
            },
            "subject": "プロジェクトBのほげ",
            "tracker": {
                "id": 1,
                "name": "WBS"
            },
            "updated_on": "2015/12/21 18:05:48 +0900"
        },
       {
            "assigned_to": {
                "id": 26,
                "name": "ほげ"
            },
            "author": {
                "id": 26,
                "name": "ふが"
            },
            "category": {
                "id": 21,
                "name": "PJ管理"
            },
            "created_on": "2014/06/02 09:26:44 +0900",
            "description": "",
            "done_ratio": 0,
            "id": 6311,
            "priority": {
                "id": 4,
                "name": "通常"
            },
            "project": {
                "id": 100,
                "name": "プロジェクトB"
            },
            "start_date": "2014/08/04",
            "status": {
                "id": 1,
                "name": "新規"
            },
            "subject": "ふがふが",
            "tracker": {
                "id": 1,
                "name": "WBS"
            },
            "updated_on": "2015/10/01 09:23:35 +0900"
        }
    ],
    "limit": 100,
    "offset": 0,
    "total_count": 21
};
