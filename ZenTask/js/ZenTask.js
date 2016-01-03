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
      APIKey: '',
      isReverse: {
        projectName: false,
      },
      costCodeList: [
        {
          label: '要件定義',
          options: [
            '100:要件定義'
          ]
        },
        {
          label: '基本設計',
          options: [
            '201:基本設計',
            '291:基本設計レビュー'
          ]
        },
        {
          label: '詳細設計',
          options: [
            '203:詳細設計',
            '293:詳細設計レビュー'
          ]
        },
        {
          label: '実装',
          options: [
            '301:コード化',
            '391:コードレビュー'
          ]
        },
        {
          label: '単体テスト',
          options: [
            '503:単体テスト仕様書作成',
            '593:単体テスト仕様書作成レビュー',
            '401:単体テスト',
            '303:単体バグ対応コード化',
            '393:単体バグ対応コードレビュー'
          ]
        },
        {
          label: '結合テスト',
          options: [
            '505:結合テスト仕様書作成',
            '595:結合テスト仕様書作成レビュー',
            '402:結合テスト',
            '305:結合バグ対応コード化',
            '395:結合バグ対応コードレビュー'
          ]
        },
        {
          label: '総合テスト',
          options: [
            '506:総合テスト仕様書作成',
            '596:総合テスト仕様書作成レビュー',
            '403:総合テスト',
          ]
        },
        {
          label: '性能テスト',
          options: [
            '507:性能テスト仕様書作成',
            '597:性能テスト仕様書作成レビュー',
            '404:性能テスト',
          ]
        },
        {
          label: '脆弱性テスト',
          options: [
            '508:脆弱性テスト仕様書作成',
            '598:脆弱性テスト仕様書作成レビュー',
            '405:脆弱性テスト',
          ]
        },
        {
          label: '外部連結テスト',
          options: [
            '509:外部連結テスト仕様書作成',
            '599:外部連結テスト仕様書作成レビュー',
            '406:外部連結テスト'
          ]
        },
        {
          label: 'その他',
          options: [
            '2xx:設計全般',
            '3xx:開発全般',
            '501:現調・立合',
            '504:納品ドキュメント',
            '502:UAT',
            '600:間接'
          ]
        }
      ],
      costCodeMapList: {
        '100:要件定義': '12',
        '2xx:設計全般': '8',
        '201:基本設計': '13',
        '291:基本設計レビュー': '14',
        '203:詳細設計': '15',
        '293:詳細設計レビュー': '16',
        '3xx:開発全般': '9',
        '301:コード化': '17',
        '391:コードレビュー': '18',
        '303:単体バグ対応コード化': '19',
        '393:単体バグ対応コードレビュー': '20',
        '305:結合バグ対応コード化': '21',
        '395:結合バグ対応コードレビュー': '22',
        '401:単体テスト': '23',
        '402:結合テスト': '24',
        '403:総合テスト': '25',
        '501:現調・立合': '26',
        '504:納品ドキュメント': '28',
        '503:単体テスト仕様書作成': '27',
        '593:単体テスト仕様書作成レビュー': '31',
        '505:結合テスト仕様書作成': '29',
        '595:結合テスト仕様書作成レビュー': '30',
        '506:総合テスト仕様書作成': '32',
        '596:総合テスト仕様書作成レビュー': '33',
        '404:性能テスト': '46',
        '405:脆弱性テスト': '47',
        '406:外部連結テスト': '48',
        '507:性能テスト仕様書作成': '49',
        '597:性能テスト仕様書作成レビュー': '50',
        '508:脆弱性テスト仕様書作成': '51',
        '598:脆弱性テスト仕様書作成レビュー': '52',
        '509:外部連結テスト仕様書作成': '53',
        '599:外部連結テスト仕様書作成レビュー': '54',
        '502:UAT': '55',
        '600:間接': '11'
      }
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
      var APIKey = localStorage.get('ZenTask-RedmineAPIKey');
      if (APIKey) {
        self.APIKey = APIKey;
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
         self.saveAPIKey();
      });
    },
    methods: {
      addTask: function(){
        var self = this;
        self.tasks.unshift(
          {
            id: self.idSeq++,
            projectName: 'ProjectName',
            ticketId: 'Ticket ID',
            title: 'New Task',
            code: ' 600:間接 ',
            comment: '',
            worker: 'Worker',
            time: '00:00:00',
            timerObj: null,
            isDone: false,
            isActive: false
          }
        );

        //イベント再設定
        self.setCardEvent();
      },
      addTicket: function() {
        var self = this;

        //チェックをつけたチケットのカードを追加
        $.each($('input[name=ticket][type=checkbox]:checked'), function() {
          self.tasks.unshift(
            {
              id: self.idSeq++,
              projectName: $(this).attr('data-projectname'),
              ticketId: $(this).attr('data-ticketid'),
              title: $(this).attr('data-title'),
              code: '600:間接',
              time: '00:00:00',
              comment: '',
              timerObj: null,
              isDone: false,
              isActive: false
            }
          );
        });

        //イベント再設定
        self.setCardEvent();
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
      saveAPIKey: function(){
        localStorage.set('ZenTask-RedmineAPIKey', this.APIKey);
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
      copyTask: function(index) {
        var self = this;
        var copyTask = self.tasks[index];
        self.tasks.unshift(
          {
            id: self.idSeq++,
            projectName: copyTask.projectName,
            ticketId: copyTask.ticketId,
            title: copyTask.title,
            code: copyTask.code,
            time: '00:00:00',
            comment: copyTask.comment,
            timerObj: null,
            isDone: false,
            isActive: false
          }
        );
        self.showToast('タスクをコピーしました');

        //イベント再設定
        self.setCardEvent();
      },
      doneTask: function(elem) {
        elem.isDone = true;
      },
      sortBy: function(key) {
        this.sortKey = key;
        this.isReverse[key] = !this.isReverse[key]
      },
      showToast: function(msg) {
        Materialize.toast(msg, 2500)
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
        if(self.APIKey === '') {
          self.showToast('[Error] RedmineAPIアクセスキーが登録されていません。');
          return false;
        }

        var paramList = [];
        $.each(self.tasks, function() {
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

          paramList.push({
            'issue_id' : this.ticketId,
            //'spent_on' : '', defaultは当日
            'hours' : taskTimeForRedmine,
            'activity_id' : self.costCodeMapList[this.code],
            'comments' : this.comment,
            'key' : self.APIKey
          });
        });

        var postWorktime = function() {
          var params = paramList.pop();
          if (typeof params === 'undefined') {
            self.showToast('Redmineへ工数登録しました');
            return false;
          }

          self.ajax(
            'POST',
            '/time_entries.json',
            params,
            postWorktime,
            postWorktime
            // function(){
            //   self.showToast('Redmineへの工数登録に失敗しました');
            //   return false;
            // }
          );
        };
        postWorktime();
      },
      findProjectTicket() {
        var self = this;
        var params = {
          project_id : self.projectId,
        };
        self.ajax(
          'GET',
          '/issues.json',
          params,
          self.updateTicketList,
          self.updateTicketList
          //function(){self.showToast('チケットリストの取得に失敗しました')}
        );
      },
      updateTicketList(response) {
        var self = this;
        response = mockProjectTicketData;

        //最新データを表示するためにdelete insertする
        self.projectList.$delete([response.issues[0].project.id]);

        //プロジェクト情報のセット
        self.projectList.$add( //dataのプロパティを書き換えるときはVueの関数を使わないと反映されない
          [response.issues[0].project.id],
          {
            'id': response.issues[0].project.id,
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
      deleteProject(project) {
        var self = this;
        self.projectList.$delete(project.id);
      },
      ajax(method, url, params, cbSuccess, cbFailed, context) {
        $.ajax({
          type: method,
          url: url,
          data: params,
          context : context
        }).done(cbSuccess).fail(cbFailed);
      },
      setCardEvent() {
        //検索して非表示→表示になった際にイベント再設定
        setTimeout(function(){
          $('.card:not(.go)').addClass('go'); //カード表示アニメーション発火
          $('.modal-trigger').leanModal({opacity: .6, in_duration: 100, out_duration: 100}); //modalイベント登録
          $('select').material_select(); //セレクトボックスデザイン適用
        }, 100);
      },
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
            "id": 6319,
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
                "id": 8,
                "name": "WBS"
            },
            "updated_on": "2015/10/01 09:23:35 +0900"
        }
    ],
    "limit": 100,
    "offset": 0,
    "total_count": 21
};
