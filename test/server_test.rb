require 'minitest/autorun'
require 'minitest/pride'
require 'minitest/spec'
require 'rack/test'

require 'json'
require './app'

describe IdeaBox do
  include Rack::Test::Methods

  def app
    IdeaBox.new
  end

  def reset_database
    STORE.transaction do
      STORE["ideas"] = [
        { title: "Million-dollar idea", body: "Lorem ipsum…" },
        { title: "Hundred-dollar idea", body: "Lorem ipsum…" },
      ]
    end
  end

  def setup
    reset_database
  end

  it "works" do
    get '/api'
    assert last_response.ok?
  end

  it "provides and index of notes " do
    get '/api/ideas'
    ideas = JSON.parse(last_response.body)
    assert_equal 2, ideas.count
  end

  it "gets one note by id" do
    get '/api/ideas/1'
    idea = JSON.parse(last_response.body)
    assert idea["title"]
    assert_equal "Million-dollar idea", idea["title"]
  end

  it "can create a note with a POST request" do
    post '/api/ideas', { title: "New Note", body: "NEWNEWNEW" }
    idea = JSON.parse(last_response.body)
    assert_equal "New Note", idea["title"]
    assert_equal "NEWNEWNEW", idea["body"]
  end

  it "can update a note" do
    put '/api/ideas/1', { title: "Update", body: "UPDATE!!!" }
    idea = JSON.parse(last_response.body)
    assert_equal "Update", idea["title"]
    assert_equal "UPDATE!!!", idea["body"]
  end

  it "can delete a note" do
    delete '/api/ideas/1'
    get '/api/ideas'
    ideas = JSON.parse(last_response.body)
    assert_equal 1, ideas.count
  end

  it "blows up if you pit an ID that's not there" do
    get '/api/ideas/999'
    last_response.status == 500
  end
end