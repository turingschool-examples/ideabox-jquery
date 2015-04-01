$(document).ready(function () {
  fetchIdeas();
  bindCreateIdea();
});

function fetchIdeas() {
  $.getJSON('/api/ideas').then(function (ideas) {
    var renderedIdeas = ideas.map(renderIdea);
    renderedIdeas.forEach(bindDeleteEvent);
    renderedIdeas.forEach(bindEditEvent);
    renderedIdeas.forEach(bindUpdateEvent);
    $('#ideas').html(renderedIdeas);
  });
}

function renderIdea(idea, id) {
  return $('<div class="idea" data-id="' + id + '">' +
    '<h2>' + idea.title + '</h2>' +
    '<p>' + idea.body + '</p>' +
    '<div class="buttons">' +
      '<button class="edit">Edit</button>' +
      '<button class="delete">Delete</button>' +
      '<form class="edit-idea-form">' +
        '<label>Title</label>' +
        '<input type="text" placeholder="Title" class="idea-title">' +
        '<label>Body</label>' +
        '<input type="text" placeholder="Body" class="idea-body">' +
        '<input type="submit" class="update" value="Update Idea">' +
      '</form>' +
    '</div>' +
  '</div>');
}

function bindCreateIdea() {
  var $form = $('.new-idea-form');
  var $title = $form.find('.new-idea-title');
  var $body = $form.find('.new-idea-body');
  var $submit = $form.find('input[type="submit"]');

  $submit.on('click', function (event) {
    event.preventDefault();
    $.post('/api/ideas', {
      title: $title.val(),
      body: $body.val()
    }).then(appendIdea);
  });
}

function appendIdea(data) {
  var ideaMarkup = renderIdea(data);
  bindDeleteEvent(ideaMarkup);
  bindEditEvent(ideaMarkup);
  bindUpdateEvent(ideaMarkup);
  $(ideaMarkup).appendTo('#ideas');
}

function bindDeleteEvent(idea) {
  $(idea).find('.delete').on('click', function () {
    var $idea = $(this).parents('.idea');
    var id = $idea.data('id');
    $.ajax('/api/ideas/' + id, { method: 'delete'}).then(function () {
      $idea.remove();
    });
  });
}

function bindEditEvent(idea) {
  $(idea).find('.edit').on('click', function () {
    var $idea = $(this).parents('.idea');
    var $form = $(this).siblings('.edit-idea-form');

    if ($form.is(':hidden')) {
      var title = $idea.find('h2').text();
      var body = $idea.find('p').text();
      $form.find('.idea-title').val(title);
      $form.find('.idea-body').val(body);
    }

    $form.toggle();
  });
}

function bindUpdateEvent(idea) {
  $(idea).find('.update').on('click', function (event) {
    event.preventDefault();

    var $idea =$(this).parents('.idea');
    var id = $idea.data('id');

    var $title = $(this).siblings('.idea-title').val();
    var $body = $(this).siblings('.idea-body').val();

    $.ajax('/api/ideas/' + id, {
      method: 'put',
      data: {
        title: $title,
        body: $body
      }
    }).then(function (idea) {
      $idea.find('h2').text(idea.title);
      $idea.find('p').text(idea.body);
      $idea.find('form').hide();
    });
  });
}