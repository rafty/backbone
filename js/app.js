(function() {

    // modelクラス

    var Task = Backbone.Model.extend({ //Backbone名前空間に新たなクラスを追加する
        defaults: {
            title: 'do somrthing',
            completed: false
        },

        // varidationはmodelにvalidateを入れればよい

        validate: function(attrs) {
            if ( _.isEmpty(attrs.title) ){
                return 'title must not be empty';
            }
        },
        // validationがうまく行かなかった時の表示
        initialize: function() {
            this.on('invalid', function(model, error) {
                $('#error').html(error);
            })
        }
    }); 

    // collectionクラス

    var Tasks = Backbone.Collection.extend({ model: Task });


    // ModelのViewクラス

    var TaskView = Backbone.View.extend({
        tagName: 'li',                          // Viewではこれ重要 新規にタグを追加するときに必要
        initialize: function() {
            this.model.on('destroy', this.remove, this);
            this.model.on('change', this.render, this);
        },
        events: {
            'click .delete': 'destroy',
            'click .toggle': 'toggle'
        },
        toggle: function() {
            this.model.set('completed', !this.model.get('completed')); // modelにアクセス
        },
        destroy: function() {
            if (confirm('are you sure?')) {
                this.model.destroy();
            }
        },
        remove: function() {
            this.$el.remove();
        },
        template: _.template($('#task-template').html()),
        render: function () {
            var template = this.template(this.model.toJSON()); // ここでmodelを指定する
            this.$el.html(template);
            return this;
        }
    });


    // CollectionのViewクラス

    var TasksView = Backbone.View.extend({      
        tagName: 'ul',
        initialize: function() {
            this.collection.on('add', this.addNew, this);
            this.collection.on('change', this.updateCount, this);
            this.collection.on('destroy', this.updateCount, this);
        },
        addNew: function(task) {
            var taskView = new TaskView({model: task});
            this.$el.append(taskView.render().el);
            $('#title').val('').focus();
            this.updateCount();
        },
        updateCount: function() {
            var uncompletedTask = this.collection.filter(function(task) {
                return !task.get('completed');
            });
            $('#count').html(uncompletedTask.length)
        },
        render: function() {
            this.collection.each(function(task) {   // ここでcollectionを指定する
                var taskView = new TaskView({model: task}); //それぞれの modelが渡す
                this.$el.append(taskView.render().el);
            }, this);
            this.updateCount();
            return this;
        }
    });

    var AddTaskView = Backbone.View.extend({
        el: '#addTask',    // 既にタグがあるので、elで指定するだけ
        events: {
            'submit': 'submit'
        },
        submit: function(e) {
            e.preventDefault(); // eventで画面遷移が起きないようにする
            // var task = new Task({title: $('#title').val()});
            var task = new Task();
            if ( task.set({title: $('#title').val()}, {validate: true}) ) { // modelのvaridationはsetの時のみ動作する
                this.collection.add(task);
                $('#error').empty();
            }
            console.log(this.collection.toJSON());
        }
    });

    // collectioオブジェクト

    var tasks = new Tasks([
        
        // それぞれのmodelオブジェクト

        {
            title: 'task1',
            completed: true
        },
        {
            title: 'task2'
        },
        {
            title: 'task3'
        }
    ]); //インスタンス生成

    //console.log(tasks.toJSON());

    // Viewオブジェクト

    var tasksView = new TasksView({collection: tasks}); // viewにcollectionを追加する
    var addTaskView = new AddTaskView({collection: tasks});
    $('#tasks').html(tasksView.render().el);


})()