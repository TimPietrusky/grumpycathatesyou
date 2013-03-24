(function() {
  window.App = {
    Models : {},
    Collections : {},
    Views : {},
    Router : {}
  };

  window.template = function(id) {
    return _.template($('#' + id).html());
  };

  window.vent = _.extend({}, Backbone.Events);

  /***************************************************
   *
   * Router
   */
  App.Router = Backbone.Router.extend({
    routes : {
      ':img/:font/*title' : 'show',
      '*index' : 'index'
    },

    initialize : function() {
      vent.bind('meme:save', this.save, this);
    },

    index : function() {
      vent.trigger('router:index', meme.model);
      message.trigger({ text : 'meow D:', timeout : 750 });
    },

    show : function(img, font, title) {
      // Decode title
      title = decodeURIComponent(title);

      vent.trigger('meme:update', { 'img' : img, 'font' : font, 'title' : title});
    },

    save : function(model) {
      this.navigate(model.get('img') + "/" + model.get('font') + "/" + model.get('title'));
    }
  });

  /***************************************************
   *
   * Models 
   */
  App.Models.Meme = Backbone.Model.extend({
    defaults : {
      img : '1',
      font : '1',
      title : 'Grumpy Cat Hates You.com'
    },

    validate: function(args, options) {
        if (args.img <= 0 || args.img > 6 || args.img == undefined) {
          return "not valid";
        }

        if (args.font <= 0 || args.font > 5 || args.font == undefined) {
          return "not valid";
        }

        if (args.title == undefined) {
          return "not valid";
        }
    }
  });

  App.Models.PictureEditor = Backbone.Model.extend({
  });

  App.Models.PictureEditor.Picture = Backbone.Model.extend({
  });

  App.Models.FontEditor = Backbone.Model.extend({
  });

  App.Models.FontEditor.Font = Backbone.Model.extend({
  });

  /***************************************************
   *
   * Collections 
   */
  App.Collections.PictureEditor = Backbone.Collection.extend({
    model : App.Models.PictureEditor.Picture
  });

  App.Collections.FontEditor = Backbone.Collection.extend({
    model : App.Models.FontEditor.Font
  });

  /***************************************************
   *
   * Views 
   */

  /*
   * Meme which holds the picture and the title.
   */
  App.Views.Meme = Backbone.View.extend({
    el : '.meme',

    childs : {
      picture : null,
      title : null
    },

    initialize : function() {
      // Listen to model changes
      this.model.on('change', this.render, this);

      // Listen to events
      vent.bind('meme:update', this.update, this);
      vent.bind('save:click', this.save, this);
      vent.bind('router:index', this.render, this);

      // Init child views
      this.childs.picture = new App.Views.Meme.Picture();
      this.childs.title = new App.Views.Meme.Title();
    },

    // Update the model
    update : function(args) {
      this.model.set({'img' : args.img, validate : true});
      this.model.set({'font' : args.font, validate : true});
      this.model.set('title', args.title);
    },

    save : function() {
      vent.trigger('meme:save', this.model);
      message.trigger({ text : 'Saved!', timeout : 500 });
    },

    // Render the childs
    render : function() {
      this.childs.picture.render(this.model);
      this.childs.title.render(this.model);
    },

    active : function(active) {
      active ? this.$el.addClass('active') : this.$el.removeClass('active');
    }
  });

  /*
   * Picture of the grumpy cat.
   */
  App.Views.Meme.Picture = Backbone.View.extend({
    el : '.picture',

    render : function(model) {
      this.$el.attr('src', '/img/grumpycats/' + model.get('img') + '.jpg');
    }
  });

  /*
   * Title for the grumpy cat.
   */
  App.Views.Meme.Title = Backbone.View.extend({
    el : '.title',

    render : function(model) {
      // Reset font-size
      this.$el.removeClass('size--alpha size--beta');

      // Adjust font-size
      var title = model.get('title');
      if (title.length > 15 && title.length <= 40) {
        this.$el.addClass('size--alpha');
      }
      if (title.length > 40) {
        this.$el.addClass('size--beta');
      }

      // Set text
      this.$el.text(model.get('title'));

      // Set font
      this.$el.attr('data-font', model.get('font'));
    }
  });

  /*
   * Edit/save button
   */
  App.Views.Edit = Backbone.View.extend({
    el : 'button.edit',
    mode : 'edit',
    body : $('body'),

    events : {
      'click' : 'click'
    },

    click : function() {
      switch (this.mode) {
        case 'edit' : this.edit();
        break;
        case 'save' : this.save();
        break;
      }
    },

    edit : function() {
      vent.trigger("edit:click");
      this.$el.text('Save');
      this.$el.addClass('save');
      this.mode = 'save';

      meme.active(true);

      this.body.removeClass('saved');
    },

    save : function() {
      vent.trigger("save:click");
      this.$el.text('Edit');
      this.$el.removeClass('save');
      this.mode = 'edit';

      meme.active(false);

      this.body.addClass('saved');
    }
  });

  /*
   * Editor
   */
  App.Views.Editor = Backbone.View.extend({
    el : '.editor',
    template : template('template_editor'),

    data : {
      pictureCollection : null,
      fontCollection : null
    },

    childs : {
      titleEditor : null,
      pictureEditor : null,
      fontEditor : null
    },

    initialize : function() {
      vent.bind('edit:click', this.start, this);
      vent.bind('save:click', this.stop, this);
      vent.bind('editor:update', this.render, this);

      this.data.pictureCollection = new App.Collections.PictureEditor([
        {'img' : 1},
        {'img' : 2},
        {'img' : 3},
        {'img' : 4},
        {'img' : 5},
        {'img' : 6},
      ]);

      this.data.fontCollection = new App.Collections.FontEditor([
        {'font' : 1, 'text' : 'Nosifer'},
        {'font' : 2, 'text' : 'Alfa Slab One'},
        {'font' : 3, 'text' : 'Peralta'},
        {'font' : 4, 'text' : 'Princess Sofia'},
        {'font' : 5, 'text' : 'Josefin Sans'},
      ]);
    },

    // Start editing the meme
    start : function() {
      this.$el.addClass('active');
      this.render();
    },

    // Remove editor and save
    stop : function() {
      this.$el.removeClass('active');

      setTimeout(_.bind(function() {
        this.$el.html('');
      }, this), 250); 
    },

    render : function() {
      if (this.$el.hasClass('active')) {
        this.$el.html(this.template);

        // Create the TitleEditor and add it to the editor
        this.childs.titleEditor = new App.Views.TitleEditor();
        this.$el.find('.editor--title').append(this.childs.titleEditor.render().el);

        // Create the PictureEditor and add it to the Editor
        this.childs.pictureEditor = new App.Views.PictureEditor({ collection : this.data.pictureCollection });
        this.$el.find('.editor--picture').append(this.childs.pictureEditor.render().el);

        // Create the FontEditor and add it to the Editor
        this.childs.fontEditor = new App.Views.FontEditor({ collection : this.data.fontCollection });
        this.$el.find('.editor--font').append(this.childs.fontEditor.render().el);
      }
    }
  });

  /*
   * TitleEditor to edit the title.
   */
  App.Views.TitleEditor = Backbone.View.extend({
    tagName : 'textarea',

    events : {
      'keyup' : 'keydown'
    },

    render : function() {
      this.$el.attr('spellcheck', false);
      this.$el.val(meme.childs.title.$el.text());
      return this;
    },

    keydown : function() {
      vent.trigger('meme:update', { 'title' : this.$el.val() });
    }
  });

  /*
   * PictureEditor to choose a picture.
   */
  App.Views.PictureEditor = Backbone.View.extend({
    tagName : 'ul',

    initialize : function() {
      vent.bind('pictureeditor:update', this.update, this);
    },

    render : function() {
      this.collection.each(this.addOne, this);
      return this;
    },

    addOne : function(picture) {
      var view = new App.Views.PictureEditor.Picture({model : picture});
      this.$el.append(view.render().el);
    },

    update : function() {
      this.$el.find('.active').removeClass('active');
    }
  });

  /*
   * The picture to choose from the PictureEditor.
   */
  App.Views.PictureEditor.Picture = Backbone.View.extend({
    tagName : 'li',
    template : template('template_pictureEditor_picture'),

    events : {
      'click' : 'click'
    },

    render : function() {
      var template = this.template(this.model.toJSON());
      this.$el.html(template);

      if (meme.model.get('img') == this.model.get('img')) {
        this.$el.addClass('active');
      }

      return this;
    },

    click : function() {
      vent.trigger('pictureeditor:update');
      vent.trigger('meme:update', { 'img' : this.model.get('img') });
      this.$el.addClass('active');
    }
  });

  /*
   * FontEditor to choose a font.
   */
  App.Views.FontEditor = Backbone.View.extend({
    tagName : 'ul',

    initialize : function() {
      vent.bind('fonteditor:update', this.update, this);
    },

    render : function() {
      this.collection.each(this.addOne, this);
      return this;
    },

    addOne : function(model) {
      var view = new App.Views.FontEditor.Font({model : model});
      this.$el.append(view.render().el);
    },

    update : function() {
      this.$el.find('.active').removeClass('active');
    }
  });

  /*
   * The font to choose from the FontEditor.
   */
  App.Views.FontEditor.Font = Backbone.View.extend({
    tagName : 'li',
    template : template('template_fontEditor_font'),

    events : {
      'click' : 'click'
    },

    render : function() {
      var template = this.template(this.model.toJSON());
      this.$el.html(template);

      // Set font
      this.$el.attr('data-font', this.model.get('font'));

      // Set active font
      if (meme.model.get('font') == this.model.get('font')) {
        this.$el.addClass('active');
      }

      return this;
    },

    click : function() {
      vent.trigger('fonteditor:update');
      vent.trigger('meme:update', { 'font' : this.model.get('font') });
      this.$el.addClass('active');
    }
  });

  /*
   * Create a random meme.
   */
  App.Views.Random = Backbone.View.extend({
    el : '.random',

    events : {
      'click' : 'click'
    },

    initialize : function() {
      vent.bind('random:click', this.click, this);
    },

    data : {
      s : ["KILL", "DESTROY", "MESS UP", "EXPLODE", "RIP", "MURDER", "TEAR UP", "FUCK", "TERRORIZE", "DOMINATE", "GOOGLE", "ANGER", "SCREAM", "ANNOY", "IMPLODE", "PURCHASE", "ENRAGE", "LIKE", "BEFRIEND", "A'SPLODE", "BAN", "BOMB", "LAUNCH", "SHATTER", "TROLL", "RUN", "KICK", "PUNCH", "PUSH", "DIE", "DO", "BURST", "BURN", "DESPISE", "DESPITE", "AS SEEN ON"],
      m : ["LETHAL", "DEADLY", "BOMBASTIC", "SILLY", "FUCKING", "FAT", "COLOSSAL", "GIGANTUAL", "ANNOYING", "FRESH", "UGLY", "EXPLOSIVE", "ORIGINAL", "ACTION-PACKED", "BLOCKBUSTER", "FAKE", "TERRIBLE TERRIBLE", "SPEEDY", "CAT-LIKE", "AMERICAN", "GROOVY", "SHITTY", "HAZARDOUS", "DESPICABLE", "EXCESSIVE", "NUCLEAR", "MAGICKA", "PARADOXAL", "STUPID", "PRACTICAL", "BOHEMIC"],
      e : ["HEROES", "EXPLOSIONS", "DESTRUCTION", "ACTION", "EVERYONE", "ASSHOLES", "GORE", "BLOOD", "YOU", "PIZZA", "DONUTS", "SOFT-DRINKS", "WEAPONRY", "KITTENS", "SHITTYFOX", "GAME PUBLISHERS", "APPLE FANBOYS", "TIME TRAVELERS", "TRAIN CONDUCTORS", "TRAIN SIMULATORS", "EVERYTHING", "PEOPLE", "GRENADES", "BOMBS", "BANNED SUBSTANCES", "NINJAS", "ALL HUMANS", "LEG WARMERS", "INTERNET EXPLORER", "DUBSTEP", "MOVIES", "BOOKS", "TV", "MOVIES", "GAME DEVELOPERS"]    
    },

    click : function() {
      a = this.generate(this.data.s.length);
      b = this.generate(this.data.m.length);
      c = this.generate(this.data.e.length);

      vent.trigger('meme:update', { 
        'title' : this.data.s[a] + " " + this.data.m[b] + " " + this.data.e[c] + '!',
        'img' : this.generate(Editor.data.pictureCollection.length),
        'font' : this.generate(Editor.data.fontCollection.length)
      });

      vent.trigger('editor:update');
    },

    generate : function(value) {
      return Math.round(Math.random() * value)
    }
  });

  /*
   * Do some stuff with the search button
   */
  App.Views.Share = Backbone.View.extend({
    el : '[data-type="1"]',

    events : {
      'click' : 'click'
    },

    click : function() {
      message.trigger({ text : 'Copy the URL of your browser!', timeout : '1750'});
    }
  });

  App.Views.Tweet = Backbone.View.extend({
    el : '[data-type="2"]',

    initialize : function() {
      vent.bind('meme:save', this.update, this);
      vent.bind('router:index', this.update, this);
    },

    update : function(model) {

      var title = model.title != undefined ? model.title : model.get('title');

      if (title != undefined) {
        title = title.replace(/\s/g, '+');
      } 

      this.$el.attr('href', 'http://twitter.com/share?url=&text=GrumpyCatHatesYou.com+says:+"'+ title + '"');
    }
  });

  /*
   * Trigger a custom message.
   */
  App.Views.Message = Backbone.View.extend({
    el : '.message',

    timeoutID : -1,

    trigger : function(args) {
      this.$el.html(args.text);
      this.$el.addClass('active');

      if (this.timeoutID != -1) {
        clearTimeout(this.timeoutID);
      }

      this.timeoutID = setTimeout(_.bind(function() {
        this.$el.removeClass('active');
        this.$el.html('');
      }, this), args.timeout); 
    }
  });


  /*--------------------------------------------------
   *
   * Start the App 
   */
  // Grumpy Cat meme
  var meme = new App.Views.Meme({ model : new App.Models.Meme() });

  // Message
  var message = new App.Views.Message();

  // Edit button
  new App.Views.Edit();

  // Random button
  var random = new App.Views.Random();

  // Tweet button
  var tweet = new App.Views.Tweet();

  // Share button
  var share = new App.Views.Share();

  // Editor
  var Editor = new App.Views.Editor();

  // Router
  new App.Router();
  Backbone.history.start({pushState: true, root: "/"});
})();